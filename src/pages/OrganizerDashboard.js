import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/OrganizerDashboard.css";

const OrganizerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null); // store eventId for confirmation
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("organizerToken");
    if (!token) {
      setTimeout(() => navigate("/organizer-login"), 0);
      return;
    }

    const fetchEvents = async () => {
      try {
        const res = await fetch("https://caterrides.onrender.com/api/organizer/myevents", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setEvents(data);
        } else {
          console.error("Error fetching events:", data.message);
        }
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("organizerToken");
    localStorage.removeItem("organizerName");
    navigate("/organizer/login");
  };

  // DELETE event function
  const deleteEvent = async (eventId) => {
    const token = localStorage.getItem("organizerToken");
    try {
      const res = await fetch(`http://localhost:10000/api/organizer/deleteevent/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setEvents(events.filter((e) => e._id !== eventId)); // remove from UI
      } else {
        console.error("Delete failed:", data.message);
      }
    } catch (err) {
      console.error("Error deleting event:", err);
    } finally {
      setConfirmDelete(null); // close popup
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <button onClick={() => navigate("/post-event")}>Post Event</button>
        <button onClick={() => navigate("/organizer-profile")}>Profile</button>
        <button
          className="nav-btn logout-btn"
          onClick={handleLogout}
          style={{
            color: "white",
            backgroundColor: "gray",
            marginTop: "10px",
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h2>My Events</h2>
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Fetching events...</p>
          </div>
        )}
        <div className="events-list">
          {events.map((event) => (
            <div key={event._id} className="event-card">
              <h3>{event.title}</h3>
              <p><strong>Location:</strong> {event.location}</p>
              <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
              <p><strong>Vacancies:</strong> {event.vacancies}</p>
              <p><strong>Price:</strong> ₹{event.negotiatePrice}</p>

              <div className="event-actions">
                <button onClick={() => navigate(`/view-applicants/${event._id}`)}>
                  View Applicants
                </button>
                <button 
                  onClick={() => navigate(`/update-event/${event._id}`)} 
                  className="update-btn"
                >
                  Update
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => setConfirmDelete(event._id)} // ask confirmation
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Popup  for delete event*/}
      {confirmDelete && (
        <div className="confirm-popup">
          <div className="confirm-box">
            <p>Are you sure you want to delete this event?</p>
            <div className="popup-actions">
              <button 
                onClick={() => deleteEvent(confirmDelete)} 
                className="confirm-btn"
              >
                Yes, Delete
              </button>
              <button 
                onClick={() => setConfirmDelete(null)} 
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;

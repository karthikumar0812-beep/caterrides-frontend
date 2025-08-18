import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/OrganizerDashboard.css";

const OrganizerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
  const token = localStorage.getItem("organizerToken");
  if (!token) {
    // Give time for back navigation to work
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

   {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Fetching events...</p>
          </div>
        )}
  const handleLogout = () => {
    localStorage.removeItem("organizerToken");
    localStorage.removeItem("organizerName");
    navigate("/organizer/login");
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
        >
          Delete
        </button>
      </div>
    </div>
  ))}
</div>

      </div>
    </div>
  );
};

export default OrganizerDashboard;

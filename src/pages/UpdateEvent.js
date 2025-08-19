// UpdateEvent.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/UpdateEvent.css";

const UpdateEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    title: "",
    location: "",
    date: "",
    time: "",
    vacancies: "",
    negotiatePrice: "",
    description: ""
  });
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    const fetchEvent = async () => {
      const token = localStorage.getItem("organizerToken");
      try {
        const res = await fetch(`https://caterrides.onrender.com/api/organizer/eventdetails/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          // Parse the MongoDB date
          const eventDate = new Date(data.date);
          
          // Format the date for input field (YYYY-MM-DD)
          const formattedDate = eventDate.toISOString().split('T')[0];
          
          // Format the time for input field (HH:MM)
          const hours = eventDate.getHours().toString().padStart(2, '0');
          const minutes = eventDate.getMinutes().toString().padStart(2, '0');
          const formattedTime = `${hours}:${minutes}`;
          
          setEventData({
            title: data.title || "",
            location: data.location || "",
            date: formattedDate,
            time: formattedTime,
            vacancies: data.vacancies || "",
            negotiatePrice: data.negotiatePrice || "",
            description: data.description || ""
          });
          
          // Set applicants if they exist
          if (data.applicants && Array.isArray(data.applicants)) {
            setApplicants(data.applicants);
          }
        } else {
          showNotification(data.message || "Failed to fetch event", "error");
          setTimeout(() => navigate("/organizer-dashboard"), 2000);
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        showNotification("Network error. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, navigate]);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 4000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("organizerToken");
    
    // Combine date and time into a single ISO string for the backend
    const dateTime = new Date(`${eventData.date}T${eventData.time}`);
    const isoString = dateTime.toISOString();

    try {
      const res = await fetch(`https://caterrides.onrender.com/api/organizer/updateevent/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...eventData,
          date: isoString
        })
      });

      const data = await res.json();
      if (res.ok) {
        showNotification("Event updated successfully!", "success");
        setTimeout(() => navigate("/organizer-dashboard"), 1500);
      } else {
        showNotification(data.message || "Update failed", "error");
      }
    } catch (err) {
      console.error("Error updating event:", err);
      showNotification("Network error. Please try again.", "error");
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading event details...</p>
    </div>
  );

  return (
    <div className="update-event-container">
      <div className={`notification ${notification.show ? 'show' : ''} ${notification.type}`}>
        <i className={`icon ${notification.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'}`}></i>
        <span>{notification.message}</span>
        <button className="close-btn" onClick={() => setNotification({ show: false, message: "", type: "" })}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="form-card">
        <div className="form-header">
          <h2>Update Event</h2>
          <p>Edit your event details below</p>
        </div>

        <form className="update-event-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Event Title</label>
            <input
              id="title"
              type="text"
              name="title"
              value={eventData.title}
              onChange={handleChange}
              required
              placeholder="Enter event title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              name="location"
              value={eventData.location}
              onChange={handleChange}
              required
              placeholder="Enter event location"
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Event Date</label>
            <input
              id="date"
              type="date"
              name="date"
              value={eventData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">Event Time</label>
            <input
              id="time"
              type="time"
              name="time"
              value={eventData.time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="vacancies">Vacancies</label>
            <input
              id="vacancies"
              type="number"
              name="vacancies"
              value={eventData.vacancies}
              onChange={handleChange}
              required
              min="1"
              placeholder="Number of available spots"
            />
          </div>

          <div className="form-group">
            <label htmlFor="negotiatePrice">Negotiable Price ($)</label>
            <input
              id="negotiatePrice"
              type="number"
              name="negotiatePrice"
              value={eventData.negotiatePrice}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="Enter negotiable price"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={eventData.description}
              onChange={handleChange}
              placeholder="Describe your event"
              rows="4"
            />
          </div>

          {applicants.length > 0 && (
            <div className="applicants-section">
              <h3>Applicants ({applicants.length})</h3>
              {applicants.map((applicant, index) => (
                <div key={index} className="applicant-card">
                  <h4>Applicant {index + 1}</h4>
                  <p><strong>Name:</strong> {applicant.name || "Not provided"}</p>
                  <p><strong>Contact:</strong> {applicant.contact || "Not provided"}</p>
                  <p><strong>Status:</strong> {applicant.status || "Pending"}</p>
                </div>
              ))}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Update Event
            </button>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => navigate("/organizer-dashboard")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateEvent;
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const UpdateEvent = () => {
  const { eventId } = useParams(); // eventId from URL
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    title: "",
    location: "",
    date: "",
    vacancies: "",
    negotiatePrice: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      const token = localStorage.getItem("organizerToken");
      try {
        const res = await fetch(`http://localhost:10000/api/organizer/eventdetails/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setEventData({
            title: data.title,
            location: data.location,
            date: data.date.split("T")[0], // yyyy-mm-dd for <input type="date">
            vacancies: data.vacancies,
            negotiatePrice: data.negotiatePrice
          });
        } else {
          alert(data.message || "Failed to fetch event");
          navigate("/organizer-dashboard");
        }
      } catch (err) {
        console.error("Error fetching event:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, navigate]);

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

    try {
      const res = await fetch(`http://localhost:10000/api/organizer/updateevent/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });

      const data = await res.json();
      if (res.ok) {
        alert("Event updated successfully!");
        navigate("/organizer-dashboard");
      } else {
        alert(data.message || "Update failed");
      }
    } catch (err) {
      console.error("Error updating event:", err);
    }
  };

  if (loading) return <p>Loading event details...</p>;

  return (
    <div className="update-event-container">
      <h2>Update Event</h2>
      <form className="update-event-form" onSubmit={handleSubmit}>
        <label>Title:</label>
        <input
          type="text"
          name="title"
          value={eventData.title}
          onChange={handleChange}
          required
        />

        <label>Location:</label>
        <input
          type="text"
          name="location"
          value={eventData.location}
          onChange={handleChange}
          required
        />

        <label>Date:</label>
        <input
          type="date"
          name="date"
          value={eventData.date}
          onChange={handleChange}
          required
        />

        <label>Vacancies:</label>
        <input
          type="number"
          name="vacancies"
          value={eventData.vacancies}
          onChange={handleChange}
          required
        />

        <label>
          Negotiable Price:
          <input
            type="checkbox"
            name="negotiatePrice"
            checked={eventData.negotiatePrice}
            onChange={handleChange}
          />
        </label>

        <button type="submit">Update Event</button>
        <button type="button" onClick={() => navigate("/organizer-dashboard")}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default UpdateEvent;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/Viewevent.css";

const Viewevent = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [organizer, setOrganizer] = useState(null);

  useEffect(() => {
    const fetchEventInfo = async () => {
      try {
        const token = localStorage.getItem("riderToken"); // rider authentication
        const res = await axios.get(
          `https://caterrides.onrender.com/api/rider/eventinfo/${eventId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setEvent(res.data.event);
        setOrganizer(res.data.organizer);
      } catch (error) {
        console.error("Error fetching event info:", error);
      }
    };

    fetchEventInfo();
  }, [eventId]);

  if (!event || !organizer) {
    return <div className="loading">Loading event details...</div>;
  }

  return (
    <div className="eventinfo-container">
      <div className="event-card">
        <h2 className="event-title">{event.title}</h2>
        <p className="event-desc">{event.description}</p>

        <div className="event-details">
          <p><strong>Location:</strong> {event.location}</p>
          <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
          <p><strong>Vacancies:</strong> {event.vacancies}</p>
          <p><strong>Pay:</strong> ₹{event.negotiatePrice}</p>
        </div>
      </div>

      <div className="organizer-card">
        <h3 className="organizer-title">Organizer Details</h3>
        <p><strong>Name:</strong> {organizer.name}</p>
        <p><strong>Organization:</strong> {organizer.organizationName}</p>
        <p><strong>Email:</strong> {organizer.email}</p>
        <p><strong>📞 Phone:</strong> {organizer.phone}</p>
      </div>
    </div>
  );
};

export default Viewevent;

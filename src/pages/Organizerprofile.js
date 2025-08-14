import React, { useEffect, useState } from "react";
import "../styles/Organizerprofile.css";

const Organizerprofile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("organizerToken");
        const response = await fetch(
          "https://caterrides.onrender.com/api/organizer/profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);
  
   // ✅ Show loading spinner while loading
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  // ✅ Show error if no profile
  if (!profile) {
    return <p className="error-text">No profile data found.</p>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>{profile.organizationName}</h1>
        <div className="profile-details">
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Phone:</strong> {profile.phone}</p>
          <p><strong>Email:</strong> {profile.email}</p>
        </div>
      </div>

      <div className="events-section">
        <h2>
          Events Posted{" "}
          <span className="event-count">
            {profile.eventsPosted ? profile.eventsPosted.length : 0}
          </span>
        </h2>

        {profile.eventsPosted && profile.eventsPosted.length > 0 ? (
          <table className="events-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {profile.eventsPosted.map((event, idx) => (
                <tr key={idx}>
                  <td>{event.title}</td>
                  <td>{new Date(event.date).toLocaleDateString()}</td>
                  <td>{event.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-events">No events posted yet.</p>
        )}
      </div>
    </div>
  );
};

export default Organizerprofile;

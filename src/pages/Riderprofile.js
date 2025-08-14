import React, { useEffect, useState } from "react";
import "../styles/RiderProfile.css";
import { FaEnvelope, FaPhone, FaUser, FaStar, FaRupeeSign, FaClipboardCheck } from "react-icons/fa";

const API_PROFILE = "https://caterrides.onrender.com/api/rider/profile";

const RiderProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendDown, setBackendDown] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("riderToken");
        if (!token) return;

        const res = await fetch(API_PROFILE, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error();
        const data = await res.json();
        setProfile(data);
      } catch {
        setBackendDown(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="profile-loading">Loading profile...</div>;
  if (backendDown) return <div className="profile-error">Failed to load profile</div>;

  const initials = profile.name ? profile.name.charAt(0).toUpperCase() : "R";

  return (
    <div className="profile-wrapper">
      <div className="profile-glass-card">
        <div className="profile-left">
          <div className="avatar-circle">{initials}</div>
          <h2 className="rider-name"><FaUser /> {profile.name}</h2>
          <p><FaEnvelope /> {profile.email}</p>
          <p><FaPhone /> {profile.phone}</p>
          <p><strong>Age:</strong> {profile.age}</p>
        </div>

        <div className="profile-right">
          <div className="stat-card green">
            <FaClipboardCheck size={22} />
            <div>
              <span className="stat-label">Serves Completed</span>
              <span className="stat-value">{profile.servesCompleted}</span>
            </div>
          </div>
          <div className="stat-card blue">
            <FaRupeeSign size={22} />
            <div>
              <span className="stat-label">Earnings</span>
              <span className="stat-value">₹{profile.earnings}</span>
            </div>
          </div>
          <div className="stat-card yellow">
            <FaStar size={22} />
            <div>
              <span className="stat-label">Rating</span>
              <span className="stat-value">{profile.rating} / 5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderProfile;

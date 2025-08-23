import React, { useEffect, useState } from "react";
import { FaEnvelope, FaPhone, FaUser, FaStar, FaRupeeSign, FaClipboardCheck, FaMotorcycle } from "react-icons/fa";
import "../styles/RiderProfile.css";

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

  if (loading) return (
    <div className="profile-loading">
      <div className="loading-spinner"></div>
      <p>Loading your profile...</p>
    </div>
  );
  
  if (backendDown) return (
    <div className="profile-error">
      <div className="error-icon">⚠️</div>
      <h2>Connection Issue</h2>
      <p>Failed to load profile. Please check your connection and try again.</p>
      <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
    </div>
  );

  const initials = profile.name ? profile.name.charAt(0).toUpperCase() : "R";

  return (
    <div className="rider-profile-container">
      <div className="profile-header">
        <h1>Rider Profile</h1>
        <div className="header-icon">
          <FaMotorcycle />
        </div>
      </div>
      
      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {initials}
            </div>
            <div className="online-status"></div>
          </div>
          
          <div className="profile-info">
            <h2 className="rider-name">
              <FaUser className="info-icon" /> 
              {profile.name}
            </h2>
            
            <div className="info-grid">
              <div className="info-item">
                <FaEnvelope className="info-icon" />
                <span>{profile.email}</span>
              </div>
              
              <div className="info-item">
                <FaPhone className="info-icon" />
                <span>
                  <a href={`tel:${profile.phone}`} className="phone-link">
                    {profile.phone}
                  </a>
                </span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Age:</span>
                <span>{profile.age}</span>
              </div>
              
            </div>
          </div>
        </div>
        
        <div className="stats-container">
          <div className="stat-card completed-rides">
            <div className="stat-icon">
              <FaClipboardCheck />
            </div>
            <div className="stat-details">
              <h3>{profile.servesCompleted}</h3>
              <p>Completed Serves</p>
            </div>
          </div>
          
          <div className="stat-card earnings">
            <div className="stat-icon">
              <FaRupeeSign />
            </div>
            <div className="stat-details">
              <h3>₹{profile.earnings}</h3>
              <p>Total Earnings</p>
            </div>
          </div>
          
          <div className="stat-card rating">
            <div className="stat-icon">
              <FaStar />
            </div>
            <div className="stat-details">
              <h3>{profile.rating}/5</h3>
              <p>Average Rating</p>
            </div>
          </div>
        </div>
        
        <div className="performance-section">
          <h3>Performance Overview</h3>
          <div className="performance-bars">
            <div className="performance-item">
              <span>Customer Satisfaction</span>
              <div className="bar-container">
                <div 
                  className="bar-fill satisfaction" 
                  style={{width: `${(profile.rating / 5) * 100}%`}}
                ></div>
              </div>
            </div>
            
            <div className="performance-item">
              <span>Serves Completion</span>
              <div className="bar-container">
                <div 
                  className="bar-fill completion" 
                  style={{width: `${Math.min(profile.servesCompleted / 50 * 100, 100)}%`}}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderProfile;
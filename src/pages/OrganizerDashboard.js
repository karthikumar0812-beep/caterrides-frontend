import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/OrganizerDashboard.css";

const OrganizerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("organizerToken");
    if (!token) {
      navigate("/organizer-login", { replace: true });
      return;
    }
  }, [navigate]);

  // Fetch events with error handling
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("organizerToken");
      
      const res = await fetch("https://caterrides.onrender.com/api/organizer/myevents", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch events: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err.message || "Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleLogout = () => {
    localStorage.removeItem("organizerToken");
    localStorage.removeItem("organizerName");
    navigate("/organizer/login");
  };

  const deleteEvent = async (eventId) => {
    const token = localStorage.getItem("organizerToken");
    setDeletingId(eventId);
    
    try {
      const res = await fetch(`https://caterrides.onrender.com/api/organizer/deleteevent/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete event");
      }
      
      setEvents(events.filter((e) => e._id !== eventId));
    } catch (err) {
      console.error("Error deleting event:", err);
      setError(err.message || "Failed to delete event. Please try again.");
    } finally {
      setConfirmDelete(null);
      setDeletingId(null);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const refreshEvents = () => {
    fetchEvents();
  };

  return (
    <div className={`dashboard-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>{sidebarCollapsed ? "C" : "CaterRides"}</h2>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            onClick={() => navigate("/post-event")}
            className={`nav-btn ${isActive('/post-event') ? 'active' : ''}`}
            aria-label="Post new event"
          >
            <span className="nav-icon">+</span>
            {!sidebarCollapsed && <span>Post Event</span>}
          </button>
          
          <button 
            onClick={() => navigate("/organizer-profile")}
            className={`nav-btn ${isActive('/organizer-profile') ? 'active' : ''}`}
            aria-label="View profile"
          >
            <span className="nav-icon">👤</span>
            {!sidebarCollapsed && <span>Profile</span>}
          </button>
          
          <button 
            onClick={() => navigate("/organizer-dashboard")}
            className={`nav-btn ${isActive('/organizer-dashboard') ? 'active' : ''}`}
            aria-label="View events"
          >
            <span className="nav-icon">📋</span>
            {!sidebarCollapsed && <span>My Events</span>}
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button
            className="nav-btn logout-btn"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <span className="nav-icon">🚪</span>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-header">
          <button 
            className="mobile-sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <h2>My Events</h2>
          <div className="header-actions">
            <button 
              onClick={refreshEvents}
              className="refresh-btn"
              disabled={loading}
              aria-label="Refresh events"
            >
              ⟳
            </button>
            <button 
              onClick={() => navigate("/post-event")}
              className="primary-btn"
            >
              + New Event
            </button>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError(null)} aria-label="Dismiss error">×</button>
          </div>
        )}
        
        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your events...</p>
          </div>
        )}
        
        {/* Events List */}
        {!loading && (
          <div className="events-list">
            {events.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h3>No events yet</h3>
                <p>Get started by posting your first event!</p>
                <button 
                  onClick={() => navigate("/post-event")}
                  className="primary-btn"
                >
                  Post Your First Event
                </button>
              </div>
            ) : (
              <>
                <div className="events-stats">
                  <p>Total Events: <strong>{events.length}</strong></p>
                </div>
                {events.map((event) => (
                  <div key={event._id} className="event-card">
                    <div className="event-header">
                      <h3>{event.title}</h3>
                      <span className={`event-status ${event.vacancies > 0 ? 'active' : 'full'}`}>
                        {event.vacancies > 0 ? 'Active' : 'Full'}
                      </span>
                    </div>
                    
                    <div className="event-details">
                      <div className="detail-item">
                        <span className="detail-icon">📍</span>
                        <span>{event.location}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-icon">📅</span>
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-icon">👥</span>
                        <span>{event.vacancies} vacancies</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-icon">💰</span>
                        <span>₹{event.negotiatePrice}</span>
                      </div>
                    </div>

                    <div className="event-actions">
                      <button 
                        onClick={() => navigate(`/view-applicants/${event._id}`)}
                        className="action-btn applicants-btn"
                      >
                        View Applicants
                      </button>
                      <button 
                        onClick={() => navigate(`/update-event/${event._id}`)} 
                        className="action-btn update-btn"
                      >
                        Edit
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => setConfirmDelete(event._id)}
                        disabled={deletingId === event._id}
                      >
                        {deletingId === event._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this event? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                onClick={() => deleteEvent(confirmDelete)} 
                className="danger-btn"
                disabled={deletingId === confirmDelete}
              >
                {deletingId === confirmDelete ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button 
                onClick={() => setConfirmDelete(null)} 
                className="secondary-btn"
                disabled={deletingId === confirmDelete}
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
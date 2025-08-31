import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaBars,
  FaCalendarPlus,
  FaUser,
  FaClipboardList,
  FaSignOutAlt,
  FaSyncAlt,
  FaEdit,
  FaTrash,
  FaUsers,
  FaMapMarkerAlt,
  FaRupeeSign,
} from "react-icons/fa";
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

      const res = await fetch(
        "https://caterrides.onrender.com/api/organizer/myevents",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
      const res = await fetch(
        `https://caterrides.onrender.com/api/organizer/deleteevent/${eventId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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

  const isActive = (path) => location.pathname === path;

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className={`dashboard-container ${sidebarCollapsed ? "collapsed" : ""}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>{sidebarCollapsed ? "CR" : "CaterRides"}</h2>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label="Toggle sidebar"
          >
            <FaBars />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            onClick={() => navigate("/post-event")}
            className={`nav-btn ${isActive("/post-event") ? "active" : ""}`}
          >
            <FaCalendarPlus className="nav-icon" />
            {!sidebarCollapsed && <span>Post Event</span>}
          </button>

          <button
            onClick={() => navigate("/organizer-profile")}
            className={`nav-btn ${isActive("/organizer-profile") ? "active" : ""}`}
          >
            <FaUser className="nav-icon" />
            {!sidebarCollapsed && <span>Profile</span>}
          </button>

          <button
            onClick={() => navigate("/organizer-dashboard")}
            className={`nav-btn ${isActive("/organizer-dashboard") ? "active" : ""}`}
          >
            <FaClipboardList className="nav-icon" />
            {!sidebarCollapsed && <span>My Events</span>}
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-btn logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="nav-icon" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header">
          <h2>👋 Welcome back, {localStorage.getItem("organizerName") || "Organizer"}</h2>
          <div className="header-actions">
            <button onClick={fetchEvents} className="refresh-btn" disabled={loading}>
              <FaSyncAlt />
            </button>
            <button onClick={() => navigate("/post-event")} className="primary-btn">
              + New Event
            </button>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="skeleton-list">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton-card"></div>
            ))}
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
                <button onClick={() => navigate("/post-event")} className="primary-btn">
                  Post Your First Event
                </button>
              </div>
            ) : (
              <>
                <div className="events-stats">
                  <p>
                    Total Events: <strong>{events.length}</strong>
                  </p>
                </div>
                {events.map((event) => (
                  <div key={event._id} className="event-card">
                    <div className="event-header">
                      <h3>{event.title}</h3>
                      <span
                        className={`event-status ${event.vacancies > 0 ? "active" : "full"}`}
                      >
                        {event.vacancies > 0 ? "Active" : "Full"}
                      </span>
                    </div>

                    <div className="event-details">
                      <div className="detail-item">
                        <FaMapMarkerAlt /> {event.location}
                      </div>
                      <div className="detail-item">
                        📅 {formatDate(event.date)}
                      </div>
                      <div className="detail-item">
                        <FaUsers /> {event.vacancies} vacancies
                      </div>
                      <div className="detail-item">
                        <FaRupeeSign /> {event.negotiatePrice}
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
                        <FaEdit /> Edit
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => setConfirmDelete(event._id)}
                        disabled={deletingId === event._id}
                      >
                        {deletingId === event._id ? "Deleting..." : <><FaTrash /> Delete</>}
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Deletion</h3>
            <p>This action cannot be undone. Are you sure?</p>
            <div className="modal-actions">
              <button
                onClick={() => deleteEvent(confirmDelete)}
                className="danger-btn"
                disabled={deletingId === confirmDelete}
              >
                {deletingId === confirmDelete ? "Deleting..." : "Yes, Delete"}
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

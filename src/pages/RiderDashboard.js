import React, { useEffect, useState } from "react";
import "../styles//RiderDashboard.css";
import {
  FaBars,
  FaTimes,
  FaInfoCircle,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUpAlt,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaMoneyBillWave,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_EVENTS = "https://caterrides.onrender.com/api/rider/events";
const APPLY_ENDPOINT = "https://caterrides.onrender.com/api/rider/apply";

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const RiderDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendDown, setBackendDown] = useState(false);
  const [applyingId, setApplyingId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [riderName] = useState(localStorage.getItem("riderName") || "");
  const [openDescriptionId, setOpenDescriptionId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const [place, setPlace] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [order, setOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  const navigate = useNavigate();

  const fetchEvents = async () => {
    setLoading(true);
    setBackendDown(false);
    try {
      const url = new URL(API_EVENTS);
      if (place) url.searchParams.append("place", place);
      if (sortBy) url.searchParams.append("sortBy", sortBy);
      if (order) url.searchParams.append("order", order);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : data.events || []);
    } catch {
      setBackendDown(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleApply = async (eventId) => {
    const token = localStorage.getItem("riderToken");
    if (!token) {
      navigate("/rider/login");
      return;
    }

    setApplyingId(eventId);

    try {
      const res = await fetch(`${APPLY_ENDPOINT}/${eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMessage(data.message || "Applied successfully!");
        setStatusType("success");
        setShowStatus(true);
        setEvents((prev) =>
          prev.map((ev) =>
            ev._id === eventId
              ? { ...ev, vacancies: Math.max(0, (ev.vacancies || 0) - 1) }
              : ev
          )
        );

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setShowStatus(false);
        }, 5000);
      } else {
        setStatusMessage(data.message || "Apply failed");
        setStatusType("error");
        setShowStatus(true);

        // Auto-hide error message after 5 seconds
        setTimeout(() => {
          setShowStatus(false);
        }, 5000);
      }
    } catch {
      setStatusMessage("Backend is down");
      setStatusType("error");
      setShowStatus(true);
    } finally {
      setApplyingId(null);
    }
  };

  const toggleDescription = (id) => {
    setOpenDescriptionId((prev) => (prev === id ? null : id));
  };

  const handleLogout = () => {
    localStorage.removeItem("riderToken");
    localStorage.removeItem("riderName");
    window.dispatchEvent(new Event("riderNameChanged"));
    navigate("/rider/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarOpen && !event.target.closest(".dashboard-sidebar")) {
        setSidebarOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [sidebarOpen]);

  return (
    <div className={`dashboard-wrapper ${sidebarOpen ? "sidebar-open" : ""}`}>
      {/* Status Notification - Fixed at top */}
      {showStatus && (
        <div
          className={`status-notification ${statusType} ${
            showStatus ? "show" : ""
          }`}
        >
          <div className="notification-content">
            <div className="notification-icon">
              {statusType === "success" ? (
                <FaCheckCircle />
              ) : (
                <FaExclamationTriangle />
              )}
            </div>
            <div className="notification-text">
              <h4>{statusType === "success" ? "Success!" : "Error"}</h4>
              <p>{statusMessage}</p>
            </div>
            <button
              onClick={() => setShowStatus(false)}
              className="notification-close"
            >
              <FaTimes />
            </button>
            <img src="/cbe-template.png" alt="cbe" className="cbe-img" />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="dashboard-sidebar" aria-label="Sidebar">
        <div className="sidebar-top">
          <div className="profile-section">
            <div className="profile-circle">
              {riderName ? riderName.charAt(0).toUpperCase() : "R"}
            </div>
            <div className="profile-info">
              <h3 className="rider-name">{riderName || "Rider"}</h3>
              <p className="rider-role">Trusted Rider</p>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button
            className="nav-btn"
            onClick={() => navigate("/rider/profile")}
          >
            <span className="nav-icon">👤</span>
            <span className="nav-text">Profile</span>
          </button>
          <button
            className="nav-btn"
            onClick={() => navigate("/rider/applications")}
          >
            <span className="nav-icon">📋</span>
            <span className="nav-text">Applications</span>
          </button>

          <button className="nav-btn logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Logout</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <p>
            Need help? <a href="/support">Contact Support</a>
          </p>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay">
          <aside
            className="dashboard-sidebar mobile-sidebar"
            aria-label="Mobile sidebar"
          >
            <div className="sidebar-top">
              <div className="profile-section">
                <div className="profile-circle">
                  {riderName ? riderName.charAt(0).toUpperCase() : "R"}
                </div>
                <div className="profile-info">
                  <h3 className="rider-name">{riderName || "Rider"}</h3>
                </div>
              </div>
              <button
                className="sidebar-close"
                onClick={toggleSidebar}
                aria-label="Close sidebar"
              >
                <FaTimes />
              </button>
            </div>
            <nav className="sidebar-nav">
              <button
                className="nav-btn"
                onClick={() => navigate("/rider/profile")}
              >
                <span className="nav-icon">👤</span>
                <span className="nav-text">Profile</span>
              </button>
              <button
                className="nav-btn"
                onClick={() => navigate("/rider/applications")}
              >
                <span className="nav-icon">📋</span>
                <span className="nav-text">Applications</span>
              </button>
              <button
                className="nav-btn"
                onClick={() => navigate("/rider/earnings")}
              >
                <span className="nav-icon">💰</span>
                <span className="nav-text">Earnings</span>
              </button>
              <button className="nav-btn logout-btn" onClick={handleLogout}>
                <span className="nav-icon">🚪</span>
                <span className="nav-text">Logout</span>
              </button>
            </nav>
          </aside>
        </div>
      )}

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <button
              className="mobile-toggle"
              onClick={toggleSidebar}
              aria-label="Open sidebar"
            >
              <FaBars />
            </button>
            <div className="header-title">
              <h1>Available Events</h1>
            </div>
          </div>
          <div className="header-right">
            <div className="welcome-text">
              <span>Welcome back, </span>
              <span className="welcome-name">{riderName}</span>
            </div>
            <div className="notification-bell">🔔</div>
          </div>
        </header>

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Finding available events...</p>
          </div>
        )}

        {backendDown && !loading && (
          <div className="error-container">
            <div className="error-icon">🔌</div>
            <h3>Service temporarily unavailable</h3>
            <p>
              We're having trouble connecting to our servers. Please try again
              later.
            </p>
            <button onClick={fetchEvents} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        {!backendDown && !loading && events.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No events available</h3>
            <p>Check back later for new delivery opportunities in your area.</p>
            <button onClick={fetchEvents} className="retry-btn">
              Refresh
            </button>
          </div>
        )}

        {/* Search and Filters Section */}
        {!backendDown && !loading && events.length > 0 && (
          <div className="filters-container">
            <div className="search-section">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by location..."
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  className="search-input"
                />
                <button onClick={fetchEvents} className="search-btn">
                  Search
                </button>
              </div>

              <button
                className="filter-toggle-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>
            <div className="image-row">
              <div className="image-card">
                <img src="/cbe-template.png" alt="cbe" className="cbe-img" />
                <p>Coimbatore Template</p>
              </div>
            </div>

            {showFilters && (
              <div className="advanced-filters">
                <div className="filter-group">
                  <label>Sort By</label>
                  <div className="filter-options">
                    <button
                      className={`filter-option ${
                        sortBy === "date" ? "active" : ""
                      }`}
                      onClick={() => setSortBy("date")}
                    >
                      <FaCalendarAlt /> Date
                    </button>
                    <button
                      className={`filter-option ${
                        sortBy === "price" ? "active" : ""
                      }`}
                      onClick={() => setSortBy("price")}
                    >
                      <FaMoneyBillWave /> Price
                    </button>
                  </div>
                </div>

                <div className="filter-group">
                  <label>Order</label>
                  <div className="filter-options">
                    <button
                      className={`filter-option ${
                        order === "asc" ? "active" : ""
                      }`}
                      onClick={() => setOrder("asc")}
                    >
                      <FaSortAmountDown /> Ascending
                    </button>
                    <button
                      className={`filter-option ${
                        order === "desc" ? "active" : ""
                      }`}
                      onClick={() => setOrder("desc")}
                    >
                      <FaSortAmountUpAlt /> Descending
                    </button>
                  </div>
                </div>

                <button onClick={fetchEvents} className="apply-filters-btn">
                  Apply Filters
                </button>
              </div>
            )}
          </div>
        )}

        {!backendDown && !loading && events.length > 0 && (
          <section className="events-section">
            <div className="section-header">
              <h2>Available Events ({events.length})</h2>
              <div className="view-toggle">
                <button className="view-option active">Grid</button>
                <button className="view-option">List</button>
              </div>
            </div>

            <div className="events-grid" role="list">
              {events.map((ev) => (
                <article
                  key={ev._id}
                  className={`event-card ${
                    (ev.vacancies ?? 0) <= 0 ? "event-full" : ""
                  }`}
                  role="listitem"
                >
                  {(ev.vacancies ?? 0) <= 0 && (
                    <div className="full-event-overlay">
                      <div className="full-event-tag">Fully Booked</div>
                    </div>
                  )}

                  <div className="card-gradient-border">
                    <div className="card-content">
                      <div className="card-header">
                        <h3>{ev.title}</h3>
                        <div className="price-badge">
                          ₹{ev.negotiatePrice ?? "N/A"}
                        </div>
                      </div>

                      <div className="card-location">
                        <FaMapMarkerAlt />
                        <span>{ev.location}</span>
                      </div>

                      <div className="card-details">
                        <div className="detail-item">
                          <FaCalendarAlt />
                          <span>{formatDate(ev.date)}</span>
                        </div>
                        <div className="detail-item">
                          <FaUsers />
                          <span>{ev.vacancies ?? "N/A"} vacancies left</span>
                        </div>
                      </div>

                      <div className="card-description">
                        <p>
                          {ev.description?.substring(0, 100)}
                          {ev.description?.length > 100 ? "..." : ""}
                        </p>
                        <button
                          className="read-more-btn"
                          onClick={() => toggleDescription(ev._id)}
                        >
                          <FaInfoCircle /> Read more
                        </button>
                      </div>

                      <div className="card-actions">
                        <button
                          className="apply-btn"
                          onClick={() => handleApply(ev._id)}
                          disabled={
                            applyingId === ev._id || (ev.vacancies ?? 0) <= 0
                          }
                        >
                          {applyingId === ev._id
                            ? "Applying..."
                            : (ev.vacancies ?? 0) > 0
                            ? "Apply Now"
                            : "Fully Booked"}
                        </button>
                        <button className="share-btn">
                          <FaExternalLinkAlt />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {openDescriptionId && (
          <div
            className="modal-overlay"
            onClick={() => setOpenDescriptionId(null)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="close-modal"
                onClick={() => setOpenDescriptionId(null)}
              >
                <FaTimes />
              </button>
              <h2>
                {events.find((ev) => ev._id === openDescriptionId)?.title}
              </h2>
              <div className="modal-location">
                <FaMapMarkerAlt />
                <span>
                  {events.find((ev) => ev._id === openDescriptionId)?.location}
                </span>
              </div>
              <div className="modal-description">
                <h4>Description</h4>
                <p>
                  {events.find((ev) => ev._id === openDescriptionId)
                    ?.description || "No description available."}
                </p>
              </div>
              <div className="modal-actions">
                <button
                  className="apply-btn"
                  onClick={() => {
                    handleApply(openDescriptionId);
                    setOpenDescriptionId(null);
                  }}
                  disabled={
                    applyingId === openDescriptionId ||
                    (events.find((ev) => ev._id === openDescriptionId)
                      ?.vacancies ?? 0) <= 0
                  }
                >
                  {applyingId === openDescriptionId
                    ? "Applying..."
                    : (events.find((ev) => ev._id === openDescriptionId)
                        ?.vacancies ?? 0) > 0
                    ? "Apply for this Event"
                    : "Fully Booked"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RiderDashboard;

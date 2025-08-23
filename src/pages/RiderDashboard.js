import React, { useEffect, useState } from "react";
import { FaBars, FaTimes, FaInfoCircle, FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUpAlt } from "react-icons/fa";
import "../styles/RiderDashboard.css";
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
        setEvents((prev) =>
          prev.map((ev) =>
            ev._id === eventId
              ? { ...ev, vacancies: Math.max(0, (ev.vacancies || 0) - 1) }
              : ev
          )
        );
      } else {
        setStatusMessage(data.message || "Apply failed");
        setStatusType("error");
      }
    } catch {
      setStatusMessage("Backend is down");
      setStatusType("error");
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
      {/* Desktop Sidebar (always visible on large screens) */}
      <aside className="dashboard-sidebar" aria-label="Sidebar">
        <div className="sidebar-top">
          <div className="profile-circle">
            {riderName ? riderName.charAt(0).toUpperCase() : "R"}
          </div>
          <h3 className="rider-name">{riderName || "Rider"}</h3>
        </div>
        <nav className="sidebar-nav">
          <button
            className="nav-btn"
            onClick={() => navigate("/rider/profile")}
          >
            Profile
          </button>
          <button
            className="nav-btn"
            onClick={() => navigate("/rider/applications")}
          >
            Application Status
          </button>
          <button className="nav-btn logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay">
          <aside
            className="dashboard-sidebar mobile-sidebar"
            aria-label="Mobile sidebar"
          >
            <div className="sidebar-top">
              <button
                className="sidebar-close"
                onClick={toggleSidebar}
                aria-label="Close sidebar"
              >
                <FaTimes />
              </button>
              <div className="profile-circle">
                {riderName ? riderName.charAt(0).toUpperCase() : "R"}
              </div>
              <h3 className="rider-name">{riderName || "Rider"}</h3>
            </div>
            <nav className="sidebar-nav">
              <button
                className="nav-btn"
                onClick={() => navigate("/rider/profile")}
              >
                Profile
              </button>
              <button
                className="nav-btn"
                onClick={() => navigate("/rider/applications")}
              >
                Application Status
              </button>
              <button className="nav-btn logout-btn" onClick={handleLogout}>
                Logout
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
            <h2>Available Events</h2>
          </div>
        </header>

        {statusMessage && (
          <div className={`status-message ${statusType}`}>{statusMessage}</div>
        )}

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Fetching events...</p>
          </div>
        )}

        {backendDown && !loading && <p>Backend is down</p>}
        {!backendDown && !loading && events.length === 0 && <p>No events.</p>}
        
        {/* 🔎 Enhanced Filters + Search */}
        <div className="filters-container">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by location..."
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              className="search-input"
            />
          </div>
          
          <button 
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          {showFilters && (
            <div className="advanced-filters">
              <div className="filter-group">
                <label>Sort By</label>
                <div className="filter-options">
                  <button 
                    className={`filter-option ${sortBy === 'date' ? 'active' : ''}`}
                    onClick={() => setSortBy('date')}
                  >
                    Date
                  </button>
                  <button 
                    className={`filter-option ${sortBy === 'price' ? 'active' : ''}`}
                    onClick={() => setSortBy('price')}
                  >
                    Price
                  </button>
                </div>
              </div>
              
              <div className="filter-group">
                <label>Order</label>
                <div className="filter-options">
                  <button 
                    className={`filter-option ${order === 'asc' ? 'active' : ''}`}
                    onClick={() => setOrder('asc')}
                  >
                    <FaSortAmountDown /> Ascending
                  </button>
                  <button 
                    className={`filter-option ${order === 'desc' ? 'active' : ''}`}
                    onClick={() => setOrder('desc')}
                  >
                    <FaSortAmountUpAlt /> Descending
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <button onClick={fetchEvents} className="search-action-btn">
            Apply Filters
          </button>
        </div>

        <section className="events-grid" role="list">
          {events.map((ev) => (
            <article key={ev._id} className="event-card" role="listitem">
              <div className="event-head">
                <div>
                  <h3>{ev.title}</h3>
                  <div>{ev.location}</div>
                </div>
                <div className="price-badge">
                  ₹ {ev.negotiatePrice ?? "N/A"}
                </div>
              </div>

              <div className="event-meta">
                <div>
                  <strong>Date</strong> {formatDate(ev.date)}
                </div>
                <div>
                  <strong>Vacancies</strong> {ev.vacancies ?? "N/A"}
                </div>
              </div>

              <div className="event-description-toggle">
                <button
                  className="info-btn"
                  onClick={() => toggleDescription(ev._id)}
                >
                  <FaInfoCircle /> View Description
                </button>
              </div>

              <div className="event-actions">
                <button
                  className="apply-btn"
                  onClick={() => handleApply(ev._id)}
                  disabled={applyingId === ev._id || (ev.vacancies ?? 0) <= 0}
                >
                  {applyingId === ev._id
                    ? "Applying..."
                    : (ev.vacancies ?? 0) > 0
                    ? "Apply"
                    : "Full"}
                </button>
              </div>
            </article>
          ))}
        </section>

        {openDescriptionId && (
          <div
            className="modal-overlay"
            onClick={() => setOpenDescriptionId(null)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Description</h3>
              <p>
                {events.find((ev) => ev._id === openDescriptionId)?.description}
              </p>
              <button
                className="close-modal"
                onClick={() => setOpenDescriptionId(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RiderDashboard;
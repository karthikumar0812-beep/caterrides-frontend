import React, { useEffect, useState } from "react";
import { FaBars, FaTimes, FaInfoCircle } from "react-icons/fa";
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [riderName] = useState(localStorage.getItem("riderName") || "");
  const [openDescriptionId, setOpenDescriptionId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setBackendDown(false);
      try {
        const res = await fetch(API_EVENTS);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : data.events || []);
      } catch {
        setBackendDown(true);
      } finally {
        setLoading(false);
      }
    };

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

  //logout
  const handleLogout = () => {
    localStorage.removeItem("riderToken");
    localStorage.removeItem("riderName");

    // Let other components know name is cleared
    window.dispatchEvent(new Event("riderNameChanged"));

    navigate("/rider/login");
  };

  return (
  <div
    className={`dashboard-wrapper ${
      sidebarOpen ? "sidebar-open" : "sidebar-closed"
    }`}
  >
    <aside className="dashboard-sidebar" aria-hidden={!sidebarOpen}>
      <div className="sidebar-top">
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen((s) => !s)}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
        <div className="profile-circle">
          {riderName ? riderName.charAt(0).toUpperCase() : "R"}
        </div>
        <h3 className="rider-name">{riderName || "Rider"}</h3>
      </div>
      <nav className="sidebar-nav">
        <button className="nav-btn" onClick={() => navigate("/rider/profile")}>
          Profile
        </button>
        <button
          className="nav-btn"
          onClick={() => navigate("/rider/applications")}
        >
          Application Status
        </button>
        <button
          className="nav-btn logout-btn"
          onClick={handleLogout}
          style={{
            color: "white",
            backgroundColor: "gray",
            marginTop: "10px",
          }}
        >
          Logout
        </button>
      </nav>
    </aside>

    <main className="dashboard-main">
      <header className="dashboard-header">
        <div className="header-left">
          <button
            className="mobile-toggle"
            onClick={() => setSidebarOpen((s) => !s)}
            aria-label="Toggle sidebar"
          >
            ☰
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

      <section className="events-grid" role="list">
        {events.map((ev) => (
          <article key={ev._id} className="event-card" role="listitem">
            <div className="event-head">
              <div>
                <h3>{ev.title}</h3>
                <div>{ev.location}</div>
              </div>
              <div className="price-badge">₹ {ev.negotiatePrice ?? "N/A"}</div>
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

      {/* Modal for Description */}
      {openDescriptionId && (
        <div className="modal-overlay" onClick={() => setOpenDescriptionId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Description</h3>
            <p>{events.find((ev) => ev._id === openDescriptionId)?.description}</p>
            <button className="close-modal" onClick={() => setOpenDescriptionId(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  </div>
);
}

export default RiderDashboard;

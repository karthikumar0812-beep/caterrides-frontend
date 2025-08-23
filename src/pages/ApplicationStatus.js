import React, { useEffect, useState } from "react";
import "../styles/RiderApplications.css";
import { useNavigate } from "react-router-dom";

const PROFILE_URL =
  process.env.REACT_APP_PROFILE_URL ||
  "https://caterrides.onrender.com/api/rider/profile";

function formatDateShort(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso || "";
  }
}

const StatusBadge = ({ status }) => {
  const s = (status || "").toLowerCase();
  const className =
    s === "accepted"
      ? "status accepted"
      : s === "rejected"
      ? "status rejected"
      : "status pending";
  // display human-friendly label
  const label = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Pending";
  return <span className={className}>{label}</span>;
};

export default function ApplicationStatus() {
  const [applications, setApplications] = useState([]); // will store appliedEvents
  const [loading, setLoading] = useState(true);
  const [backendDown, setBackendDown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");

  const navigate = useNavigate();

  const fetchProfile = async () => {
    setLoading(true);
    setBackendDown(false);

    const token = localStorage.getItem("riderToken");
    if (!token) {
      navigate("/rider/login");
      return;
    }

    try {
      const res = await fetch(PROFILE_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          // token invalid -> clear and redirect
          localStorage.removeItem("riderToken");
          localStorage.removeItem("riderName");
          navigate("/rider/login");
          return;
        }
        throw new Error(`Bad response ${res.status}`);
      }

      const data = await res.json();
      // `appliedEvents` is the array inside profile
      const applied = Array.isArray(data.appliedEvents)
        ? data.appliedEvents
        : [];
      // Normalize into an array of application objects with event info
 const normalized = applied
  // skip if eventId is null, undefined, or missing essential fields
  .filter((item) => item.eventId && item.eventId._id)
  .map((item) => {
    const eventObj = item.eventId;
    return {
      applicationId: item._id,
      status: item.status || "Pending",
      appliedAt: item.appliedAt || item.appliedOn || item.createdAt || "",
      eventId: eventObj._id,
      title: eventObj.title,
      location: eventObj.location,
      date: eventObj.date,
      raw: item,
    };
  });

      setApplications(normalized);
    } catch (err) {
      console.error("Fetch profile error:", err);
      setBackendDown(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  return (
    <div className="apps-wrapper">
      <header className="apps-header">
        <div>
          <h2>Your Applications</h2>
          <p className="subtitle">Status of events you've applied to</p>
        </div>

        <div className="apps-actions">
          <button
            className="btn transparent"
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </header>
      <div className="status-filters">
  {["All", "Accepted", "Pending", "Rejected"].map((status) => (
    <button
      key={status}
      className={`filter-btn ${filterStatus === status ? "active" : ""} ${status.toLowerCase()}`}
      onClick={() => setFilterStatus(status)}
    >
      {status}
    </button>
  ))}
</div>

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Fetching events...</p>
        </div>
      )}
      {backendDown && !loading && (
        <div className="center error">Backend is down</div>
      )}
      {!backendDown && !loading && applications.length === 0 && (
        <div className="center muted">
          You haven't applied to any events yet.
        </div>
      )}
      

      <section className="apps-grid">
        
      {applications
  .filter(
    (app) =>
      filterStatus.toLowerCase() === "all" ||
      app.status.toLowerCase() === filterStatus.toLowerCase()
  )
  .map((app) => (
          
          <article key={app.applicationId || app.eventId} className="app-card">
            <div className="app-main">
              <div className="app-left">
                <h3 className="app-title">{app.title || "Untitled event"}</h3>
                <div className="app-sub">
                  <span className="dot" /> {app.location}
                </div>

                <div className="app-meta">
                  <div>
                    <strong>Event Date</strong>
                    <div className="meta-value">
                      {formatDateShort(app.date)}
                    </div>
                  </div>
                  <div>
                    <strong>Applied On</strong>
                    <div className="meta-value">
                      {formatDateShort(app.appliedAt)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="app-right">
                <StatusBadge status={app.status} />
              </div>
            </div>

            <div className="app-footer">
              <p className="app-desc">{app.raw?.eventId?.description || ""}</p>
              <div className="app-cta">
                <button
                  className="btn primary"
                  onClick={() => {
                    // navigate to event page if you have one
                    if (app.eventId) navigate(`/rider/event/${app.eventId}`);
                  }}
                  disabled={!app.eventId}
                >
                  View Event
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

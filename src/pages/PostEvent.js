import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PostEvent.css";

const API_KEY = "5ae1e976b7bc47718d92c685ccd99a00";

const PostEvent = () => {
  const navigate = useNavigate();

  // form state
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState(null); // { lat, lng }
  const [date, setDate] = useState("");
  const [vacancies, setVacancies] = useState("");
  const [negotiatePrice, setNegotiatePrice] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // autocomplete state
  const [suggestions, setSuggestions] = useState([]); // {display, lat, lon}
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFallbackNote, setShowFallbackNote] = useState(false);

  // helpers
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const cacheRef = useRef(new Map());
  const wrapperRef = useRef(null);

  // --- fetch suggestions (debounced, cached, abortable) ---
  const fetchSuggestions = (q) => {
    const query = (q || "").trim();
    setShowFallbackNote(false);

    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // use cache
    if (cacheRef.current.has(query)) {
      setSuggestions(cacheRef.current.get(query));
      setShowSuggestions(true);
      return;
    }

    // debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      // abort previous
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        query
      )}&key=${API_KEY}&countrycode=in&limit=7&no_annotations=1`;

      try {
        const res = await fetch(url, { signal: abortRef.current.signal });
        if (!res.ok) {
          const txt = await res.text();
          console.error("OpenCage non-OK response:", res.status, txt);
          setSuggestions([]);
          setShowSuggestions(false);
          return;
        }
        const data = await res.json();
        // debug log so you can inspect returned structure
        console.log("OpenCage response:", data);

        if (!data.results || data.results.length === 0) {
          setSuggestions([]);
          setShowSuggestions(false);
          return;
        }

        // Prefer Tamil Nadu results (check components.state/county/formatted)
        const tnMatches = data.results.filter((r) => {
          const comps = r.components || {};
          const formatted = (r.formatted || "").toLowerCase();
          const state = (comps.state || "").toLowerCase();
          const county = (comps.county || "").toLowerCase();
          // match if any field contains "tamil" or "tamil nadu"
          return /tamil/i.test(state || county || formatted);
        });

        const chosen = (tnMatches.length ? tnMatches : data.results).map((r) => ({
          display: r.formatted,
          lat: r.geometry?.lat ?? (r.geometry ? r.geometry.coordinates?.[1] : null),
          lon: r.geometry?.lng ?? (r.geometry ? r.geometry.coordinates?.[0] : null),
          raw: r,
        }));

        cacheRef.current.set(query, chosen);
        setSuggestions(chosen);
        setShowSuggestions(true);
        setShowFallbackNote(tnMatches.length === 0); // true if no TN matches (we used fallback)
      } catch (err) {
        if (err.name === "AbortError") {
          // ignore
        } else {
          console.error("Error fetching OpenCage:", err);
        }
      }
    }, 300); // 300ms debounce
  };

  // close suggestions on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // select suggestion
  const selectSuggestion = (s) => {
    setLocation(s.display);
    setCoords({ lat: s.lat, lng: s.lon });
    setShowSuggestions(false);
    setSuggestions([]);
    setShowFallbackNote(false);
    console.log("Selected place coordinates:", s.lat, s.lon, s.raw);
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("organizerToken");
      if (!token) {
        setMessage("No token found. Please log in.");
        setLoading(false);
        return;
      }

      const payload = {
        title,
        location,
        date,
        vacancies: parseInt(vacancies || "0"),
        negotiatePrice: parseFloat(negotiatePrice || "0"),
        description,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
      };

      const res = await fetch(
        "https://caterrides.onrender.com/api/organizer/post-event",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setMessage("Event posted successfully!");
        navigate("/organizer-dashboard");
      } else {
        setMessage(data.message || "Failed to post event.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-event-container">
      <h2>Post New Event</h2>
      <form onSubmit={handleSubmit} className="post-event-form">
        <input
          type="text"
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Autocomplete input */}
        <div ref={wrapperRef} style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Location (Tamil Nadu preferred)"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setCoords(null);
              fetchSuggestions(e.target.value);
            }}
            autoComplete="off"
            required
          />

          {showFallbackNote && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#fff8e6",
                border: "1px solid #ffd59e",
                padding: "6px 8px",
                zIndex: 1100,
                fontSize: 12,
              }}
            >
              Showing closest matches (no Tamil Nadu-specific hits)
            </div>
          )}

          {showSuggestions && suggestions.length > 0 && (
            <ul
              className="nominatim-suggestions"
              style={{
                position: "absolute",
                top: showFallbackNote ? "calc(100% + 36px)" : "100%",
                left: 0,
                right: 0,
                background: "#fff",
                border: "1px solid #ccc",
                maxHeight: 220,
                overflowY: "auto",
                zIndex: 1200,
                margin: 0,
                padding: 0,
                listStyle: "none",
              }}
            >
              {suggestions.map((s, i) => (
                <li
                  key={`${s.display}-${i}`}
                  onMouseDown={(ev) => {
                    // use mouseDown to avoid input blur before click
                    ev.preventDefault();
                    selectSuggestion(s);
                  }}
                  style={{
                    padding: "8px 10px",
                    cursor: "pointer",
                    borderBottom: "1px solid #f1f1f1",
                  }}
                >
                  {s.display}
                </li>
              ))}
            </ul>
          )}
        </div>

        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Vacancies"
          value={vacancies}
          onChange={(e) => setVacancies(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Negotiable Price"
          value={negotiatePrice}
          onChange={(e) => setNegotiatePrice(e.target.value)}
          required
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Posting..." : "Post Event"}
        </button>
      </form>

      {message && <p className="form-message">{message}</p>}
    </div>
  );
};

export default PostEvent;

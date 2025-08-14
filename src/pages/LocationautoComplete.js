import React, { useState } from "react";

const API_KEY = "YOUR_OPENCAGE_KEY";

export default function LocationautoComplete({ value, onChange }) {
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          query
        )}&key=${API_KEY}&countrycode=in&limit=5&no_annotations=1`
      );
      const data = await res.json();
      if (data.results) {
        setSuggestions(data.results.map((place) => place.formatted));
      }
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        placeholder="Location"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          fetchSuggestions(e.target.value);
        }}
        required
      />
      {suggestions.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            background: "#fff",
            border: "1px solid #ccc",
            width: "100%",
            zIndex: 1000,
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              onClick={() => {
                onChange(s);
                setSuggestions([]);
              }}
              style={{
                padding: "0.5rem",
                cursor: "pointer",
              }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

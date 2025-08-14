import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Organizerlogin.css";

const Organizerlogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("organizerToken");
    if (token) {
      navigate("/organizer-dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://caterrides.onrender.com/api/organizer/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        const { token, name } = data;
        if (token) {
          localStorage.setItem("organizerToken", token);
        }
        if (name) {
          localStorage.setItem("organizerName", name);
        }

        // Notify other components
        window.dispatchEvent(new Event("organizerNameChanged"));

        navigate("/organizer-dashboard");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" aria-busy={loading}>
      <h2>Organizer Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && <p className="error-text" role="alert">{error}</p>}
      </form>
    </div>
  );
};

export default Organizerlogin;

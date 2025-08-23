import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUtensils, FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUserPlus } from "react-icons/fa";
import "../styles//RiderLogin.css";

const RiderLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("riderToken");
    if (token) {
      navigate("/rider-dashboard");
    }

    // Check if credentials were saved
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("https://caterrides.onrender.com/api/rider/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const { token, name } = data;
        if (token) {
          localStorage.setItem("riderToken", token);
        }
        if (name) {
          localStorage.setItem("riderName", name);
        }

        // Save email if remember me is checked
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        // Notify other components in same tab
        window.dispatchEvent(new Event("riderNameChanged"));

        navigate("/rider-dashboard");
      } else {
        setError(data.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="rider-login-container">
      <div className="rider-login-card">
        <div className="login-header">
          <div className="logo">
            <FaUtensils className="logo-icon" />
            <h1>CaterRides</h1>
          </div>
          <h2>Rider Login</h2>
          <p>Welcome back! Please login to your account</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="login-input"
            />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="login-input"
            />
            <button 
              type="button" 
              onClick={togglePasswordVisibility}
              className="password-toggle"
              disabled={loading}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                disabled={loading}
              />
              <span>Remember me</span>
            </label>
            
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="login-button"
          >
            {loading ? (
              <div className="button-spinner"></div>
            ) : (
              "Login"
            )}
          </button>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}
        </form>

        <div className="login-footer">
          <p>Don't have an account? <Link to="/rider" className="signup-link">Sign up</Link></p>
        </div>
      </div>

      <div className="login-decoration">
        <div className="decoration-item item-1">
          <FaUtensils />
        </div>
        <div className="decoration-item item-2">
          <FaUtensils />
        </div>
        <div className="decoration-item item-3">
          <FaUtensils />
        </div>
      </div>
    </div>
  );
};

export default RiderLogin;
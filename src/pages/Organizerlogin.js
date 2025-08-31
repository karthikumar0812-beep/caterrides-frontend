import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Organizerlogin.css";

const OrganizerLogin = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  // Authentication token verification
  const verifyAuthentication = useCallback(() => {
    const token = localStorage.getItem("organizerToken");
    if (token) {
      navigate("/organizer-dashboard", { replace: true });
    }
  }, [navigate]);

  // Auto-redirect if already authenticated
  useEffect(() => {
    verifyAuthentication();
  }, [verifyAuthentication]);

  // Input validation
  const validateInputs = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!credentials.email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(credentials.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!credentials.password) {
      errors.password = "Password is required";
    } else if (credentials.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific error when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateInputs()) return;
    
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://caterrides.onrender.com/api/organizer/login",
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
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

        // Notify other components of authentication state change
        window.dispatchEvent(new Event("organizerNameChanged"));
        
        // Redirect to dashboard
        navigate("/organizer-dashboard", { replace: true });
      } else {
        setError(data.message || "Authentication failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Organizer Portal</h1>
          <p>Access your event management dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="login-form" noValidate>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={credentials.email}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className={validationErrors.email ? "input-error" : ""}
              aria-describedby={validationErrors.email ? "email-error" : undefined}
            />
            {validationErrors.email && (
              <span id="email-error" className="error-text">{validationErrors.email}</span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className={validationErrors.password ? "input-error" : ""}
              aria-describedby={validationErrors.password ? "password-error" : undefined}
            />
            {validationErrors.password && (
              <span id="password-error" className="error-text">{validationErrors.password}</span>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`login-button ${isLoading ? "button-loading" : ""}`}
            aria-label={isLoading ? "Logging in" : "Login"}
          >
            {isLoading ? (
              <>
                <span className="button-spinner" aria-hidden="true"></span>
                Authenticating...
              </>
            ) : (
              "Login to Dashboard"
            )}
          </button>

          {error && (
            <div className="error-message" role="alert" aria-live="polite">
              <span className="error-icon" aria-hidden="true">!</span>
              {error}
            </div>
          )}
        </form>
        
        <div className="login-footer">
          <p>
            <a href="/forgot-password" className="text-link">Forgot password?</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrganizerLogin;
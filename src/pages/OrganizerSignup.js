import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/OrganizerSignup.css";

const OrganizerSignup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    organizationName: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      setMessage({ text: "Please accept the terms and conditions", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch(
        "https://caterrides.onrender.com/api/organizer/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (res.ok) {
        const token = data.token || data.accessToken || null;
        const name =
          data.name || (data.user && data.user.name) || form.name || "";

        if (token) {
          localStorage.setItem("organizerToken", token);
        }
        if (name) {
          localStorage.setItem("organizerName", name);
        }

        window.dispatchEvent(new Event("organizerNameChanged"));

        setMessage({ text: "Signup successful! Redirecting...", type: "success" });

        setTimeout(() => {
          navigate("/organizer-dashboard");
        }, 1500);
      } else {
        setMessage({ text: data.message || "Signup failed", type: "error" });
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setMessage({
        text: "Something went wrong. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-left-panel">
          <div className="logo">
            <i className="fas fa-calendar-alt"></i>
            EventHub
          </div>
          <div className="panel-content">
            <h2>Grow Your Event Business</h2>
            <p>Join thousands of organizers who use our platform to create unforgettable experiences.</p>
            <ul className="features">
              <li><i className="fas fa-check"></i> Reach a wider audience</li>
              <li><i className="fas fa-check"></i> Manage registrations effortlessly</li>
              <li><i className="fas fa-check"></i> Sell tickets with no hassle</li>
              <li><i className="fas fa-check"></i> Get real-time analytics</li>
            </ul>
          </div>
        </div>

        <div className="signup-right-panel">
          <div className="login-redirect">
            <p>Already have an account?</p>
            <button className="login-btn" onClick={() => navigate("/organizer/login")}>
              Login <i className="fas fa-arrow-right"></i>
            </button>
          </div>

          <div className="form-header">
            <h2>Create Organizer Account</h2>
            <p className="subtitle">Start organizing events in minutes</p>
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-group">
              <div className="input-with-icon">
                <i className="fas fa-user"></i>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-with-icon">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-with-icon">
                <i className="fas fa-lock"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <span className="password-toggle" onClick={togglePasswordVisibility}>
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </span>
              </div>
            </div>

            <div className="form-group">
              <div className="input-with-icon">
                <i className="fas fa-phone"></i>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-with-icon">
                <i className="fas fa-building"></i>
                <input
                  type="text"
                  name="organizationName"
                  placeholder="Organization Name"
                  value={form.organizationName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="terms-container">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={() => setTermsAccepted(!termsAccepted)}
                />
                <span className="checkmark"></span>
                I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
              </label>
            </div>

            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="divider">
              <span>or sign up with</span>
            </div>

            <div className="social-login">
              <button type="button" className="social-btn google">
                <i className="fab fa-google"></i>
              </button>
              <button type="button" className="social-btn facebook">
                <i className="fab fa-facebook-f"></i>
              </button>
              <button type="button" className="social-btn linkedin">
                <i className="fab fa-linkedin-in"></i>
              </button>
            </div>
          </form>

          <div className="signup-footer">
            <p>&copy; 2023 EventHub. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerSignup;
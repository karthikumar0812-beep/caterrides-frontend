import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FaMotorcycle, 
  FaEnvelope, 
  FaLock, 
  FaUser, 
  FaPhone, 
  FaBirthdayCake, 
  FaCheckCircle,
  FaArrowRight,
  FaShieldAlt,
  FaRocket
} from "react-icons/fa";
import "../styles/RiderSignup.css";

const RiderSignup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    age: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otp, setOtp] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Check password strength
    if (name === "password") {
      let strength = 0;
      if (value.length > 5) strength += 1;
      if (value.length > 7) strength += 1;
      if (/[A-Z]/.test(value)) strength += 1;
      if (/[0-9]/.test(value)) strength += 1;
      if (/[^A-Za-z0-9]/.test(value)) strength += 1;
      setPasswordStrength(strength);
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("https://caterrides.onrender.com/api/rider/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        // Store user data in localStorage temporarily
        localStorage.setItem("pendingSignup", JSON.stringify(form));
        setMessage({ text: "OTP sent to your email!", type: "success" });
        setShowOtpPopup(true);
        setCurrentStep(2);
      } else {
        setMessage({ text: data.message || "Failed to send OTP", type: "error" });
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setMessage({
        text: "Something went wrong. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and complete signup
  const handleOtpChange = async (e) => {
    const value = e.target.value.replace(/\D/g, ""); // only numbers
    setOtp(value);

    if (value.length === 6) {
      const storedData = JSON.parse(localStorage.getItem("pendingSignup"));
      if (!storedData) {
        setMessage({ text: "No signup data found. Please try again.", type: "error" });
        setShowOtpPopup(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("https://caterrides.onrender.com/api/rider/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: storedData.email, otp: value }),
        });

        const data = await res.json();

        if (res.ok) {
          const token = data.token || null;
          if (token) localStorage.setItem("riderToken", token);
          localStorage.removeItem("pendingSignup");
          setMessage({ text: "Signup successful! Redirecting...", type: "success" });
          setCurrentStep(3);

          setTimeout(() => {
            navigate("/rider-dashboard");
          }, 1500);
        } else {
          setMessage({ text: data.message || "Invalid OTP", type: "error" });
        }
      } catch (error) {
        console.error("Error verifying OTP:", error);
        setMessage({ text: "Something went wrong during signup.", type: "error" });
      } finally {
        setLoading(false);
      }
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "#ff4d4d";
    if (passwordStrength === 1) return "#ff4d4d";
    if (passwordStrength === 2) return "#ffa64d";
    if (passwordStrength === 3) return "#ffcc00";
    if (passwordStrength === 4) return "#99cc33";
    return "#22bb33";
  };

  return (
    <div className="rider-signup-container">
      <div className="signup-background">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>
      
      <div className="signup-card">
        <div className="signup-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
          <div className="progress-steps">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <span>1</span>
              <p>Details</p>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <span>2</span>
              <p>Verify</p>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <span>3</span>
              <p>Complete</p>
            </div>
          </div>
        </div>

        <div className="signup-header">
          <div className="logo">
            <h1>CaterRides</h1>
          </div>
          <h2>Join Our Elite Rider Team</h2>
          <p>Start your journey with the lovable Serving community</p>
        </div>

        <form onSubmit={handleSendOtp} className="signup-form">
          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              name="password"
              placeholder="Create Password"
              value={form.password}
              onChange={handleChange}
              required
              className="form-input"
            />
            {form.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill" 
                    style={{ 
                      width: `${(passwordStrength / 5) * 100}%`,
                      backgroundColor: getPasswordStrengthColor()
                    }}
                  ></div>
                </div>
                <div className="strength-text">
                  {passwordStrength === 0 && "Very Weak"}
                  {passwordStrength === 1 && "Weak"}
                  {passwordStrength === 2 && "Fair"}
                  {passwordStrength === 3 && "Good"}
                  {passwordStrength === 4 && "Strong"}
                  {passwordStrength === 5 && "Very Strong"}
                </div>
              </div>
            )}
          </div>

          <div className="input-row">
            <div className="input-group half">
              <FaPhone className="input-icon" />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="input-group half">
              <FaBirthdayCake className="input-icon" />
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={form.age}
                onChange={handleChange}
                required
                className="form-input"
                min="18"
                max="65"
              />
            </div>
          </div>

         
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.type === 'success' ? <FaCheckCircle /> : <FaShieldAlt />}
              <span>{message.text}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="signup-button"
          >
            {loading ? (
              <div className="button-spinner"></div>
            ) : (
              <>
                <span>Continue to Verification</span>
                <FaArrowRight className="button-icon" />
              </>
            )}
          </button>
        </form>

        <div className="signup-footer">
          <p>Already have an account? <Link to="/rider/login" className="login-link">Sign In</Link></p>
        </div>
      </div>

      {showOtpPopup && (
        <div className="otp-modal">
          <div className="otp-modal-content">
            <div className="otp-header">
              <div className="otp-icon">
                <FaShieldAlt />
              </div>
              <h3>Verify Your Email</h3>
              <p>We've sent a 6-digit code to {form.email}</p>
            </div>
            
            <div className="otp-input-container">
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={handleOtpChange}
                placeholder="0 0 0 0 0 0"
                className="otp-input"
                autoFocus
              />
            </div>
            
            <div className="otp-actions">
              <button 
                onClick={() => setShowOtpPopup(false)}
                className="otp-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="success-modal">
          <div className="success-content">
            <div className="success-animation">
              <FaRocket className="rocket-icon" />
              <div className="success-checkmark">
                <FaCheckCircle />
              </div>
            </div>
            <h3>Welcome to CaterRides!</h3>
            <p>Your account has been created successfully. Redirecting to dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderSignup;
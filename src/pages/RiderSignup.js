import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FaEnvelope, FaLock, FaUser, FaPhone, FaBirthdayCake, 
  FaCheckCircle, FaArrowRight, FaShieldAlt, FaRocket 
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

    // Password strength
    if (name === "password") {
      let strength = 0;
      if (value.length > 5) strength++;
      if (value.length > 7) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      if (/[^A-Za-z0-9]/.test(value)) strength++;
      setPasswordStrength(strength);
    }
  };

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
        localStorage.setItem("pendingSignup", JSON.stringify(form));
        setMessage({ text: "OTP sent to your email!", type: "success" });
        setShowOtpPopup(true);
        setCurrentStep(2);
      } else {
        setMessage({ text: data.message || "Failed to send OTP", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = async (e) => {
    const value = e.target.value.replace(/\D/g, "");
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
          if (data.token) localStorage.setItem("riderToken", data.token);
          localStorage.removeItem("pendingSignup");
          setMessage({ text: "Signup successful! Redirecting...", type: "success" });
          setCurrentStep(3);

          setTimeout(() => navigate("/rider-dashboard"), 1500);
        } else {
          setMessage({ text: data.message || "Invalid OTP", type: "error" });
        }
      } catch {
        setMessage({ text: "Something went wrong during signup.", type: "error" });
      } finally {
        setLoading(false);
      }
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "#ff4d4d";
    if (passwordStrength === 2) return "#ffa64d";
    if (passwordStrength === 3) return "#ffcc00";
    if (passwordStrength === 4) return "#99cc33";
    return "#22bb33";
  };

  return (
    <div className="rider-signup-container">
      <div className="signup-card">
        {/* Progress bar */}
        <div className="signup-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(currentStep / 3) * 100}%` }}></div>
          </div>
          <div className="progress-steps">
            <div className={`step ${currentStep >= 1 ? "active" : ""}`}><span>1</span><p>Details</p></div>
            <div className={`step ${currentStep >= 2 ? "active" : ""}`}><span>2</span><p>Verify</p></div>
            <div className={`step ${currentStep >= 3 ? "active" : ""}`}><span>3</span><p>Complete</p></div>
          </div>
        </div>

        {/* Header */}
        <div className="signup-header">
          <h1>CaterRides</h1>
          <h2>Join Our Elite Rider Team</h2>
          <p>Start your journey with our serving community</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSendOtp} className="signup-form">
          <div className="input-group"><input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required /></div>
          <div className="input-group"><input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} required /></div>
          <div className="input-group">
            <input type="password" name="password" placeholder="Create Password" value={form.password} onChange={handleChange} required />
            {form.password && (
              <div className="password-strength">
                <div className="strength-bar"><div className="strength-fill" style={{ width: `${(passwordStrength / 5) * 100}%`, backgroundColor: getPasswordStrengthColor() }}></div></div>
                <span className="strength-text">
                  {["Very Weak","Weak","Fair","Good","Strong","Very Strong"][passwordStrength]}
                </span>
              </div>
            )}
          </div>
          <div className="input-row">
            <div className="input-group half"><input type="tel" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} required /></div>
            <div className="input-group half"><input type="number" name="age" placeholder="Age" value={form.age} onChange={handleChange} required min="18" max="65" /></div>
          </div>

          {message.text && <div className={`message ${message.type}`}>{message.type === "success" ? <FaCheckCircle /> : <FaShieldAlt />}<span>{message.text}</span></div>}

          <button type="submit" disabled={loading} className="signup-button">{loading ? <div className="button-spinner"></div> : <>Continue <FaArrowRight className="button-icon" /></>}</button>
        </form>

        <div className="signup-footer"><p>Already have an account? <Link to="/rider/login">Sign In</Link></p></div>
      </div>

      {/* OTP Popup */}
      {showOtpPopup && (
        <div className="otp-modal">
          <div className="otp-modal-content">
            <h3>Verify Your Email</h3>
            <p>We've sent a 6-digit code to {form.email}</p>
            <input type="text" maxLength="6" value={otp} onChange={handleOtpChange} placeholder="Enter OTP" className="otp-input" autoFocus />
            <button onClick={() => setShowOtpPopup(false)} className="otp-cancel-btn">Cancel</button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {currentStep === 3 && (
        <div className="success-modal">
          <div className="success-content">
            <FaRocket className="rocket-icon" />
            <FaCheckCircle className="success-check" />
            <h3>Welcome to CaterRides!</h3>
            <p>Your account has been created successfully. Redirecting...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderSignup;

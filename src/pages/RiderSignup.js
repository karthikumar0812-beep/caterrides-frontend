import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

          setTimeout(() => {
            navigate("/rider-dashboard");
          }, 500);
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

  return (
    <div className="signup-container">
      <div className="login-redirect">
        <p>Already have an account?</p>
        <button onClick={() => navigate("/rider/login")}>Login</button>
      </div>

      <h2>Rider Signup</h2>
      <form onSubmit={handleSendOtp}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={form.age}
          onChange={handleChange}
          required
        />

        {message.text && (
          <p
            style={{
              color: message.type === "success" ? "green" : "red",
              marginBottom: "10px",
              fontWeight: "bold",
            }}
          >
            {message.text}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      </form>

      {showOtpPopup && (
        <div className="otp-popup">
          <div className="otp-popup-content">
            <h3>Enter OTP</h3>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={handleOtpChange}
              placeholder="6-digit OTP"
            />
            <button onClick={() => setShowOtpPopup(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderSignup;

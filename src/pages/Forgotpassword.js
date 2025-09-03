import React, { useState } from "react";
import axios from "axios";
import "../styles/Forgotpassword.css"; // Import the CSS file

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = request OTP, 2 = reset password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  // Step 1: Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://caterrides.onrender.com/api/rider/forgot-password", { email });
      setMessage(res.data.msg);
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.msg || "Error sending OTP");
    }
  };

  // Step 2: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://caterrides.onrender.com/api/rider/reset-password", {
        email,
        otp,
        newPassword,
      });
      setMessage(res.data.msg);
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
    } catch (err) {
      setMessage(err.response?.data?.msg || "Error resetting password");
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-box">
        <h2 className="forgot-title">Forgot Password</h2>

        {message && <p className="forgot-message">{message}</p>}

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
            <button type="submit" className="btn-primary">
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <label>OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              placeholder="Enter OTP"
            />

            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Enter new password"
            />

            <button type="submit" className="btn-success">
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

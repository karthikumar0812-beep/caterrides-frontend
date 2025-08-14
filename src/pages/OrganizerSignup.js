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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        }, 500);
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

  return (
    <div className="signup-container">
      <div className="login-redirect">
        <p>Already have an account?</p>
        <button onClick={() => navigate("/organizer/login")}>Login</button>
      </div>

      <h2>Organizer Signup</h2>
      <form onSubmit={handleSubmit}>
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
          type="text"
          name="organizationName"
          placeholder="Organization Name"
          value={form.organizationName}
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
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default OrganizerSignup;

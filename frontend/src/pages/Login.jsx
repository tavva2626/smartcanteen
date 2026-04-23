import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUtensils, FaUserGraduate, FaUserTie, FaEnvelope, FaLock, FaUser, FaArrowRight } from "react-icons/fa";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login, signup, setRole } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [role, setSelectedRole] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!role) {
      setError("Please select your role (Student or Manager)");
      setLoading(false);
      return;
    }

    try {
      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      setRole(role);
      sessionStorage.setItem("userName", name || email.split("@")[0]);
      navigate("/");
    } catch (err) {
      const msg = err.message || "Authentication failed";
      if (msg.includes("invalid-credential") || msg.includes("wrong-password")) {
        setError("Invalid email or password");
      } else if (msg.includes("email-already-in-use")) {
        setError("Email already registered. Try logging in.");
      } else if (msg.includes("weak-password")) {
        setError("Password should be at least 6 characters");
      } else if (msg.includes("invalid-email")) {
        setError("Please enter a valid email address");
      } else {
        setError(msg);
      }
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-bg-orb orb-a"></div>
      <div className="login-bg-orb orb-b"></div>

      <div className="login-container">
        {/* Logo */}
        <div className="login-logo">
          <FaUtensils className="login-logo-icon" />
          <h1>Smart Canteen</h1>
          <p>AI-Powered Dining System</p>
        </div>

        {/* Role Selection */}
        <div className="role-selection">
          <p className="role-label">I am a</p>
          <div className="role-cards">
            <button
              className={`role-card ${role === "student" ? "active" : ""}`}
              onClick={() => setSelectedRole("student")}
              type="button"
            >
              <FaUserGraduate className="role-icon" />
              <span>Student</span>
            </button>
            <button
              className={`role-card ${role === "manager" ? "active" : ""}`}
              onClick={() => setSelectedRole("manager")}
              type="button"
            >
              <FaUserTie className="role-icon" />
              <span>Manager</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {isSignup && (
            <div className="input-group">
              <FaUser className="input-icon" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="login-input"
              />
            </div>
          )}
          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
            />
          </div>
          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
              minLength={6}
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? (
              <span className="spinner" style={{ width: 20, height: 20 }}></span>
            ) : (
              <>
                {isSignup ? "Create Account" : "Sign In"} <FaArrowRight />
              </>
            )}
          </button>
        </form>

        {/* Toggle signup/login */}
        <p className="login-toggle">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => { setIsSignup(!isSignup); setError(""); }} type="button">
            {isSignup ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}

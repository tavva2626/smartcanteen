import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { FaUtensils, FaChair, FaUserTie, FaChartBar, FaRobot, FaClock, FaBrain, FaMobileAlt, FaMoon, FaSun, FaSignOutAlt } from "react-icons/fa";
import "./Landing.css";

const studentCards = [
  {
    id: "student",
    title: "Order Food",
    subtitle: "Browse menu, cart & AI chatbot",
    path: "/student",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
    emoji: "📱",
  },
  {
    id: "booking",
    title: "Book a Table",
    subtitle: "Interactive floor plan, pick your seat",
    path: "/booking",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)",
    emoji: "🪑",
  },
];

const managerCards = [
  {
    id: "manager",
    title: "Manager Dashboard",
    subtitle: "Live orders, inventory, bookings",
    path: "/manager",
    gradient: "linear-gradient(135deg, #f97316 0%, #fb923c 100%)",
    emoji: "👨‍🍳",
  },
  {
    id: "analytics",
    title: "Analytics",
    subtitle: "Reports, charts, predictions",
    path: "/analytics",
    gradient: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
    emoji: "📊",
  },
];

const features = [
  { icon: <FaRobot />, title: "AI-Powered", desc: "LangChain + RAG for smart recommendations" },
  { icon: <FaClock />, title: "Queue Prediction", desc: "Real-time wait time estimation" },
  { icon: <FaBrain />, title: "Agentic AI", desc: "Groq-powered conversational ordering" },
  { icon: <FaUtensils />, title: "Smart Menu", desc: "Personalized food suggestions" },
];

export default function Landing() {
  const navigate = useNavigate();
  const { currentUser, userRole, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const userName = sessionStorage.getItem("userName") || currentUser?.email?.split("@")[0] || "User";
  const cards = userRole === "manager" ? managerCards : studentCards;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="landing-page">
      {/* Animated background orbs */}
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>

      {/* Top Controls */}
      <div className="landing-top-bar">
        <span className="welcome-badge">
          {userRole === "manager" ? "👨‍🍳" : "👋"} Hello, {userName}
          <span className="role-badge">{userRole}</span>
        </span>
        <div className="top-actions">
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle theme">
            {isDark ? <FaSun /> : <FaMoon />}
          </button>
          <button className="btn btn-secondary btn-sm logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <header className="landing-hero">
        <div className="hero-badge">
          <FaRobot /> Powered by Agentic AI
        </div>
        <h1 className="hero-title">
          <span className="gradient-text">Smart Canteen</span>
        </h1>
        <p className="hero-subtitle">
          AI-Powered • Zero Wait • Smart Dining
        </p>
        <p className="hero-desc">
          Pre-order meals, book tables, and get AI-powered food recommendations — all in one place.
        </p>
      </header>

      {/* Navigation Cards */}
      <section className="landing-cards" style={{ gridTemplateColumns: `repeat(${cards.length}, 1fr)` }}>
        {cards.map((card, i) => (
          <div
            key={card.id}
            className="landing-card"
            id={`card-${card.id}`}
            onClick={() => navigate(card.path)}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="landing-card-icon" style={{ background: card.gradient }}>
              <span className="card-emoji">{card.emoji}</span>
            </div>
            <h3 className="landing-card-title">{card.title}</h3>
            <p className="landing-card-subtitle">{card.subtitle}</p>
            <div className="landing-card-arrow">→</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="landing-features">
        <h2 className="section-title" style={{ justifyContent: "center", marginBottom: "24px" }}>
          ✨ Key Features
        </h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-item" style={{ animationDelay: `${i * 0.1 + 0.4}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>Built with ❤️ for Agentic AI Hackathon 2026</p>
        <p className="footer-tech">React • FastAPI • LangChain • RAG • Groq • ChromaDB • Firebase</p>
      </footer>
    </div>
  );
}

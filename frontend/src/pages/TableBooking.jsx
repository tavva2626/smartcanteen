import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { FaArrowLeft, FaUsers, FaMinus, FaPlus, FaCalendarAlt, FaClock, FaCheck, FaTrash, FaRobot, FaMoon, FaSun } from "react-icons/fa";
import { canteenTables } from "../data/mockData";
import { getTableSuggestion, bookTable as bookTableAPI, getTables } from "../services/api";
import "./TableBooking.css";

const timeSlots = [
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
];

const dateOptions = ["Today", "Tomorrow", "Day After"];

export default function TableBooking() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [tables, setTables] = useState(canteenTables);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedDate, setSelectedDate] = useState("Today");
  const [selectedTime, setSelectedTime] = useState(null);
  const [members, setMembers] = useState(2);
  const [bookings, setBookings] = useState([]);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [toast, setToast] = useState(null);

  const userName = sessionStorage.getItem("userName") || "Student";

  useEffect(() => {
    // Initial load from backend
    const loadTables = async () => {
      try {
        const result = await getTables();
        if (result && result.tables) {
          setTables(result.tables);
        }
      } catch (e) {
        console.error("Failed to load tables", e);
      }
    };

    loadTables();

    // Poll for updates every 5 seconds so manager changes reflect here
    const interval = setInterval(loadTables, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (members > 0) {
      getTableSuggestion(members).then((res) => {
        if (res) setAiSuggestion(res);
      });
    }
  }, [members]);

  const handleTableClick = (table) => {
    if (table.status !== "available") return;
    if (table.capacity < members) {
      showToastMsg(`⚠️ Table ${table.label} only seats ${table.capacity}. You selected ${members} members.`, "warning");
      return;
    }
    setSelectedTable(table);
  };

  const handleConfirmBooking = async () => {
    if (!selectedTable || !selectedTime) {
      showToastMsg("⚠️ Please select a table and time slot!", "warning");
      return;
    }

    // Send to backend API
    let bookingId = `BK-${Date.now().toString().slice(-4)}`;
    try {
      const result = await bookTableAPI({
        student_name: userName,
        table_id: selectedTable.id,
        date: selectedDate,
        time_slot: selectedTime,
        members: members,
      });
      if (result && result.booking) {
        bookingId = result.booking.id;
      }
    } catch (e) {
      console.log("Backend offline, saving locally");
    }

    const booking = {
      id: bookingId,
      student_name: userName,
      table_id: selectedTable.id,
      tableLabel: selectedTable.label,
      date: selectedDate,
      time_slot: selectedTime,
      members: members,
      status: "confirmed",
      booked_at: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
    };

    // Save locally
    setBookings((prev) => [...prev, booking]);
    setTables((prev) =>
      prev.map((t) => t.id === selectedTable.id ? { ...t, status: "reserved" } : t)
    );

    // Also save to sessionStorage as backup
    const existingBookings = JSON.parse(sessionStorage.getItem("canteen_bookings") || "[]");
    existingBookings.unshift(booking);
    sessionStorage.setItem("canteen_bookings", JSON.stringify(existingBookings));

    setSelectedTable(null);
    setSelectedTime(null);

    // Confetti!
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    showToastMsg(`🎉 Table ${booking.tableLabel} booked for ${selectedTime}!`, "success");
  };

  const handleCancelBooking = (bookingId) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      setTables((prev) =>
        prev.map((t) => t.id === booking.table_id ? { ...t, status: "available" } : t)
      );
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));

      // Update sessionStorage
      const existingBookings = JSON.parse(sessionStorage.getItem("canteen_bookings") || "[]");
      const updated = existingBookings.filter((b) => b.id !== bookingId);
      sessionStorage.setItem("canteen_bookings", JSON.stringify(updated));

      showToastMsg("Booking cancelled successfully", "info");
    }
  };

  const showToastMsg = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getTableClass = (table) => {
    let cls = `table-shape ${table.shape}`;
    if (table.status === "occupied") cls += " occupied";
    else if (table.status === "reserved") cls += " reserved";
    else if (table.status === "maintenance") cls += " maintenance";
    else cls += " available";
    if (selectedTable?.id === table.id) cls += " selected";
    return cls;
  };

  const renderChairs = (table) => {
    const count = table.capacity;
    const chairs = [];
    for (let i = 0; i < count; i++) {
      const angle = (360 / count) * i;
      const radius = table.shape === "long" ? 36 : table.shape === "square" ? 30 : 26;
      const x = Math.cos((angle * Math.PI) / 180) * radius;
      const y = Math.sin((angle * Math.PI) / 180) * radius;
      chairs.push(
        <div
          key={i}
          className={`chair ${table.status}`}
          style={{ transform: `translate(${x}px, ${y}px)` }}
        />
      );
    }
    return chairs;
  };

  return (
    <div className="page-container booking-page">
      {/* Header */}
      <header className="booking-header glass">
        <button className="btn-icon" onClick={() => navigate("/")}>
          <FaArrowLeft />
        </button>
        <div>
          <h2>🪑 Book a Table</h2>
          <p className="booking-header-sub">Select your perfect spot</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle theme">
            {isDark ? <FaSun /> : <FaMoon />}
          </button>
          <div className="booking-date-display">
            <FaCalendarAlt /> {new Date().toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
          </div>
        </div>
      </header>

      {/* Booking Controls */}
      <div className="booking-controls">
        {/* Date Selection */}
        <div className="control-group">
          <label>📅 Date</label>
          <div className="chips-row">
            {dateOptions.map((d) => (
              <button
                key={d}
                className={`chip ${selectedDate === d ? "active" : ""}`}
                onClick={() => setSelectedDate(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div className="control-group">
          <label>🕐 Time Slot</label>
          <div className="chips-row">
            {timeSlots.map((t) => (
              <button
                key={t}
                className={`chip ${selectedTime === t ? "active" : ""}`}
                onClick={() => setSelectedTime(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Members */}
        <div className="control-group">
          <label><FaUsers /> Members</label>
          <div className="members-stepper">
            <button className="qty-btn" onClick={() => setMembers(Math.max(1, members - 1))}><FaMinus /></button>
            <span className="members-count">{members}</span>
            <button className="qty-btn" onClick={() => setMembers(Math.min(8, members + 1))}><FaPlus /></button>
            <div className="members-icons">
              {Array.from({ length: members }).map((_, i) => (
                <span key={i}>👤</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestion Section */}
      <div className={`ai-recommendation-box ${aiSuggestion ? 'visible' : ''}`}>
        <div className="ai-agent-header">
           <div className="ai-pulse-ring"></div>
           <FaRobot className="ai-icon-large" />
           <div className="ai-typing-text">CanteeBot is thinking...</div>
        </div>
        {aiSuggestion && (
          <div className="ai-suggestion-content animate-fadeIn">
            <p className="ai-message">{aiSuggestion.message}</p>
            {aiSuggestion.suggestion && (
              <button 
                className="btn btn-secondary btn-sm ai-apply-btn"
                onClick={() => handleTableClick(aiSuggestion.suggestion)}
              >
                ✨ Select Table {aiSuggestion.suggestion.label}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Floor Plan */}
      <div className="floor-plan-container">
        <div className="floor-plan glass">
          {/* Zone Labels */}
          <div className="zone-label kitchen-label">🍳 Kitchen</div>
          <div className="zone-label window-label">🪟 Window Side</div>
          <div className="zone-label entrance-label">🚪 Entrance</div>
          <div className="zone-label counter-label">🍽️ Counter</div>

          {/* Tables */}
          {tables.map((table) => (
            <div
              key={table.id}
              className={getTableClass(table)}
              style={{ left: `${table.x}%`, top: `${table.y}%` }}
              onClick={() => handleTableClick(table)}
              title={`${table.label} • ${table.capacity} seats • ${table.status}`}
            >
              <div className="table-inner">
                <span className="table-label">{table.label}</span>
                <span className="table-seats">{table.capacity}👤</span>
              </div>
              {renderChairs(table)}
              {table.status === "occupied" && <div className="table-status-label">Occupied</div>}
              {table.status === "reserved" && <div className="table-status-label reserved-label">Reserved</div>}
              {table.status === "maintenance" && <div className="table-status-label maintenance-label">🔧</div>}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="floor-legend">
          <div className="legend-item"><span className="legend-dot available"></span> Available</div>
          <div className="legend-item"><span className="legend-dot occupied"></span> Occupied</div>
          <div className="legend-item"><span className="legend-dot reserved"></span> Reserved</div>
          <div className="legend-item"><span className="legend-dot selected-dot"></span> Selected</div>
          <div className="legend-item"><span className="legend-dot maintenance-dot"></span> Maintenance</div>
        </div>
      </div>

      {/* Booking Summary */}
      {selectedTable && (
        <div className="booking-summary glass animate-slideUp">
          <h3>📋 Booking Summary</h3>
          <div className="summary-details">
            <div className="summary-row"><span>Table</span><strong>{selectedTable.label} ({selectedTable.capacity}-seater)</strong></div>
            <div className="summary-row"><span>Zone</span><strong>{selectedTable.zone}</strong></div>
            <div className="summary-row"><span>Date</span><strong>{selectedDate}</strong></div>
            <div className="summary-row"><span>Time</span><strong>{selectedTime || "Not selected"}</strong></div>
            <div className="summary-row"><span>Members</span><strong>{members}</strong></div>
          </div>
          <button className="btn btn-primary btn-lg" onClick={handleConfirmBooking} style={{ width: "100%" }}>
            <FaCheck /> Confirm Booking
          </button>
        </div>
      )}

      {/* My Bookings */}
      {bookings.length > 0 && (
        <div className="my-bookings">
          <h3 className="section-title">📌 My Bookings</h3>
          {bookings.map((b) => (
            <div key={b.id} className="booking-card card">
              <div className="booking-card-info">
                <span className="booking-table-badge">{b.tableLabel}</span>
                <div>
                  <p><strong>{b.date}</strong> at <strong>{b.time_slot}</strong></p>
                  <p className="booking-meta">{b.members} members • {b.id}</p>
                </div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => handleCancelBooking(b.id)}>
                <FaTrash /> Cancel
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Confetti */}
      {showConfetti && (
        <div className="confetti-container">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ["#7c3aed", "#06b6d4", "#f97316", "#10b981", "#ec4899", "#eab308"][
                  Math.floor(Math.random() * 6)
                ],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                borderRadius: Math.random() > 0.5 ? "50%" : "0",
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
    </div>
  );
}

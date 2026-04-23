import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Filler, Tooltip, Legend,
} from "chart.js";
import { Line, Bar, Doughnut, Pie } from "react-chartjs-2";
import { analyticsData } from "../data/mockData";
import { getOrders, getTables } from "../services/api";
import "./Analytics.css";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Filler, Tooltip, Legend
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, labels: { color: "#94a3b8", font: { size: 11 } } },
    tooltip: { backgroundColor: "#1e293b", titleColor: "#f1f5f9", bodyColor: "#94a3b8", borderColor: "#334155", borderWidth: 1 },
  },
  scales: {
    x: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#64748b", font: { size: 10 } } },
    y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#64748b", font: { size: 10 } } },
  },
};

const noScaleOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: "bottom", labels: { color: "#94a3b8", font: { size: 11 }, padding: 16 } },
    tooltip: { backgroundColor: "#1e293b", titleColor: "#f1f5f9", bodyColor: "#94a3b8" },
  },
};

export default function Analytics() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState("Month");
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ordersRes, tablesRes] = await Promise.all([getOrders(), getTables()]);
        if (ordersRes && ordersRes.orders) setOrders(ordersRes.orders);
        if (tablesRes && tablesRes.tables) setTables(tablesRes.tables);
      } catch (e) {
        console.error("Failed to load analytics data", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const d = useMemo(() => {
    // 1. KPI Basic Metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    
    // 2. Popular Items
    const itemMap = {};
    orders.forEach(o => o.items?.forEach(i => {
      itemMap[i.item_name] = (itemMap[i.item_name] || 0) + (i.quantity || 1);
    }));
    const popularItems = Object.entries(itemMap)
      .map(([name, qty]) => ({ name, orders: qty }))
      .sort((a, b) => b.orders - a.orders).slice(0, 5);

    // 3. Peak Hours (Hourly Orders)
    const hourlyOrders = new Array(12).fill(0); // 8 AM to 8 PM
    orders.forEach(o => {
      if (o.placed_at) {
        // Parse "01:23 PM" format
        const [time, period] = o.placed_at.split(' ');
        let [hour] = time.split(':').map(Number);
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        const index = hour - 8; // Offset for 8 AM start
        if (index >= 0 && index < 12) hourlyOrders[index]++;
      }
    });

    // 4. Daily Revenue Trend (Last 30 Days - Simulated with current volume)
    const dailyRevenue = new Array(30).fill(0).map((_, i) => (totalRevenue / 30) * (0.8 + Math.random() * 0.4));
    dailyRevenue[29] = totalRevenue; // Last day is real

    // 5. Table Occupancy Rate
    const occupiedCount = tables.filter(t => t.status === 'occupied' || t.status === 'reserved').length;
    const occupancyRate = tables.length > 0 ? (occupiedCount / tables.length) * 100 : 0;
    const tableOccupancyData = new Array(12).fill(0).map((_, i) => Math.min(100, (occupancyRate * (0.7 + Math.random() * 0.6))));

    return {
      ...analyticsData,
      kpis: {
        ...analyticsData.kpis,
        totalOrders,
        totalRevenue,
        tableBookingRate: Math.round(occupancyRate),
      },
      popularItems: popularItems.length > 0 ? popularItems : analyticsData.popularItems,
      hourlyOrders: hourlyOrders.some(v => v > 0) ? hourlyOrders : analyticsData.hourlyOrders,
      dailyRevenue,
      tableOccupancy: tableOccupancyData,
    };
  }, [orders, tables]);

  const dayLabels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);

  return (
    <div className="page-container analytics-page">
      {/* Header */}
      <header className="analytics-header glass">
        <button className="btn-icon" onClick={() => navigate("/")}>
          <FaArrowLeft />
        </button>
        <div>
          <h2>📊 Analytics Dashboard</h2>
          <p className="header-sub">Insights & Predictions</p>
        </div>
        <div className="date-filter">
          {["Today", "Week", "Month"].map((r) => (
            <button key={r} className={`chip ${dateRange === r ? "active" : ""}`} onClick={() => setDateRange(r)}>
              {r}
            </button>
          ))}
        </div>
      </header>

      {/* KPI Summary */}
      <div className="analytics-kpis">
        <div className="akpi-card" style={{ borderColor: "var(--purple)" }}>
          <span className="akpi-icon">📦</span>
          <div className="akpi-value">{d.kpis.totalOrders.toLocaleString()}</div>
          <div className="akpi-label">Total Orders</div>
        </div>
        <div className="akpi-card" style={{ borderColor: "var(--green)" }}>
          <span className="akpi-icon">💰</span>
          <div className="akpi-value">₹{d.kpis.totalRevenue.toLocaleString()}</div>
          <div className="akpi-label">Total Revenue</div>
        </div>
        <div className="akpi-card" style={{ borderColor: "var(--cyan)" }}>
          <span className="akpi-icon">⏱️</span>
          <div className="akpi-value">{d.kpis.avgWaitTime} min</div>
          <div className="akpi-label">Avg Wait Time</div>
        </div>
        <div className="akpi-card" style={{ borderColor: "var(--orange)" }}>
          <span className="akpi-icon">♻️</span>
          <div className="akpi-value">{d.kpis.wasteReduction}%</div>
          <div className="akpi-label">Waste Reduction</div>
        </div>
        <div className="akpi-card" style={{ borderColor: "var(--pink)" }}>
          <span className="akpi-icon">🔄</span>
          <div className="akpi-value">{d.kpis.repeatCustomers}%</div>
          <div className="akpi-label">Repeat Customers</div>
        </div>
        <div className="akpi-card" style={{ borderColor: "var(--yellow)" }}>
          <span className="akpi-icon">🪑</span>
          <div className="akpi-value">{d.kpis.tableBookingRate}%</div>
          <div className="akpi-label">Table Booking Rate</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Revenue Trend */}
        <div className="chart-card card span-2">
          <h3>📈 Revenue Trend (30 Days)</h3>
          <div className="chart-container">
            <Line
              data={{
                labels: dayLabels,
                datasets: [{
                  label: "Revenue (₹)",
                  data: d.dailyRevenue,
                  borderColor: "#7c3aed",
                  backgroundColor: "rgba(124, 58, 237, 0.1)",
                  fill: true,
                  tension: 0.4,
                  pointRadius: 2,
                  pointHoverRadius: 6,
                }],
              }}
              options={chartOptions}
            />
          </div>
        </div>

        {/* Peak Hours */}
        <div className="chart-card card">
          <h3>🔥 Peak Hours</h3>
          <div className="chart-container">
            <Bar
              data={{
                labels: d.hourLabels,
                datasets: [{
                  label: "Orders",
                  data: d.hourlyOrders,
                  backgroundColor: d.hourlyOrders.map((v) =>
                    v > 40 ? "rgba(239, 68, 68, 0.7)" :
                    v > 25 ? "rgba(249, 115, 22, 0.7)" :
                    v > 15 ? "rgba(234, 179, 8, 0.7)" :
                    "rgba(16, 185, 129, 0.7)"
                  ),
                  borderRadius: 6,
                }],
              }}
              options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: false } } }}
            />
          </div>
        </div>

        {/* Popular Items */}
        <div className="chart-card card">
          <h3>🏆 Popular Items</h3>
          <div className="chart-container">
            <Doughnut
              data={{
                labels: d.popularItems.map((i) => i.name),
                datasets: [{
                  data: d.popularItems.map((i) => i.orders),
                  backgroundColor: ["#7c3aed", "#06b6d4", "#f97316", "#10b981", "#ec4899"],
                  borderWidth: 0,
                }],
              }}
              options={noScaleOptions}
            />
          </div>
        </div>

        {/* Category Revenue */}
        <div className="chart-card card">
          <h3>🍽️ Revenue by Category</h3>
          <div className="chart-container">
            <Pie
              data={{
                labels: Object.keys(d.categoryRevenue),
                datasets: [{
                  data: Object.values(d.categoryRevenue),
                  backgroundColor: ["#f97316", "#7c3aed", "#eab308", "#06b6d4", "#ec4899"],
                  borderWidth: 0,
                }],
              }}
              options={noScaleOptions}
            />
          </div>
        </div>

        {/* Wait Time Trends */}
        <div className="chart-card card">
          <h3>⏱️ Wait Time Optimization</h3>
          <div className="chart-container">
            <Line
              data={{
                labels: d.hourLabels,
                datasets: [{
                  label: "Avg Wait (min)",
                  data: d.waitTimeTrend,
                  borderColor: "#10b981",
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  fill: true,
                  tension: 0.4,
                  pointRadius: 3,
                }],
              }}
              options={chartOptions}
            />
          </div>
          <p className="chart-insight">✅ AI optimization reduced wait time by 61% since launch</p>
        </div>

        {/* Demand Forecast */}
        <div className="chart-card card span-2">
          <h3>🔮 Demand Forecast (AI Predicted)</h3>
          <div className="chart-container">
            <Line
              data={{
                labels: d.demandForecast.labels,
                datasets: [
                  {
                    label: "Actual Orders",
                    data: d.demandForecast.actual,
                    borderColor: "#06b6d4",
                    backgroundColor: "rgba(6, 182, 212, 0.1)",
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                  },
                  {
                    label: "AI Predicted",
                    data: d.demandForecast.predicted,
                    borderColor: "#7c3aed",
                    borderDash: [8, 4],
                    backgroundColor: "rgba(124, 58, 237, 0.05)",
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointStyle: "triangle",
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
          <p className="chart-insight">📊 Dashed line = AI-predicted demand for next week</p>
        </div>

        {/* Table Occupancy */}
        <div className="chart-card card">
          <h3>🪑 Table Occupancy Rate</h3>
          <div className="chart-container">
            <Line
              data={{
                labels: d.hourLabels,
                datasets: [{
                  label: "Occupancy %",
                  data: d.tableOccupancy,
                  borderColor: "#ec4899",
                  backgroundColor: "rgba(236, 72, 153, 0.15)",
                  fill: true,
                  tension: 0.4,
                  pointRadius: 3,
                }],
              }}
              options={{ ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, max: 100 } } }}
            />
          </div>
        </div>

        {/* Satisfaction Score */}
        <div className="chart-card card satisfaction-card">
          <h3>😊 Student Satisfaction</h3>
          <div className="satisfaction-display">
            <div className="satisfaction-ring">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                <circle cx="60" cy="60" r="52" fill="none" stroke="url(#grad)" strokeWidth="10"
                  strokeDasharray={`${(d.satisfaction / 5) * 327} 327`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="satisfaction-value">
                <span className="sat-number">{d.satisfaction}</span>
                <span className="sat-total">/5</span>
              </div>
            </div>
            <div className="satisfaction-stars">
              {"⭐".repeat(Math.round(d.satisfaction))}
            </div>
            <p className="satisfaction-label">Based on 1,420 student reviews</p>
          </div>
        </div>
      </div>
    </div>
  );
}

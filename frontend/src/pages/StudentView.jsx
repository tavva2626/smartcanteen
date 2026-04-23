import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { FaShoppingCart, FaArrowLeft, FaBell, FaWallet, FaMinus, FaPlus, FaTimes, FaStar, FaBolt, FaClock, FaMoon, FaSun, FaCheck } from "react-icons/fa";
import { menuItems, categories, categoryEmojis } from "../data/mockData";
import { getQueueStatus, placeOrder as placeOrderAPI, getMenu, getOrders } from "../services/api";
import Chatbot from "../components/Chatbot";
import "./StudentView.css";

export default function StudentView() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [queueStatus, setQueueStatus] = useState({ queue_length: 0, estimated_wait_minutes: 5 });
  const [menuItemsList, setMenuItemsList] = useState(menuItems);
  const [orderPlaced, setOrderPlaced] = useState(() => {
    const saved = sessionStorage.getItem("active_order_tracking");
    return saved ? JSON.parse(saved) : null;
  });
  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Sync active order to sessionStorage
  useEffect(() => {
    if (orderPlaced) {
      sessionStorage.setItem("active_order_tracking", JSON.stringify(orderPlaced));
    } else {
      sessionStorage.removeItem("active_order_tracking");
    }
  }, [orderPlaced]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const userName = sessionStorage.getItem("userName") || "Student";

  // Load initial data
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const result = await getMenu();
        if (result && result.menu && result.menu.length > 0) {
          setMenuItemsList(result.menu);
        }
      } catch (e) {
        console.error("Failed to fetch menu", e);
      }
    };

    getQueueStatus().then(setQueueStatus);
    fetchMenu();

    const qInterval = setInterval(() => {
      getQueueStatus().then(setQueueStatus);
      fetchMenu(); // Refresh menu availability periodically
    }, 10000);
    return () => clearInterval(qInterval);
  }, []);

  // Poll for order status if an order is active
  useEffect(() => {
    if (!orderPlaced || orderPlaced.status === "completed") return;

    const interval = setInterval(async () => {
      try {
        const result = await getOrders();
        if (result && result.orders) {
          const myOrder = result.orders.find(o => o.id === orderPlaced.id);
          if (myOrder && myOrder.status !== orderPlaced.status) {
            setOrderPlaced(prev => ({ ...prev, status: myOrder.status }));

            const newNotif = {
              id: Date.now(),
              text: `Order ${myOrder.id} is now ${myOrder.status.toUpperCase()}!`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: myOrder.status === 'ready' ? 'success' : 'info'
            };
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
            showToast(`🔔 ${newNotif.text}`, newNotif.type);
          }
        }
      } catch (e) {
        console.error("Status poll failed", e);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [orderPlaced]);

  const filteredItemsList = activeCategory === "All"
    ? menuItemsList
    : menuItemsList.filter((item) => item.category === activeCategory);

  const addToCart = (item) => {
    if (!item.isAvailable) {
      showToast(`Sorry, ${item.name} is currently out of stock!`, "warning");
      return;
    }
    setCart((prev) => {
      const exists = prev.find((c) => c.id === item.id);
      if (exists) {
        return prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    showToast(`${item.emoji} ${item.name} added to cart!`, "success");
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev.map((c) => c.id === id ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c).filter((c) => c.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const cartWaitTime = cart.length > 0 ? Math.max(...cart.map(c => c.prepTime)) + queueStatus.estimated_wait_minutes : 0;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    const orderData = {
      student_name: userName,
      items: cart.map((c) => ({
        item_id: c.id,
        item_name: c.name,
        quantity: c.quantity,
        price: c.price,
      })),
    };

    // Send to backend API so manager can see it
    let orderId = `ORD-${Math.floor(100 + Math.random() * 900)}`;
    try {
      const result = await placeOrderAPI(orderData);
      if (result && result.order) {
        orderId = result.order.id;
      }
    } catch (e) {
      console.log("Backend offline, order saved locally");
    }

    // Also save to localStorage as backup
    const localOrder = {
      id: orderId,
      student_name: userName,
      items: cart.map((c) => ({
        item_id: c.id,
        item_name: c.name,
        emoji: c.emoji,
        quantity: c.quantity,
        price: c.price,
      })),
      total: cartTotal,
      status: "placed",
      placed_at: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
      estimated_ready: `~${cartWaitTime} min`,
    };

    const existingOrders = JSON.parse(sessionStorage.getItem("canteen_orders") || "[]");
    existingOrders.unshift(localOrder);
    sessionStorage.setItem("canteen_orders", JSON.stringify(existingOrders));

    setOrderPlaced({
      id: orderId,
      items: [...cart],
      total: cartTotal,
      status: "placed",
      waitTime: cartWaitTime,
    });
    setCart([]);
    setShowCart(false);
    showToast(`🎉 Order ${orderId} placed! Estimated wait: ${cartWaitTime} min`, "success");
  };

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) setUnreadCount(0);
  };

  return (
    <div className="page-container student-page">
      {/* Top Bar */}
      <header className="student-header glass">
        <button className="btn-icon" onClick={() => navigate("/")}>
          <FaArrowLeft />
        </button>
        <div className="student-info">
          <span className="student-name">👋 Hi, {userName}</span>

        </div>
        <div className="header-actions">
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle theme">
            {isDark ? <FaSun /> : <FaMoon />}
          </button>

          <div className="notification-wrapper">
            <button className="btn-icon notification-btn" onClick={toggleNotifications}>
              <FaBell />
              {unreadCount > 0 && <span className="notification-dot">{unreadCount}</span>}
            </button>

            {showNotifications && (
              <div className="notifications-dropdown glass-strong animate-fadeIn">
                <div className="notif-header">
                  <h4>Notifications</h4>
                  {notifications.length > 0 && <button className="btn-text" onClick={() => setNotifications([])}>Clear All</button>}
                </div>
                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <p className="notif-empty">No new updates</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`notif-item ${n.type}`}>
                        <div className="notif-icon">{n.type === 'success' ? '✅' : '🔔'}</div>
                        <div className="notif-content">
                          <p>{n.text}</p>
                          <span>{n.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button className="btn-icon cart-btn" onClick={() => setShowCart(true)}>
            <FaShoppingCart />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* Queue Status Banner */}
      <div className="queue-banner glass">
        <div className="queue-pulse"></div>
        <FaClock className="queue-icon" />
        <span>
          ⏱️ ~{queueStatus.estimated_wait_minutes} min wait &nbsp;|&nbsp; {queueStatus.queue_length} orders ahead
        </span>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`chip ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {categoryEmojis[cat]} {cat}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="menu-grid">
        {filteredItemsList.map((item, i) => (
          <div
            key={item.id}
            className={`menu-card card ${!item.isAvailable ? 'unavailable' : ''}`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="menu-card-image-container">
              {item.image && (
                <img 
                  src={item.image.startsWith('/') ? item.image : `/${item.image}`} 
                  alt={item.name} 
                  className="menu-card-image" 
                  loading="lazy"
                />
              )}
              <div className="menu-card-top">
                <span className="menu-emoji">{item.emoji}</span>
                {item.isAvailable ? (
                  item.prepTime <= 4 && <span className="badge badge-cyan"><FaBolt /> Quick</span>
                ) : (
                  <span className="badge badge-red">Out of Stock</span>
                )}
              </div>
            </div>
            <h3 className="menu-card-name">{item.name}</h3>
            <p className="menu-card-desc">{item.description}</p>
            <div className="menu-card-meta">
              <span className="menu-price">₹{item.price}</span>
              <span className="menu-time"><FaClock /> {item.prepTime} min</span>
              <span className="menu-rating"><FaStar /> {item.rating}</span>
            </div>
            <button
              className={`btn ${item.isAvailable ? 'btn-primary' : 'btn-secondary disabled'} btn-sm menu-add-btn`}
              onClick={() => addToCart(item)}
              disabled={!item.isAvailable}
            >
              {item.isAvailable ? <><FaPlus /> Add</> : 'Unavailable'}
            </button>
          </div>
        ))}
      </div>

      {/* Order Tracking */}
      {orderPlaced && (
        <div className="order-tracking glass animate-slideInUp">
          <div className="order-tracking-header">
            <h3>🎉 Order {orderPlaced.id}</h3>
            <button className="btn-icon-sm" onClick={() => setOrderPlaced(null)}><FaTimes /></button>
          </div>
          <div className="order-steps">
            {[
              { id: "placed", label: "Placed", icon: "📝" },
              { id: "preparing", label: "Preparing", icon: "🔥" },
              { id: "ready", label: "Ready", icon: "🍱" },
              { id: "completed", label: "Picked Up", icon: "✅" }
            ].map((step, i, arr) => {
              const statusOrder = ["placed", "preparing", "ready", "completed"];
              const currentIndex = statusOrder.indexOf(orderPlaced.status);
              const isActive = currentIndex >= i;
              const isCurrent = orderPlaced.status === step.id;

              return (
                <div key={step.id} className={`order-step ${isActive ? "active" : ""} ${isCurrent ? "current" : ""}`}>
                  <div className="step-dot">
                    {isActive ? <FaCheck /> : i + 1}
                  </div>
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>
          <p className="order-wait">
            {orderPlaced.status === "ready"
              ? <strong className="animate-pulse" style={{ color: "var(--green-light)", fontSize: "1.1rem" }}>🍱 Your food is ready at the counter!</strong>
              : `Status: ${orderPlaced.status.charAt(0).toUpperCase() + orderPlaced.status.slice(1)}`}
          </p>
        </div>
      )}

      {/* Cart Slide-out */}
      {showCart && (
        <div className="cart-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-panel glass-strong" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h3>🛒 Your Cart</h3>
              <button className="btn-icon" onClick={() => setShowCart(false)}><FaTimes /></button>
            </div>
            {cart.length === 0 ? (
              <p className="cart-empty">Your cart is empty</p>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-info">
                        <span className="cart-item-emoji">{item.emoji}</span>
                        <div>
                          <p className="cart-item-name">{item.name}</p>
                          <p className="cart-item-price">₹{item.price}</p>
                        </div>
                      </div>
                      <div className="cart-item-qty">
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}><FaMinus /></button>
                        <span>{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}><FaPlus /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-summary">
                  <div className="cart-summary-row">
                    <span>Total</span>
                    <span className="cart-total">₹{cartTotal}</span>
                  </div>
                  <div className="cart-summary-row">
                    <span>Est. Wait</span>
                    <span className="cart-wait">{cartWaitTime} min</span>
                  </div>
                  <button className="btn btn-primary btn-lg cart-checkout-btn" onClick={handlePlaceOrder}>
                    Place Order • ₹{cartTotal}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* AI Chatbot */}
      <Chatbot />

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

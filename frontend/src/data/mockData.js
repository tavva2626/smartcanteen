// ==========================================
// SMART CANTEEN — MOCK DATA
// Complete mock database for frontend fallback
// ==========================================

export const menuItems = [
  { id: 1, name: "Masala Dosa", category: "Breakfast", price: 45, prepTime: 8, description: "Crispy golden dosa with spiced potato masala", rating: 4.5, isAvailable: true, stock: 25, emoji: "🥞", image: "/images/menu/dosa.jpg" },
  { id: 2, name: "Idli Sambar", category: "Breakfast", price: 30, prepTime: 5, description: "Soft steamed rice cakes with lentil sambar", rating: 4.2, isAvailable: true, stock: 30, emoji: "🍚", image: "/images/menu/idli.jpg" },
  { id: 3, name: "Poha", category: "Breakfast", price: 25, prepTime: 4, description: "Flattened rice with mustard seeds and curry leaves", rating: 4.0, isAvailable: true, stock: 20, emoji: "🥣", image: "/images/menu/poha.jpg" },
  { id: 4, name: "Chicken Biryani", category: "Lunch", price: 120, prepTime: 15, description: "Aromatic basmati rice with tender chicken", rating: 4.8, isAvailable: true, stock: 15, emoji: "🍗", image: "/images/menu/biryani.jpg" },
  { id: 5, name: "Veg Fried Rice", category: "Lunch", price: 60, prepTime: 6, description: "Wok-tossed rice with colorful vegetables", rating: 4.1, isAvailable: true, stock: 20, emoji: "🍚", image: "/images/menu/fried-rice.jpg" },
  { id: 6, name: "Paneer Butter Masala + Roti", category: "Lunch", price: 90, prepTime: 12, description: "Rich tomato curry with soft paneer cubes", rating: 4.6, isAvailable: true, stock: 18, emoji: "🥘", image: "/images/menu/paneer.jpg" },
  { id: 7, name: "Rajma Chawal", category: "Lunch", price: 70, prepTime: 8, description: "Hearty kidney bean curry with rice", rating: 4.3, isAvailable: true, stock: 22, emoji: "🍛", image: "/images/menu/rajma.jpg" },
  { id: 8, name: "Veggie Wrap", category: "Snacks", price: 45, prepTime: 4, description: "Fresh tortilla with grilled veggies", rating: 4.4, isAvailable: true, stock: 15, emoji: "🌯", image: "/images/menu/wrap.jpg" },
  { id: 9, name: "Samosa (2 pcs)", category: "Snacks", price: 20, prepTime: 3, description: "Crispy pastry with spiced potatoes", rating: 4.3, isAvailable: true, stock: 40, emoji: "🥟", image: "/images/menu/samosa.jpg" },
  { id: 10, name: "Chicken Sandwich", category: "Snacks", price: 55, prepTime: 5, description: "Grilled chicken with lettuce and cheese", rating: 4.2, isAvailable: true, stock: 12, emoji: "🥪", image: "/images/menu/sandwich.jpg" },
  { id: 11, name: "French Fries", category: "Snacks", price: 40, prepTime: 5, description: "Crispy golden potato fries", rating: 4.1, isAvailable: true, stock: 30, emoji: "🍟", image: "/images/menu/fries.jpg" },
  { id: 12, name: "Masala Chai", category: "Beverages", price: 15, prepTime: 3, description: "Aromatic tea with ginger and cardamom", rating: 4.6, isAvailable: true, stock: 50, emoji: "☕", image: "/images/menu/chai.jpg" },
  { id: 13, name: "Cold Coffee", category: "Beverages", price: 50, prepTime: 4, description: "Chilled coffee blended with milk and ice", rating: 4.5, isAvailable: true, stock: 25, emoji: "🧋", image: "/images/menu/coffee.jpg" },
  { id: 14, name: "Fresh Lime Soda", category: "Beverages", price: 25, prepTime: 2, description: "Fresh lime with soda and rock salt", rating: 4.3, isAvailable: true, stock: 35, emoji: "🥤", image: "/images/menu/lime-soda.jpg" },
  { id: 15, name: "Mango Lassi", category: "Beverages", price: 40, prepTime: 3, description: "Thick yogurt smoothie with mango", rating: 4.7, isAvailable: true, stock: 20, emoji: "🥭", image: "/images/menu/lassi.jpg" },
  { id: 16, name: "Gulab Jamun (2 pcs)", category: "Desserts", price: 30, prepTime: 2, description: "Soft milk dumplings in sugar syrup", rating: 4.4, isAvailable: true, stock: 25, emoji: "🍩", image: "/images/menu/gulab-jamun.jpg" },
  { id: 17, name: "Chocolate Brownie", category: "Desserts", price: 55, prepTime: 2, description: "Rich dark chocolate brownie", rating: 4.6, isAvailable: true, stock: 18, emoji: "🍰", image: "/images/menu/brownie.jpg" },
  { id: 18, name: "Egg Bhurji + Pav", category: "Breakfast", price: 40, prepTime: 6, description: "Spicy scrambled eggs with buttered pav", rating: 4.3, isAvailable: true, stock: 20, emoji: "🍳", image: "/images/menu/egg-pav.jpg" },
  { id: 19, name: "Chole Bhature", category: "Lunch", price: 65, prepTime: 10, description: "Spicy chickpea curry with fried bhature", rating: 4.5, isAvailable: true, stock: 16, emoji: "🥙", image: "/images/menu/chole.jpg" },
  { id: 20, name: "Fruit Salad Bowl", category: "Desserts", price: 35, prepTime: 3, description: "Fresh seasonal fruits with honey", rating: 4.2, isAvailable: true, stock: 15, emoji: "🥗", image: "/images/menu/fruit-salad.jpg" },
];

export const categories = ["All", "Breakfast", "Lunch", "Snacks", "Beverages", "Desserts"];

export const categoryEmojis = {
  All: "🍽️",
  Breakfast: "🌅",
  Lunch: "🍱",
  Snacks: "🍿",
  Beverages: "🥤",
  Desserts: "🍰",
};

export const canteenTables = [
  { id: 1, label: "T1", x: 10, y: 15, capacity: 2, shape: "round", status: "available", zone: "window" },
  { id: 2, label: "T2", x: 28, y: 15, capacity: 2, shape: "round", status: "occupied", zone: "window" },
  { id: 3, label: "T3", x: 46, y: 15, capacity: 4, shape: "square", status: "available", zone: "window" },
  { id: 4, label: "T4", x: 66, y: 15, capacity: 4, shape: "square", status: "reserved", zone: "window" },
  { id: 5, label: "T5", x: 86, y: 15, capacity: 2, shape: "round", status: "available", zone: "window" },
  { id: 6, label: "T6", x: 10, y: 38, capacity: 4, shape: "square", status: "available", zone: "center" },
  { id: 7, label: "T7", x: 30, y: 38, capacity: 6, shape: "long", status: "occupied", zone: "center" },
  { id: 8, label: "T8", x: 55, y: 38, capacity: 8, shape: "long", status: "available", zone: "center" },
  { id: 9, label: "T9", x: 82, y: 38, capacity: 4, shape: "square", status: "available", zone: "center" },
  { id: 10, label: "T10", x: 10, y: 60, capacity: 2, shape: "round", status: "available", zone: "counter" },
  { id: 11, label: "T11", x: 28, y: 60, capacity: 4, shape: "square", status: "occupied", zone: "counter" },
  { id: 12, label: "T12", x: 50, y: 60, capacity: 6, shape: "long", status: "available", zone: "counter" },
  { id: 13, label: "T13", x: 72, y: 60, capacity: 2, shape: "round", status: "maintenance", zone: "counter" },
  { id: 14, label: "T14", x: 90, y: 60, capacity: 4, shape: "square", status: "available", zone: "counter" },
  { id: 15, label: "T15", x: 15, y: 82, capacity: 8, shape: "long", status: "available", zone: "entrance" },
  { id: 16, label: "T16", x: 45, y: 82, capacity: 4, shape: "square", status: "reserved", zone: "entrance" },
  { id: 17, label: "T17", x: 75, y: 82, capacity: 6, shape: "long", status: "available", zone: "entrance" },
  { id: 18, label: "T18", x: 48, y: 38, capacity: 2, shape: "round", status: "available", zone: "center" },
];

export const analyticsData = {
  dailyRevenue: new Array(30).fill(0).map(() => 8000 + Math.random() * 5000),
  hourLabels: ["8AM", "9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM"],
  hourlyOrders: [5, 12, 18, 35, 48, 52, 38, 25, 15, 8, 4],
  popularItems: [],
  categoryRevenue: { Breakfast: 2500, Lunch: 5000, Snacks: 1500, Beverages: 2000, Desserts: 1000 },
  waitTimeTrend: [15, 14, 12, 10, 8, 8, 7],
  demandForecast: {
    actual: [42, 45, 48, 50, 52, 54, 47],
    predicted: [null, null, null, null, null, null, null, 50, 53, 56, 55, 52, 48],
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon*", "Tue*", "Wed*", "Thu*", "Fri*", "Sat*"],
  },
  tableOccupancy: [15, 25, 40, 65, 85, 90, 75, 55, 35, 20, 10],
  satisfaction: 4.2,
  kpis: {
    totalOrders: 1420,
    totalRevenue: 156800,
    avgWaitTime: 8,
    wasteReduction: 23,
    repeatCustomers: 78,
    tableBookingRate: 65,
  },
};

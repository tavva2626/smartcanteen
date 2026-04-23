import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import StudentView from "./pages/StudentView";
import TableBooking from "./pages/TableBooking";
import ManagerView from "./pages/ManagerView";
import Analytics from "./pages/Analytics";
import "./index.css";

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<PrivateRoute><Landing /></PrivateRoute>} />
      <Route path="/student" element={<PrivateRoute><StudentView /></PrivateRoute>} />
      <Route path="/booking" element={<PrivateRoute><TableBooking /></PrivateRoute>} />
      <Route path="/manager" element={<PrivateRoute><ManagerView /></PrivateRoute>} />
      <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Components
import Navbar from "../src/components/Utility/Navbar";
import Footer from "../src/components/Utility/Footer";

// Pages
import Home from "../src/components/Pages/Home";
import Products from "../src/components/Pages/Products";
import AdminDashboard from "./components/Admin/AdminDashboard";
import ProductDetail from "../src/components/Pages/ProductDetail";
import Cart from "../src/components/Pages/Cart";
import Wishlist from "../src/components/Pages/Wishlist";
import Profile from "../src/components/Pages/Profile";
import Checkout from "../src/components/Pages/Checkout";
import OrderSuccess from "../src/components/Pages/OrderSuccess";
import Login from "../src/components/Pages/Login";
import Register from "../src/components/Pages/Register";
import Categories from "./components/Pages/Categories";
import BkashPayment from "./components/Pages/BkashPayment";
import Order from "./components/Pages/Order";
import UserOrders from "./components/Pages/OrdersList";
// Context
import { AuthProvider } from "../src/components/contexts/AuthContext";

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div
            className="App"
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={<AdminDashboard />} />{" "}
                <Route path="/categories" element={<Categories />} />
                <Route path="/bkash-payment" element={<BkashPayment />} />
                <Route path="/order/:orderId" element={<Order />} />
                <Route path="/my-orders" element={<UserOrders />} />{" "}
                {/* <-- Add this line */}
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

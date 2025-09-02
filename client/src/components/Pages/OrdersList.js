import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Box,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import { Receipt, ArrowForward } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const getStatusColor = (status) => {
  switch (status) {
    case "delivered":
      return "success";
    case "shipped":
      return "info";
    case "processing":
      return "warning";
    case "cancelled":
      return "error";
    default:
      return "default";
  }
};

const getPaymentStatusColor = (status) => {
  switch (status) {
    case "completed":
      return "success";
    case "paid":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "error";
    case "refunded":
      return "info";
    default:
      return "default";
  }
};

const getPaymentStatusText = (status) => {
  switch (status) {
    case "completed":
      return "Paid";
    case "paid":
      return "Paid";
    case "pending":
      return "Pending";
    case "failed":
      return "Failed";
    case "refunded":
      return "Refunded";
    default:
      return status || "Pending";
  }
};

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};
        const { data } = await axios.get("/api/orders/my-orders", config);
        setOrders(data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load orders. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchOrders();
    else {
      setLoading(false);
      setError("Please log in to view your orders.");
    }
  }, [user]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your orders...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!orders.length) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          You have no orders yet.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate("/products")}
          startIcon={<ArrowForward />}
        >
          Shop Now
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Orders
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        {orders.map((order) => (
          <Grid item xs={12} md={6} key={order._id}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Order #{order._id.slice(-6).toUpperCase()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {order.items.length} item{order.items.length > 1 ? "s" : ""}{" "}
                    • ৳{order.totalAmount?.toFixed(2)}
                  </Typography>
                </Box>
                <Chip
                  label={order.status || "Processing"}
                  color={getStatusColor(order.status)}
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Receipt />}
                  onClick={() => navigate(`/order/${order._id}`)}
                >
                  View Details
                </Button>
                <Chip
                  label={getPaymentStatusText(order.paymentStatus)}
                  color={getPaymentStatusColor(order.paymentStatus)}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default UserOrders;

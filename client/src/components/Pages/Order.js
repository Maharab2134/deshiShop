import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { ArrowBack, Home, Receipt } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const Order = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const { data } = await axios.get(`/api/orders/${orderId}`, config);
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);
        setError(
          error.response?.data?.message ||
            "Failed to load order details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (user && orderId) {
      fetchOrder();
    } else if (!user) {
      setLoading(false);
      setError("Please log in to view order details");
    }
  }, [orderId, user]);

  // Status helpers
  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: "warning", label: "Pending" },
      processing: { color: "info", label: "Processing" },
      shipped: { color: "primary", label: "Shipped" },
      delivered: { color: "success", label: "Delivered" },
      cancelled: { color: "error", label: "Cancelled" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Chip
        label={config.label}
        color={config.color}
        variant="filled"
        size="small"
      />
    );
  };

  const getPaymentStatusChip = (status) => {
    const statusConfig = {
      pending: { color: "warning", label: "Pending" },
      completed: { color: "success", label: "Paid" },
      failed: { color: "error", label: "Failed" },
      refunded: { color: "info", label: "Refunded" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Chip
        label={config.label}
        color={config.color}
        variant="filled"
        size="small"
      />
    );
  };

  const getStatusSteps = (status) => {
    const steps = [
      { label: "Order Placed", status: "completed" },
      { label: "Processing", status: "pending" },
      { label: "Shipped", status: "pending" },
      { label: "Delivered", status: "pending" },
    ];
    switch (status) {
      case "processing":
        steps[1].status = "completed";
        break;
      case "shipped":
        steps[1].status = "completed";
        steps[2].status = "completed";
        break;
      case "delivered":
        steps[1].status = "completed";
        steps[2].status = "completed";
        steps[3].status = "completed";
        break;
      default:
        break;
    }
    return steps;
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading order details...
        </Typography>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert
          severity={error === "Access denied" ? "warning" : "error"}
          sx={{ mb: 3 }}
        >
          {error === "Access denied"
            ? "You do not have permission to view this order."
            : error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/my-orders")}
        >
          Back to My Orders
        </Button>
      </Container>
    );
  }

  // Not found state
  if (!order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Order not found.
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/my-orders")}
        >
          Back to My Orders
        </Button>
      </Container>
    );
  }

  // Helper for shipping address (handle both object and string)
  const shipping = order.shippingAddress || {};
  const shippingLines = Array.isArray(shipping)
    ? shipping
    : typeof shipping === "object"
    ? [
        shipping.firstName && shipping.lastName
          ? `${shipping.firstName} ${shipping.lastName}`
          : "",
        shipping.address || "",
        shipping.city && shipping.state
          ? `${shipping.city}, ${shipping.state} ${shipping.zipCode || ""}`
          : "",
        shipping.phone ? `Phone: ${shipping.phone}` : "",
      ]
    : [shipping];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" component="h1">
          Order Details
        </Typography>
      </Box>

      {/* Order Status Stepper */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Order Status
        </Typography>
        <Stepper
          activeStep={getStatusSteps(order.status).findIndex(
            (step) => step.status === "pending"
          )}
          alternativeLabel
          sx={{ mt: 3 }}
        >
          {getStatusSteps(order.status).map((step, index) => (
            <Step key={step.label} completed={step.status === "completed"}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          {getStatusChip(order.status)}
        </Box>
      </Paper>

      <Grid container spacing={4}>
        {/* Order Items */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Items ({order.items.length})
            </Typography>
            <List>
              {order.items.map((item, index) => {
                // Support both populated and non-populated product
                const product = item.product || {};
                const image =
                  product.images && product.images.length
                    ? product.images[0]
                    : item.image || "";
                const name = product.name || item.name || "Product";
                return (
                  <React.Fragment key={item._id || index}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar
                          src={image}
                          alt={name}
                          variant="square"
                          sx={{ width: 60, height: 60, mr: 2 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={name}
                        secondary={`Quantity: ${item.quantity}`}
                        primaryTypographyProps={{ variant: "h6" }}
                      />
                      <Typography variant="body1" fontWeight="bold">
                        ৳{(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </ListItem>
                    {index < order.items.length - 1 && (
                      <Divider variant="inset" component="li" />
                    )}
                  </React.Fragment>
                );
              })}
            </List>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" fontWeight="bold">
                ৳{order.totalAmount?.toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Order Information */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Order ID
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontSize: "0.9rem", wordBreak: "break-all" }}
                >
                  {order._id}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Order Date
                </Typography>
                <Typography variant="body1">
                  {new Date(order.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Payment Method
                </Typography>
                <Typography variant="body1" textTransform="capitalize">
                  {order.paymentMethod}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Payment Status
                </Typography>
                {getPaymentStatusChip(order.paymentStatus)}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Shipping Address
              </Typography>
              {shippingLines.map(
                (line, idx) =>
                  line && (
                    <Typography variant="body1" key={idx}>
                      {line}
                    </Typography>
                  )
              )}
            </CardContent>
          </Card>

          {order.transactionId && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Transaction ID
                </Typography>
                <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
                  {order.transactionId}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Actions */}
      <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "center" }}>
        <Button
          variant="contained"
          startIcon={<Home />}
          onClick={() => navigate("/")}
        >
          Continue Shopping
        </Button>
        <Button
          variant="outlined"
          startIcon={<Receipt />}
          onClick={() => navigate("/my-orders")}
        >
          View All Orders
        </Button>
      </Box>
    </Container>
  );
};

export default Order;

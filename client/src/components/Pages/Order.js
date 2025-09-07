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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import {
  ArrowBack,
  Home,
  Receipt,
  Print,
  SupportAgent,
  Cancel,
  LocalShipping,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

// Add print styles
const printStyles = `
  @media print {
    @page {
      margin: 24mm 12mm 24mm 12mm;
      size: A4 portrait;
    }
    body * {
      visibility: hidden;
    }
    .print-container, .print-container * {
      visibility: visible;
    }
    .print-container {
      position: absolute;
      left: 0;
      top: 0;
      width: 100vw;
      min-height: 100vh;
      background: #fff;
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #222;
      padding: 0;
      margin: 0;
    }
    .print-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #1976d2;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .print-logo {
      font-size: 2rem;
      font-weight: bold;
      color: #1976d2;
      letter-spacing: 2px;
    }
    .print-order-info {
      text-align: right;
      font-size: 1rem;
    }
    .print-section-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1976d2;
      margin-bottom: 8px;
      margin-top: 24px;
      letter-spacing: 1px;
    }
    .print-address, .print-meta {
      font-size: 0.98rem;
      margin-bottom: 8px;
    }
    .print-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      margin-bottom: 16px;
      font-size: 0.98rem;
    }
    .print-table th, .print-table td {
      border: 1px solid #e0e0e0;
      padding: 8px 10px;
      text-align: left;
    }
    .print-table th {
      background: #f5f7fa;
      color: #1976d2;
      font-weight: 600;
    }
    .print-table tr:nth-child(even) {
      background: #fafbfc;
    }
    .print-totals {
      margin-top: 12px;
      width: 320px;
      float: right;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      background: #f5f7fa;
      padding: 12px 18px;
    }
    .print-totals-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 1rem;
    }
    .print-totals-row.total {
      font-weight: bold;
      color: #1976d2;
      font-size: 1.1rem;
      border-top: 1px solid #1976d2;
      padding-top: 6px;
      margin-top: 8px;
    }
    .print-thankyou {
      margin-top: 80px;
      text-align: center;
      font-size: 1.1rem;
      color: #1976d2;
      font-weight: 500;
      letter-spacing: 1px;
    }
  }
`;

const Order = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Add print styles to document
    const styleSheet = document.createElement("style");
    styleSheet.innerText = printStyles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

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

  const handleCancelOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.put(
        `/api/orders/${orderId}/cancel`,
        {},
        config
      );
      setOrder(data);
      setCancelDialogOpen(false);
    } catch (error) {
      console.error("Error cancelling order:", error);
      setError(
        error.response?.data?.message ||
          "Failed to cancel order. Please try again."
      );
    }
  };

  const handlePrintReceipt = () => {
    const printContent = document.getElementById("print-content");
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // Reload to restore the original page
  };

  const handleContactSupport = () => {
    navigate("/contact", {
      state: { subject: `Order #${order._id} Inquiry`, orderId: order._id },
    });
  };

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

  // Calculate estimated delivery date
  const getEstimatedDelivery = (orderDate, status) => {
    if (status === "delivered" || status === "cancelled") return null;

    const orderDateObj = new Date(orderDate);
    let deliveryDate = new Date(orderDateObj);

    if (status === "pending" || status === "processing") {
      deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days from order date
    } else if (status === "shipped") {
      deliveryDate.setDate(deliveryDate.getDate() + 3); // 3 days from shipping
    }

    return deliveryDate.toLocaleDateString();
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
          className="no-print"
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
          className="no-print"
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

  const estimatedDelivery = getEstimatedDelivery(order.createdAt, order.status);
  const canCancel = order.status === "pending" || order.status === "processing";

  return (
    <>
      {/* Regular view */}
      <Container maxWidth="lg" sx={{ py: 4 }} className="no-print">
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 4,
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h4" component="h1">
            Order Details
          </Typography>
          <Box>
            <IconButton onClick={handlePrintReceipt} sx={{ mr: 1 }}>
              <Print />
            </IconButton>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate("/my-orders")}
            >
              Back to Orders
            </Button>
          </Box>
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 2,
              alignItems: "center",
              gap: 2,
            }}
          >
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
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body1">Subtotal:</Typography>
                <Typography variant="body1">
                  ৳{order.subtotal?.toFixed(2) || order.totalAmount?.toFixed(2)}
                </Typography>
              </Box>
              {order.shippingCost > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body1">Shipping:</Typography>
                  <Typography variant="body1">
                    ৳{order.shippingCost.toFixed(2)}
                  </Typography>
                </Box>
              )}
              {order.taxAmount > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body1">Tax:</Typography>
                  <Typography variant="body1">
                    ৳{order.taxAmount.toFixed(2)}
                  </Typography>
                </Box>
              )}
              {order.discountAmount > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body1">Discount:</Typography>
                  <Typography variant="body1" color="error">
                    -৳{order.discountAmount.toFixed(2)}
                  </Typography>
                </Box>
              )}
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

            {order.trackingNumber && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tracking Information
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <LocalShipping sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Tracking Number
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
                    {order.trackingNumber}
                  </Typography>
                  {order.trackingUrl && (
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => window.open(order.trackingUrl, "_blank")}
                    >
                      Track Package
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {order.transactionId && (
              <Card sx={{ mb: 3 }}>
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

            {/* Order Actions */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Actions
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<SupportAgent />}
                    onClick={handleContactSupport}
                  >
                    Contact Support
                  </Button>
                  {canCancel && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => setCancelDialogOpen(true)}
                    >
                      Cancel Order
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
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

        {/* Cancel Order Dialog */}
        <Dialog
          open={cancelDialogOpen}
          onClose={() => setCancelDialogOpen(false)}
        >
          <DialogTitle>Cancel Order</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelDialogOpen(false)}>
              No, Keep Order
            </Button>
            <Button onClick={handleCancelOrder} color="error" autoFocus>
              Yes, Cancel Order
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      {/* Print view (hidden from screen) */}
      <div id="print-content" style={{ display: "none" }}>
        <div className="print-container">
          {/* Header */}
          <div className="print-header">
            <div className="print-logo">
              {/* You can use an <img src="logo.png" /> here if you have a logo */}
              deshiShop
            </div>
            <div className="print-order-info">
              <div>Order Receipt</div>
              <div>Date: {new Date().toLocaleDateString()}</div>
              <div>Order ID: {order._id}</div>
            </div>
          </div>

          {/* Order & Customer Info */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div>
              <div className="print-section-title">Shipping Address</div>
              <div className="print-address">
                {shippingLines.map(
                  (line, idx) => line && <div key={idx}>{line}</div>
                )}
              </div>
            </div>
            <div>
              <div className="print-section-title">Order Details</div>
              <div className="print-meta">
                <div>
                  Status: <b>{order.status}</b>
                </div>
                <div>
                  Payment: <b>{order.paymentMethod}</b> ({order.paymentStatus})
                </div>
                {order.trackingNumber && (
                  <div>
                    Tracking: <b>{order.trackingNumber}</b>
                  </div>
                )}
                {estimatedDelivery && (
                  <div>
                    Est. Delivery: <b>{estimatedDelivery}</b>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="print-section-title">Order Items</div>
          <table className="print-table">
            <thead>
              <tr>
                <th>Product</th>
                <th style={{ textAlign: "right" }}>Qty</th>
                <th style={{ textAlign: "right" }}>Unit Price</th>
                <th style={{ textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => {
                const product = item.product || {};
                const name = product.name || item.name || "Product";
                return (
                  <tr key={idx}>
                    <td>{name}</td>
                    <td style={{ textAlign: "right" }}>{item.quantity}</td>
                    <td style={{ textAlign: "right" }}>
                      ৳{item.price.toFixed(2)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      ৳{(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals */}
          <div className="print-totals">
            <div className="print-totals-row">
              <span>Subtotal:</span>
              <span>
                ৳{order.subtotal?.toFixed(2) || order.totalAmount?.toFixed(2)}
              </span>
            </div>
            {order.shippingCost > 0 && (
              <div className="print-totals-row">
                <span>Shipping:</span>
                <span>৳{order.shippingCost.toFixed(2)}</span>
              </div>
            )}
            {order.taxAmount > 0 && (
              <div className="print-totals-row">
                <span>Tax:</span>
                <span>৳{order.taxAmount.toFixed(2)}</span>
              </div>
            )}
            {order.discountAmount > 0 && (
              <div className="print-totals-row">
                <span>Discount:</span>
                <span style={{ color: "#d32f2f" }}>
                  -৳{order.discountAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="print-totals-row total">
              <span>Total:</span>
              <span>৳{order.totalAmount?.toFixed(2)}</span>
            </div>
          </div>

          {/* Thank you */}
          <div className="print-thankyou">Thank you for shopping with us!</div>
        </div>
      </div>
    </>
  );
};

export default Order;

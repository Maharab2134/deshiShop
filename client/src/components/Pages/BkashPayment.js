import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Paper,
  Alert,
  Fade,
  Slide,
  Zoom,
  IconButton,
  CircularProgress,
  InputAdornment,
  Snackbar,
  useTheme,
} from "@mui/material";
import {
  ArrowBack,
  PhoneAndroid,
  VerifiedUser,
  CheckCircle,
  ContentCopy,
  Sms,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const BkashPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const theme = useTheme();
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [userTransactionId, setUserTransactionId] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [paymentCode] = useState(`01786896197`);

  // Get order data from navigation state
  const orderData = location.state?.orderData;

  useEffect(() => {
    if (!orderData) {
      navigate("/checkout");
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, orderData]);

  useEffect(() => {
    // Generate a random reference ID when component mounts
    setTransactionId(`BK${Date.now()}${Math.floor(Math.random() * 1000)}`);
  }, []);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 11);
    setPhone(value);
  };

  const handleTransactionIdChange = (e) => {
    setUserTransactionId(e.target.value);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const completeBkashOrder = async () => {
    if (!phone || phone.length !== 11) {
      setError("Please enter a valid 11-digit phone number");
      return;
    }
    if (!userTransactionId) {
      setError("Please enter the transaction ID from bKash");
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        items: orderData.cartItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        shippingAddress: orderData.shippingAddress,
        paymentMethod: "bkash",
        phone: phone,
        notes: `${
          orderData.notes || ""
        } bKash Transaction ID: ${userTransactionId}`,
        totalAmount: orderData.totalAmount,
        bkashAccountNumber: phone,
        bkashTransactionId: userTransactionId,
        bkashReferenceId: transactionId,
      };

      const response = await axios.post("/api/orders", orderPayload);
      await axios.delete("/api/cart/clear");

      setPaymentSuccess(true);

      setTimeout(() => {
        navigate("/order-success", {
          state: { orderId: response.data._id },
        });
      }, 2000);
    } catch (error) {
      console.error("Error creating order:", error);
      setError("Error creating order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!orderData) {
    return null;
  }

  if (paymentSuccess) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Zoom in={true} timeout={800}>
            <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 3 }} />
          </Zoom>
          <Typography variant="h4" gutterBottom color="success.main">
            Payment Successful!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your payment is being processed. Redirecting to order
            confirmation...
          </Typography>
          <CircularProgress sx={{ mt: 3 }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <IconButton onClick={() => navigate("/checkout")} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h3" component="h1" fontWeight="700">
          bKash Payment
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Payment Section */}
        <Grid item xs={12} md={7}>
          <Slide in={true} timeout={500} direction="up">
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: 3,
                background: "linear-gradient(135deg, #e2136e 0%, #c10d5c 100%)",
                color: "white",
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                {/* bKash Header */}
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    BkashPayment{" "}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    Secure Payment Gateway
                  </Typography>
                </Box>

                {/* Payment Details */}
                <Paper
                  sx={{ p: 3, mb: 3, backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="body2">Merchant:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      DeshiShop
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="body2">Amount:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      ৳{orderData.totalAmount.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">Reference ID:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {transactionId}
                    </Typography>
                  </Box>
                </Paper>

                {/* Phone Input */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <PhoneAndroid sx={{ fontSize: 16, mr: 1 }} />
                    bKash Account Number
                  </Typography>
                  <TextField
                    fullWidth
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="01XXX-XXXXXX"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">+88</InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "white",
                        borderRadius: 1,
                      },
                    }}
                  />
                </Box>

                {/* Payment Code */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Sms sx={{ fontSize: 16, mr: 1 }} />
                    Payment Number (Copy this)
                  </Typography>
                  <Box
                    onClick={copyToClipboard}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: 1,
                      padding: 1.5,
                      marginTop: 1,
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                      },
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {paymentCode}
                    </Typography>
                    <ContentCopy />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ mt: 1, display: "block" }}
                  >
                    Copy this code and paste it in your bKash app
                  </Typography>
                </Box>

                {/* Transaction ID Input */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <VerifiedUser sx={{ fontSize: 16, mr: 1 }} />
                    Transaction ID (From bKash SMS)
                  </Typography>
                  <TextField
                    fullWidth
                    value={userTransactionId}
                    onChange={handleTransactionIdChange}
                    placeholder="Enter transaction ID from bKash"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "white",
                        borderRadius: 1,
                      },
                    }}
                  />
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate("/checkout")}
                    disabled={loading}
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.1)",
                      color: "white",
                      "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={completeBkashOrder}
                    disabled={loading || !phone || !userTransactionId}
                    sx={{
                      backgroundColor: "white",
                      color: "#e2136e",
                      fontWeight: "bold",
                      "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Confirm Payment"
                    )}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Slide>
        </Grid>

        {/* Instructions and Timer */}
        <Grid item xs={12} md={5}>
          <Fade in={true} timeout={800}>
            <Box>
              {/* Countdown Timer */}
              <Paper sx={{ p: 3, mb: 3, textAlign: "center" }}>
                <Typography variant="h6" gutterBottom>
                  Time Remaining
                </Typography>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    border: `3px solid ${theme.palette.primary.main}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    margin: "0 auto",
                    animation: "pulse 1s infinite",
                    "@keyframes pulse": {
                      "0%": { transform: "scale(1)" },
                      "50%": { transform: "scale(1.05)" },
                      "100%": { transform: "scale(1)" },
                    },
                  }}
                >
                  {formatTime(countdown)}
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  Complete payment within this time
                </Typography>
              </Paper>

              {/* Instructions */}
              <Paper sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <PhoneAndroid sx={{ mr: 1 }} />
                  How to Pay with bKash
                </Typography>
                <Box component="ol" sx={{ pl: 2, "& li": { mb: 1 } }}>
                  <li>Enter your bKash registered phone number</li>
                  <li>Copy the payment number provided</li>
                  <li>Open bKash app on your phone</li>
                  <li>Complete payment in the bKash app</li>
                  <li>Check SMS for transaction ID and enter it here</li>
                </Box>
                <Alert severity="info" sx={{ mt: 2 }}>
                  Make sure you have sufficient balance in your bKash account
                </Alert>
              </Paper>

              {/* Support Info */}
              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Need help? Call bKash support: <strong>16247</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Available 24/7
                </Typography>
              </Paper>
            </Box>
          </Fade>
        </Grid>
      </Grid>

      {/* Copy Success Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        message="Payment code copied to clipboard!"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Container>
  );
};

export default BkashPayment;

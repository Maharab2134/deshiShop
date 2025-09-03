import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Divider,
  Radio,
  RadioGroup,
  FormControl,
  Alert,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Fade,
  Slide,
  Zoom,
  Grow,
  Collapse,
  useTheme,
  useMediaQuery,
  Paper,
  FormControlLabel,
  Snackbar,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import {
  LocalShipping,
  Payment,
  Assignment,
  ArrowBack,
  CheckCircle,
  AccountBalanceWallet,
} from "@mui/icons-material";

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [expandedSection, setExpandedSection] = useState("shipping");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [orderData, setOrderData] = useState({
    shippingAddress: "",
    paymentMethod: "cash-on-delivery",
    phone: "",
    notes: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    fetchCartItems();
  }, [user, navigate]);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get("/api/cart");
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      showSnackbar("Error loading cart items", "error");
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Calculate all amounts first
    const subtotal = calculateTotal();
    const shipping = 50;
    const tax = subtotal * 0.02;
    const totalAmount = subtotal + shipping + tax;

    if (orderData.paymentMethod === "bkash") {
      navigate("/bkash-payment", {
        state: {
          orderData: {
            ...orderData,
            subtotal: subtotal,
            shippingFee: shipping,
            taxAmount: tax,
            totalAmount: totalAmount,
            cartItems: cartItems.map((item) => ({
              ...item,
              name: item.product.name,
              image: item.product.images?.[0] || "",
            })),
          },
        },
      });
      return;
    }

    if (
      !cartItems.length ||
      !orderData.shippingAddress.trim() ||
      !orderData.phone.trim()
    ) {
      showSnackbar("Please fill all required fields", "error");
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        items: cartItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
          name: item.product.name, // Add product name
          image: item.product.images?.[0] || "", // Add product image
        })),
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        phone: orderData.phone,
        notes: orderData.notes,
        subtotal: subtotal,
        shippingFee: shipping,
        taxAmount: tax,
        totalAmount: totalAmount,
      };

      console.log("Order payload:", orderPayload);

      const response = await axios.post("/api/orders", orderPayload);
      await axios.delete("/api/cart/clear");

      showSnackbar("Order placed successfully!", "success");
      navigate("/order-success", {
        state: { orderId: response.data._id },
      });
    } catch (error) {
      console.error("Error creating order:", error);
      showSnackbar(
        error.response?.data?.message ||
          "Error creating order. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  };

  const steps = ["Shipping", "Payment", "Review"];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setExpandedSection(activeStep === 0 ? "payment" : "review");
    } else {
      document.getElementById("checkout-form").requestSubmit();
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setExpandedSection(activeStep === 2 ? "payment" : "shipping");
  };

  if (!user || cartItems.length === 0) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Fade in={true} timeout={800}>
          <Typography variant="h4" align="center" color="textSecondary">
            {!user ? "Please login to checkout" : "Your cart is empty"}
          </Typography>
        </Fade>
        <Fade in={true} timeout={1000}>
          <Button
            variant="contained"
            onClick={() => navigate(!user ? "/login" : "/products")}
            size="large"
            sx={{ borderRadius: 3, px: 4 }}
          >
            {!user ? "Login" : "Browse Products"}
          </Button>
        </Fade>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }} size="large">
          <ArrowBack />
        </IconButton>
        <Typography variant="h3" component="h1" fontWeight="700">
          Checkout
        </Typography>
      </Box>

      {/* Stepper */}
      <Slide direction="down" in={true} timeout={500}>
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel={!isMobile}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </Slide>

      <form id="checkout-form" onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            {/* Shipping Information */}
            <Collapse in={expandedSection === "shipping"} timeout={600}>
              <Fade in={expandedSection === "shipping"} timeout={800}>
                <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <LocalShipping
                        color="primary"
                        sx={{ mr: 2, fontSize: 32 }}
                      />
                      <Typography variant="h5" fontWeight="600">
                        Shipping Information
                      </Typography>
                    </Box>

                    <TextField
                      fullWidth
                      label="Shipping Address"
                      name="shippingAddress"
                      value={orderData.shippingAddress}
                      onChange={handleInputChange}
                      required
                      multiline
                      rows={3}
                      sx={{ mb: 3 }}
                      placeholder="Enter your complete shipping address"
                    />

                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={orderData.phone}
                      onChange={handleInputChange}
                      required
                      sx={{ mb: 3 }}
                      placeholder="e.g., 01XXXXXXXXX"
                    />

                    <TextField
                      fullWidth
                      label="Order Notes (Optional)"
                      name="notes"
                      value={orderData.notes}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                      placeholder="Special delivery instructions or notes about your order"
                    />
                  </CardContent>
                </Card>
              </Fade>
            </Collapse>

            {/* Payment Method */}
            <Collapse in={expandedSection === "payment"} timeout={600}>
              <Fade in={expandedSection === "payment"} timeout={800}>
                <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <Payment color="primary" sx={{ mr: 2, fontSize: 32 }} />
                      <Typography variant="h5" fontWeight="600">
                        Payment Method
                      </Typography>
                    </Box>

                    <FormControl component="fieldset" fullWidth>
                      <RadioGroup
                        name="paymentMethod"
                        value={orderData.paymentMethod}
                        onChange={handleInputChange}
                      >
                        <Grow in={true} timeout={500}>
                          <Paper
                            elevation={
                              orderData.paymentMethod === "cash-on-delivery"
                                ? 4
                                : 1
                            }
                            sx={{
                              mb: 2,
                              p: 2,
                              borderRadius: 3,
                              border:
                                orderData.paymentMethod === "cash-on-delivery"
                                  ? `2px solid ${theme.palette.primary.main}`
                                  : "none",
                              transition: "all 0.3s ease",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              setOrderData({
                                ...orderData,
                                paymentMethod: "cash-on-delivery",
                              })
                            }
                          >
                            <FormControlLabel
                              value="cash-on-delivery"
                              control={<Radio />}
                              label={
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <AccountBalanceWallet sx={{ mr: 1 }} />
                                  <Typography variant="h6">
                                    Cash on Delivery
                                  </Typography>
                                </Box>
                              }
                            />
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              sx={{ ml: 4 }}
                            >
                              Pay with cash when your order is delivered
                            </Typography>
                          </Paper>
                        </Grow>

                        <Grow in={true} timeout={700}>
                          <Paper
                            elevation={
                              orderData.paymentMethod === "bkash" ? 4 : 1
                            }
                            sx={{
                              mb: 2,
                              p: 2,
                              borderRadius: 3,
                              border:
                                orderData.paymentMethod === "bkash"
                                  ? `2px solid ${theme.palette.primary.main}`
                                  : "none",
                              transition: "all 0.3s ease",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              setOrderData({
                                ...orderData,
                                paymentMethod: "bkash",
                              })
                            }
                          >
                            <FormControlLabel
                              value="bkash"
                              control={<Radio />}
                              label={
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <Typography variant="h6">bKash</Typography>
                                </Box>
                              }
                            />
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              sx={{ ml: 4 }}
                            >
                              Pay securely with bKash
                            </Typography>
                          </Paper>
                        </Grow>
                      </RadioGroup>
                    </FormControl>

                    {orderData.paymentMethod === "bkash" && (
                      <Zoom
                        in={orderData.paymentMethod === "bkash"}
                        timeout={500}
                      >
                        <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                          You'll be redirected to the bKash payment page to
                          complete your payment.
                        </Alert>
                      </Zoom>
                    )}
                  </CardContent>
                </Card>
              </Fade>
            </Collapse>
          </Grid>

          <Grid item xs={12} lg={4}>
            {/* Order Summary */}
            <Fade in={true} timeout={1000}>
              <Card
                sx={{
                  position: "sticky",
                  top: 100,
                  borderRadius: 3,
                  boxShadow: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Assignment color="primary" sx={{ mr: 2 }} />
                    <Typography variant="h5" fontWeight="600">
                      Order Summary
                    </Typography>
                  </Box>

                  <Box sx={{ maxHeight: 300, overflow: "auto", mb: 2 }}>
                    {cartItems.map((item, index) => (
                      <Grow
                        in={true}
                        timeout={500 + index * 100}
                        key={item.product._id}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 2,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box
                              component="img"
                              src={
                                item.product.images && item.product.images[0]
                                  ? item.product.images[0]
                                  : "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNFRUVFRUUiLz48dGV4dCB4PSIxNSIgeT0iMzAiIGZpbGw9IiM4ODgiPkltYWdlPC90ZXh0Pjwvc3ZnPg=="
                              }
                              alt={item.product.name}
                              sx={{
                                width: 50,
                                height: 50,
                                objectFit: "cover",
                                borderRadius: 2,
                                mr: 2,
                              }}
                            />
                            <Box>
                              <Typography variant="body2" fontWeight="500">
                                {item.product.name}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Qty: {item.quantity}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2" fontWeight="500">
                            ৳{(item.product.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Box>
                      </Grow>
                    ))}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Subtotal:</Typography>
                    <Typography variant="body2">
                      ৳{calculateTotal().toFixed(2)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Shipping:</Typography>
                    <Typography variant="body2">৳50.00</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2">Tax (2%):</Typography>
                    <Typography variant="body2">
                      ৳{(calculateTotal() * 0.15).toFixed(2)}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    mt={2}
                    mb={3}
                  >
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6" color="primary">
                      ৳
                      {(
                        calculateTotal() +
                        50 +
                        calculateTotal() * 0.15
                      ).toFixed(2)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    {activeStep > 0 && (
                      <Button
                        onClick={handleBack}
                        variant="outlined"
                        fullWidth
                        size="large"
                        disabled={loading}
                        sx={{ borderRadius: 3, py: 1.5 }}
                      >
                        Back
                      </Button>
                    )}
                    <Button
                      type={
                        activeStep === steps.length - 1 ? "submit" : "button"
                      }
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={loading}
                      onClick={
                        activeStep < steps.length - 1 ? handleNext : undefined
                      }
                      sx={{
                        borderRadius: 3,
                        py: 1.5,
                        fontWeight: "bold",
                      }}
                    >
                      {loading ? (
                        "Processing..."
                      ) : activeStep === steps.length - 1 ? (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <CheckCircle sx={{ mr: 1 }} />
                          Place Order
                        </Box>
                      ) : (
                        `Continue to ${steps[activeStep + 1]}`
                      )}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Checkout;

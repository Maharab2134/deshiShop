import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  IconButton,
  Divider,
  Paper,
  Fade,
  Slide,
  Zoom,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
  alpha,
  Skeleton,
} from "@mui/material";
import {
  Delete,
  Add,
  Remove,
  ShoppingCartCheckout,
  ShoppingBag,
  LocalShipping,
  Redeem,
  ArrowBack,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { keyframes } from "@emotion/react";

// Animation for empty cart
const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
  40% {transform: translateY(-20px);}
  60% {transform: translateY(-10px);}
`;

// Animation for item removal
const fadeOut = keyframes`
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.8); }
`;

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingItem, setRemovingItem] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      // Simulate API call with timeout for demo
      setTimeout(async () => {
        try {
          const response = await axios.get("/api/cart");
          setCartItems(response.data.items || []);
        } catch (error) {
          console.error("Error fetching cart items:", error);
        } finally {
          setLoading(false);
        }
      }, 800);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await axios.put("/api/cart/update", {
        productId,
        quantity: newQuantity,
      });
      setCartItems((items) =>
        items.map((item) =>
          item.product._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const removeItem = async (productId) => {
    setRemovingItem(productId);

    // Wait for animation to complete before actually removing
    setTimeout(async () => {
      try {
        await axios.delete("/api/cart/remove", {
          data: { productId },
        });
        setCartItems((items) =>
          items.filter((item) => item.product._id !== productId)
        );
      } catch (error) {
        console.error("Error removing item:", error);
      } finally {
        setRemovingItem(null);
      }
    }, 300);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  };

  const computeDiscountAmount = (subtotal) => {
    if (!appliedCoupon) return 0;
    const { type, value } = appliedCoupon;
    if (type === "percent") {
      return Math.min(subtotal, (subtotal * value) / 100);
    }
    if (type === "flat") {
      return Math.min(subtotal, value);
    }
    return 0; // 'shipping' coupon handled on shipping cost
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage({ type: "error", text: "Enter a coupon code" });
      return;
    }
    setCouponLoading(true);
    setCouponMessage(null);
    try {
      // Attempt backend validation first (if implemented)
      const res = await axios.get(
        `/api/coupons/validate?code=${encodeURIComponent(couponCode.trim())}`
      );
      if (res.data && res.data.valid) {
        setAppliedCoupon({
          code: couponCode.trim().toUpperCase(),
          type: res.data.type, // 'percent' | 'flat' | 'shipping'
          value: res.data.value,
          description: res.data.description || "Applied",
        });
        setCouponMessage({ type: "success", text: "Coupon applied" });
        return;
      }
      // If backend says invalid, fall through to local known coupons below
    } catch (err) {
      // Fallback to local coupons when backend not available
    } finally {
      setCouponLoading(false);
    }

    // Local known coupons (editable)
    const code = couponCode.trim().toUpperCase();
    const known = {
      SAVE10: { type: "percent", value: 10, description: "10% off subtotal" },
      BD50: { type: "flat", value: 50, description: "৳50 off subtotal" },
      FREESHIP: { type: "shipping", value: 50, description: "Free shipping" },
    };
    if (known[code]) {
      setAppliedCoupon({ code, ...known[code] });
      setCouponMessage({ type: "success", text: "Coupon applied" });
    } else {
      setAppliedCoupon(null);
      setCouponMessage({ type: "error", text: "Invalid coupon code" });
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponMessage({ type: "info", text: "Coupon removed" });
  };

  const calculateSavings = () => {
    return cartItems.reduce((savings, item) => {
      if (item.product.originalPrice) {
        return (
          savings +
          (item.product.originalPrice - item.product.price) * item.quantity
        );
      }
      return savings;
    }, 0);
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (!user) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Fade in={true} timeout={800}>
          <Box textAlign="center">
            <ShoppingBag
              sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              Please login to view your cart
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/login"
              sx={{ mt: 2 }}
            >
              Sign In
            </Button>
          </Box>
        </Fade>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700, mb: 4 }}
        >
          Your Shopping Cart
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {[1, 2, 3].map((item) => (
              <Card key={item} sx={{ mb: 2, borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={3}>
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={100}
                        sx={{ borderRadius: 1 }}
                      />
                    </Grid>
                    <Grid item xs={9}>
                      <Skeleton variant="text" height={30} width="60%" />
                      <Skeleton
                        variant="text"
                        height={20}
                        width="30%"
                        sx={{ mt: 1 }}
                      />
                      <Box display="flex" alignItems="center" mt={2}>
                        <Skeleton
                          variant="rectangular"
                          width={100}
                          height={40}
                          sx={{ borderRadius: 1 }}
                        />
                        <Skeleton
                          variant="text"
                          height={30}
                          width={60}
                          sx={{ mx: 2 }}
                        />
                        <Skeleton
                          variant="rectangular"
                          width={100}
                          height={40}
                          sx={{ borderRadius: 1 }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Skeleton variant="text" height={30} width="50%" />
              <Divider sx={{ my: 2 }} />
              <Skeleton variant="text" height={25} />
              <Skeleton variant="text" height={25} sx={{ mt: 1 }} />
              <Skeleton variant="text" height={25} sx={{ mt: 1 }} />
              <Divider sx={{ my: 2 }} />
              <Skeleton variant="text" height={35} />
              <Skeleton
                variant="rectangular"
                height={45}
                sx={{ mt: 2, borderRadius: 1 }}
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        component={Link}
        to="/products"
        sx={{ mb: 3, color: "text.secondary" }}
      >
        Continue Shopping
      </Button>

      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 700, mb: 4 }}
      >
        Your Shopping Cart
        <Typography
          component="span"
          color="text.secondary"
          sx={{ ml: 1, fontWeight: 400 }}
        >
          ({cartItems.length} {cartItems.length === 1 ? "item" : "items"})
        </Typography>
      </Typography>

      {cartItems.length === 0 ? (
        <Fade in={true} timeout={800}>
          <Box
            textAlign="center"
            sx={{
              mt: 8,
              py: 8,
              animation: `${bounce} 2s infinite`,
            }}
          >
            <ShoppingBag
              sx={{
                fontSize: 100,
                color: "text.secondary",
                opacity: 0.7,
                mb: 3,
              }}
            />
            <Typography variant="h5" gutterBottom color="text.secondary">
              Your cart is empty
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 400, mx: "auto" }}
            >
              Looks like you haven't added anything to your cart yet. Start
              shopping to find amazing products!
            </Typography>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/products"
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
              }}
            >
              Start Shopping
            </Button>
          </Box>
        </Fade>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {cartItems.map((item) => (
              <Slide
                key={item.product._id}
                direction="right"
                in={removingItem !== item.product._id}
                mountOnEnter
                unmountOnExit
                timeout={300}
              >
                <Card
                  sx={{
                    mb: 2,
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <Box
                          sx={{
                            position: "relative",
                            borderRadius: 2,
                            overflow: "hidden",
                            height: 120,
                            backgroundColor: "#f5f5f5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <img
                            src={
                              item.product.images && item.product.images[0]
                                ? item.product.images[0]
                                : "https://source.unsplash.com/random/150x150/?product"
                            }
                            alt={item.product.name}
                            style={{
                              maxWidth: "100%",
                              maxHeight: "100%",
                              objectFit: "contain",
                            }}
                            onError={(e) => {
                              e.target.src =
                                "https://source.unsplash.com/random/150x150/?product";
                            }}
                          />
                          {item.product.originalPrice && (
                            <Chip
                              label={`Save ৳${(
                                item.product.originalPrice - item.product.price
                              ).toFixed(2)}`}
                              size="small"
                              color="success"
                              sx={{
                                position: "absolute",
                                top: 8,
                                left: 8,
                                fontWeight: 600,
                                fontSize: "0.7rem",
                              }}
                            />
                          )}
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={9}>
                        <Box
                          display="flex"
                          flexDirection="column"
                          height="100%"
                          justifyContent="space-between"
                        >
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {item.product.name}
                            </Typography>
                            <Box
                              display="flex"
                              alignItems="center"
                              mt={0.5}
                              mb={1}
                            >
                              <Typography
                                variant="h6"
                                color="primary"
                                sx={{ fontWeight: 700 }}
                              >
                                ৳{item.product.price.toFixed(2)}
                              </Typography>
                              {item.product.originalPrice && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ textDecoration: "line-through", ml: 1 }}
                                >
                                  ৳{item.product.originalPrice.toFixed(2)}
                                </Typography>
                              )}
                            </Box>
                          </Box>

                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mt={2}
                          >
                            <Box display="flex" alignItems="center">
                              <IconButton
                                onClick={() =>
                                  updateQuantity(
                                    item.product._id,
                                    item.quantity - 1
                                  )
                                }
                                disabled={item.quantity <= 1}
                                size="small"
                                sx={{
                                  border: `1px solid ${theme.palette.divider}`,
                                  borderRadius: 1,
                                }}
                              >
                                <Remove fontSize="small" />
                              </IconButton>
                              <TextField
                                value={item.quantity}
                                size="small"
                                sx={{
                                  width: 60,
                                  mx: 1,
                                  "& .MuiOutlinedInput-root": {
                                    textAlign: "center",
                                  },
                                }}
                                inputProps={{
                                  style: {
                                    textAlign: "center",
                                    padding: "8px",
                                  },
                                  min: 1,
                                  max: item.product.stock,
                                }}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (
                                    !isNaN(value) &&
                                    value >= 1 &&
                                    value <= item.product.stock
                                  ) {
                                    updateQuantity(item.product._id, value);
                                  }
                                }}
                              />
                              <IconButton
                                onClick={() =>
                                  updateQuantity(
                                    item.product._id,
                                    item.quantity + 1
                                  )
                                }
                                disabled={item.quantity >= item.product.stock}
                                size="small"
                                sx={{
                                  border: `1px solid ${theme.palette.divider}`,
                                  borderRadius: 1,
                                }}
                              >
                                <Add fontSize="small" />
                              </IconButton>
                            </Box>

                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              ৳{(item.product.price * item.quantity).toFixed(2)}
                            </Typography>

                            <IconButton
                              color="error"
                              onClick={() => removeItem(item.product._id)}
                              sx={{
                                transition: "transform 0.2s",
                                "&:hover": {
                                  transform: "scale(1.1)",
                                  backgroundColor: alpha(
                                    theme.palette.error.main,
                                    0.1
                                  ),
                                },
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Slide>
            ))}
          </Grid>

          <Grid item xs={12} md={4}>
            <Zoom in={true} timeout={500}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  position: "sticky",
                  top: 20,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                  Order Summary
                </Typography>
                <Divider sx={{ my: 2 }} />

                {/* Coupon code input (optional) */}
                <Box sx={{ mb: 2 }}>
                  {appliedCoupon ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Chip
                        label={`Coupon: ${appliedCoupon.code}`}
                        color="success"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                      <Button size="small" onClick={removeCoupon}>
                        Remove
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <TextField
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        size="small"
                        fullWidth
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={applyCoupon}
                        disabled={couponLoading}
                      >
                        {couponLoading ? "Applying..." : "Apply"}
                      </Button>
                    </Box>
                  )}
                  {couponMessage && (
                    <Typography
                      variant="caption"
                      color={
                        couponMessage.type === "error"
                          ? "error"
                          : couponMessage.type === "success"
                          ? "success.main"
                          : "text.secondary"
                      }
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      {couponMessage.text}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography color="text.secondary">Subtotal:</Typography>
                    <Typography>৳{calculateTotal().toFixed(2)}</Typography>
                  </Box>

                  {appliedCoupon && appliedCoupon.type !== "shipping" && (
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography color="text.secondary">
                        Coupon Discount:
                      </Typography>
                      <Typography color="success.main">
                        -৳{computeDiscountAmount(calculateTotal()).toFixed(2)}
                      </Typography>
                    </Box>
                  )}

                  {calculateSavings() > 0 && (
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography color="text.secondary">Savings:</Typography>
                      <Typography color="success.main">
                        -৳{calculateSavings().toFixed(2)}
                      </Typography>
                    </Box>
                  )}

                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography color="text.secondary">Shipping:</Typography>
                    <Typography>
                      ৳{appliedCoupon?.type === "shipping" ? "0.00" : "50.00"}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography color="text.secondary">Tax (2%):</Typography>
                    <Typography>
                      ৳
                      {(
                        (calculateTotal() -
                          computeDiscountAmount(calculateTotal())) *
                        0.02
                      ).toFixed(2)}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography
                      variant="h6"
                      color="primary"
                      sx={{ fontWeight: 700 }}
                    >
                      ৳
                      {(
                        calculateTotal() -
                        computeDiscountAmount(calculateTotal()) +
                        (appliedCoupon?.type === "shipping" ? 0 : 50) +
                        (calculateTotal() -
                          computeDiscountAmount(calculateTotal())) *
                          0.15
                      ).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<ShoppingCartCheckout />}
                  onClick={handleCheckout}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: "1rem",
                    boxShadow: `0 4px 12px ${alpha(
                      theme.palette.primary.main,
                      0.3
                    )}`,
                    "&:hover": {
                      boxShadow: `0 6px 16px ${alpha(
                        theme.palette.primary.main,
                        0.4
                      )}`,
                    },
                  }}
                >
                  Proceed to Checkout
                </Button>

                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mt={2}
                  color="text.secondary"
                >
                  <LocalShipping fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="caption">
                    Free shipping on orders over ৳1000
                  </Typography>
                </Box>

                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mt={1}
                  color="text.secondary"
                >
                  <Redeem fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="caption">Rewards eligible</Typography>
                </Box>
              </Paper>
            </Zoom>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Cart;

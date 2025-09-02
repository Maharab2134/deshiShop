import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Chip,
  Rating,
  Divider,
  TextField,
  Card,
  CardMedia,
  IconButton,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  Fade,
  Zoom,
  Slide,
  Grow,
  useScrollTrigger,
  AppBar,
  Toolbar,
  Fab,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useParams, Link } from "react-router-dom";
import {
  AddShoppingCart,
  Favorite,
  FavoriteBorder,
  KeyboardArrowUp,
  ZoomIn,
} from "@mui/icons-material";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { styled, keyframes } from "@mui/system";

// Custom styled components
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
  animation: `${fadeIn} 0.5s ease-out`,
}));

const ImageCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  overflow: "hidden",
  boxShadow: theme.shadows[8],
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.01)",
  },
}));

const ThumbnailCard = styled(Card)(({ theme, selected }) => ({
  minWidth: 80,
  height: 80,
  borderRadius: theme.spacing(1),
  cursor: "pointer",
  overflow: "hidden",
  border: selected
    ? `2px solid ${theme.palette.primary.main}`
    : `1px solid ${theme.palette.grey[300]}`,
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "scale(1.05)",
    borderColor: theme.palette.primary.light,
  },
}));

const AddToCartButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1.5, 3),
  textTransform: "none",
  fontWeight: "bold",
  fontSize: "1rem",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[8],
  },
  "&:active": {
    transform: "translateY(0)",
  },
}));

const FloatingActionBar = styled(AppBar)(({ theme }) => ({
  top: "auto",
  bottom: 0,
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
}));

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [imageZoomed, setImageZoomed] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [showFloatingBar, setShowFloatingBar] = useState(false);

  // Scroll trigger for floating action bar
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  useEffect(() => {
    setShowFloatingBar(trigger);
  }, [trigger]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (user && product) {
      checkWishlistStatus();
    }
  }, [user, product]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error("Error fetching product:", error);
      setSnackbar({
        open: true,
        message: "Error loading product",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const response = await axios.get("/api/wishlist/check", {
        params: { productId: id },
      });
      setIsInWishlist(response.data.isInWishlist);
    } catch (error) {
      console.error("Error checking wishlist:", error);
    }
  };

  const handleAddToCart = async () => {
    try {
      await axios.post("/api/cart/add", {
        productId: id,
        quantity: quantity,
      });
      setSnackbar({
        open: true,
        message: "Product added to cart!",
        severity: "success",
      });

      // Add animation effect
      const button = document.getElementById("add-to-cart-btn");
      if (button) {
        button.style.animation = `${pulse} 0.5s`;
        setTimeout(() => {
          button.style.animation = "";
        }, 500);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setSnackbar({
        open: true,
        message: "Error adding to cart",
        severity: "error",
      });
    }
  };

  const handleToggleWishlist = async () => {
    try {
      if (isInWishlist) {
        await axios.delete("/api/wishlist/remove", {
          data: { productId: id },
        });
        setIsInWishlist(false);
        setSnackbar({
          open: true,
          message: "Removed from wishlist",
          severity: "info",
        });
      } else {
        await axios.post("/api/wishlist/add", { productId: id });
        setIsInWishlist(true);
        setSnackbar({
          open: true,
          message: "Added to wishlist!",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      setSnackbar({
        open: true,
        message: "Please login to use wishlist",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleImageZoom = () => {
    setImageZoomed(!imageZoomed);
  };

  if (loading) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <div
            className="loading-spinner"
            style={{
              width: "50px",
              height: "50px",
              border: "3px solid #f3f3f3",
              borderTop: "3px solid #3f51b5",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          ></div>
          <Typography variant="h6" color="textSecondary">
            Loading product...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h4" color="error" gutterBottom>
          Product Not Found
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Sorry, we couldn't find the product you're looking for.
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/products"
          sx={{ borderRadius: 3, px: 4, py: 1 }}
        >
          Browse Products
        </Button>
      </Container>
    );
  }

  return (
    <>
      <StyledContainer maxWidth="lg">
        {/* Breadcrumbs with animation */}
        <Slide direction="down" in={true} timeout={500}>
          <Breadcrumbs sx={{ mb: 4 }}>
            <MuiLink
              component={Link}
              to="/"
              color="inherit"
              sx={{
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Home
            </MuiLink>
            <MuiLink
              component={Link}
              to="/products"
              color="inherit"
              sx={{
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Products
            </MuiLink>
            <Typography color="text.primary">{product.name}</Typography>
          </Breadcrumbs>
        </Slide>

        <Grid container spacing={4}>
          {/* Product Images with zoom capability */}
          <Grid item xs={12} md={6}>
            <Fade in={true} timeout={800}>
              <Box sx={{ position: "relative" }}>
                <ImageCard>
                  <CardMedia
                    component="img"
                    height="500"
                    image={
                      product.images && product.images.length > 0
                        ? product.images[selectedImage]
                        : "https://source.unsplash.com/random/600x600/?product"
                    }
                    alt={product.name}
                    sx={{
                      width: "100%",
                      height: "500px",
                      objectFit: "contain", // or "cover"
                      cursor: imageZoomed ? "zoom-out" : "zoom-in",
                      background: "#f5f5f5",
                    }}
                    onClick={handleImageZoom}
                  />
                  <IconButton
                    sx={{
                      position: "absolute",
                      bottom: 16,
                      right: 16,
                      backgroundColor: "rgba(255,255,255,0.8)",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,1)",
                      },
                    }}
                    onClick={handleImageZoom}
                  >
                    <ZoomIn />
                  </IconButton>
                </ImageCard>

                {/* Modal for zoomed image */}
                {imageZoomed && (
                  <Box
                    onClick={handleImageZoom}
                    sx={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0,0,0,0.9)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 1300,
                      cursor: "zoom-out",
                    }}
                  >
                    <img
                      src={
                        product.images[selectedImage] ||
                        "https://source.unsplash.com/random/800x800/?product"
                      }
                      alt={product.name}
                      style={{
                        maxWidth: "90%",
                        maxHeight: "90%",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Fade>

            {/* Image thumbnails */}
            {product.images.length > 1 && (
              <Grow in={true} timeout={1000}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    mt: 3,
                    overflowX: "auto",
                    pb: 1,
                    "&::-webkit-scrollbar": {
                      height: 5,
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: "grey.100",
                      borderRadius: 2,
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "grey.400",
                      borderRadius: 2,
                    },
                  }}
                >
                  {product.images.map((image, index) => (
                    <ThumbnailCard
                      key={index}
                      selected={selectedImage === index}
                      onClick={() => setSelectedImage(index)}
                    >
                      <CardMedia
                        component="img"
                        height="80"
                        image={image}
                        alt={`${product.name} ${index + 1}`}
                        sx={{ objectFit: "cover" }}
                      />
                    </ThumbnailCard>
                  ))}
                </Box>
              </Grow>
            )}
          </Grid>

          {/* Product Details with staggered animations */}
          <Grid item xs={12} md={6}>
            <Box sx={{ position: "sticky", top: 100 }}>
              <Zoom in={true} timeout={500}>
                <Typography
                  variant="h3"
                  component="h1"
                  gutterBottom
                  sx={{ fontWeight: 700 }}
                >
                  {product.name}
                </Typography>
              </Zoom>

              <Fade in={true} timeout={700}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Rating
                    value={product.rating || 0}
                    readOnly
                    precision={0.1}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    ({product.reviewCount || 0} reviews)
                  </Typography>
                </Box>
              </Fade>

              <Fade in={true} timeout={900}>
                <Typography
                  variant="h3"
                  color="primary"
                  gutterBottom
                  sx={{ fontWeight: 600 }}
                >
                  ৳{product.price.toLocaleString()}
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <Typography
                        variant="h6"
                        component="span"
                        color="text.secondary"
                        sx={{ textDecoration: "line-through", ml: 1 }}
                      >
                        ৳{product.originalPrice.toLocaleString()}
                      </Typography>
                    )}
                </Typography>
              </Fade>

              <Fade in={true} timeout={1100}>
                <Box sx={{ mb: 3 }}>
                  {product.stock === 0 ? (
                    <Chip
                      label="Out of Stock"
                      color="error"
                      sx={{ px: 1, py: 2, fontSize: "1rem" }}
                    />
                  ) : (
                    <Chip
                      label="In Stock"
                      color="success"
                      sx={{ px: 1, py: 2, fontSize: "1rem" }}
                    />
                  )}

                  {product.discount > 0 && (
                    <Chip
                      label={`${product.discount}% OFF`}
                      color="secondary"
                      sx={{ ml: 1, px: 1, py: 2, fontSize: "1rem" }}
                    />
                  )}
                </Box>
              </Fade>

              <Fade in={true} timeout={1300}>
                <Typography
                  variant="body1"
                  paragraph
                  sx={{ lineHeight: 1.8, fontSize: "1.1rem" }}
                >
                  {product.description}
                </Typography>
              </Fade>

              <Divider sx={{ my: 3 }} />

              {/* Quantity and Actions */}
              <Fade in={true} timeout={1500}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
                >
                  <TextField
                    label="Quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    inputProps={{ min: 1, max: product.stock }}
                    sx={{ width: 100 }}
                    size="small"
                  />
                  <AddToCartButton
                    variant="contained"
                    size="large"
                    startIcon={<AddShoppingCart />}
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    sx={{ flex: 1 }}
                    id="add-to-cart-btn"
                  >
                    Add to Cart
                  </AddToCartButton>
                  <IconButton
                    color={isInWishlist ? "error" : "default"}
                    onClick={handleToggleWishlist}
                    disabled={!user}
                    sx={{
                      border: "1px solid",
                      borderColor: "grey.300",
                      "&:hover": {
                        backgroundColor: isInWishlist
                          ? "error.light"
                          : "grey.100",
                      },
                    }}
                  >
                    {isInWishlist ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                </Box>
              </Fade>

              {/* Product Details */}
              <Fade in={true} timeout={1700}>
                <Box
                  sx={{
                    mt: 3,
                    p: 3,
                    backgroundColor: "grey.50",
                    borderRadius: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Product Details
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Box sx={{ display: "flex" }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, minWidth: 100 }}
                      >
                        Category:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.category?.name || "Uncategorized"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex" }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, minWidth: 100 }}
                      >
                        SKU:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.sku || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex" }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, minWidth: 100 }}
                      >
                        Availability:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.stock} units available
                      </Typography>
                    </Box>
                    {product.tags && product.tags.length > 0 && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 1,
                          mt: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, minWidth: 100 }}
                        >
                          Tags:
                        </Typography>
                        {product.tags.map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Fade>
            </Box>
          </Grid>
        </Grid>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          TransitionComponent={Slide}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </StyledContainer>

      {/* Floating action bar for mobile */}
      <Slide direction="up" in={showFloatingBar && isMobile} timeout={300}>
        <FloatingActionBar position="fixed">
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="h6" color="primary" sx={{ mr: 2 }}>
                ৳{product.price.toLocaleString()}
              </Typography>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textDecoration: "line-through" }}
                  >
                    ৳{product.originalPrice.toLocaleString()}
                  </Typography>
                )}
            </Box>
            <Box>
              <IconButton
                color={isInWishlist ? "error" : "default"}
                onClick={handleToggleWishlist}
                disabled={!user}
                sx={{ mr: 1 }}
              >
                {isInWishlist ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
              <AddToCartButton
                variant="contained"
                size="small"
                startIcon={<AddShoppingCart />}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                Add to Cart
              </AddToCartButton>
            </Box>
          </Toolbar>
        </FloatingActionBar>
      </Slide>

      {/* Scroll to top button */}
      <Zoom in={trigger}>
        <Fab
          color="primary"
          size="medium"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      </Zoom>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};

export default ProductDetail;

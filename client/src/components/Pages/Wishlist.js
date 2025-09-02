import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Button,
  Chip,
  Fade,
  Zoom,
  Slide,
  Grow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
  useTheme,
  alpha,
  Avatar,
  Skeleton,
} from "@mui/material";
import {
  Delete,
  AddShoppingCart,
  Favorite,
  Visibility,
  RemoveRedEye,
  ShoppingCartCheckout,
  HeartBroken,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { keyframes, styled } from "@mui/system";

// Custom animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

// Styled components
const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(6),
  animation: `${fadeIn} 0.6s ease-out`,
}));

const ProductCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.spacing(2),
  overflow: "hidden",
  transition: "all 0.3s ease",
  boxShadow: theme.shadows[2],
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[8],
    "& .product-image": {
      transform: "scale(1.05)",
    },
  },
}));

const ProductImage = styled(CardMedia)(({ theme }) => ({
  height: 220,
  transition: "transform 0.5s ease",
  position: "relative",
}));

const ActionButton = styled(IconButton)(({ theme, actiontype }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  "&:hover": {
    backgroundColor:
      actiontype === "delete"
        ? theme.palette.error.light
        : theme.palette.primary.light,
    color: "white",
    animation: `${pulse} 0.5s`,
  },
}));

const AddToCartButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  textTransform: "none",
  fontWeight: "bold",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[4],
  },
}));

const EmptyState = styled(Box)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(8, 2),
  animation: `${fadeIn} 0.8s ease-out`,
}));

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingItem, setRemovingItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (user) {
      fetchWishlistItems();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchWishlistItems = async () => {
    try {
      const response = await axios.get("/api/wishlist");
      setWishlistItems(response.data.items || []);
    } catch (error) {
      console.error("Error fetching wishlist items:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    setRemovingItem(productId);
    try {
      await axios.delete("/api/wishlist/remove", {
        data: { productId },
      });
      setWishlistItems((items) =>
        items.filter((item) => item._id !== productId)
      );
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    } finally {
      setRemovingItem(null);
      setDialogOpen(false);
    }
  };

  const confirmRemove = (productId) => {
    setItemToRemove(productId);
    setDialogOpen(true);
  };

  const addToCartFromWishlist = async (productId) => {
    try {
      await axios.post("/api/cart/add", {
        productId,
        quantity: 1,
      });

      // Show success animation before removing
      const button = document.getElementById(`add-to-cart-${productId}`);
      if (button) {
        button.style.animation = `${pulse} 0.5s`;
        setTimeout(() => {
          removeFromWishlist(productId);
        }, 500);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  if (!user) {
    return (
      <StyledContainer>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Favorite sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Please login to view your wishlist
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/login", { state: { from: "/wishlist" } })}
            sx={{ mt: 2, borderRadius: 3 }}
            size="large"
          >
            Sign In
          </Button>
        </Box>
      </StyledContainer>
    );
  }

  if (loading) {
    return (
      <StyledContainer>
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4 }}>
          My Wishlist
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
              <Card sx={{ height: "100%" }}>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} width="60%" />
                </CardContent>
                <Box sx={{ p: 2, display: "flex", gap: 1 }}>
                  <Skeleton variant="rectangular" width="100%" height={40} />
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="circular" width={40} height={40} />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer maxWidth="lg">
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <Favorite sx={{ fontSize: 40, color: "primary.main", mr: 2 }} />
        <Typography variant="h3" component="h1" fontWeight="700">
          My Wishlist
        </Typography>
        {wishlistItems.length > 0 && (
          <Chip
            label={`${wishlistItems.length} items`}
            color="primary"
            variant="outlined"
            sx={{ ml: 2, fontSize: "1rem", py: 1.5 }}
          />
        )}
      </Box>

      {wishlistItems.length === 0 ? (
        <EmptyState>
          <HeartBroken
            sx={{ fontSize: 80, color: "text.secondary", mb: 3, opacity: 0.5 }}
          />
          <Typography variant="h5" gutterBottom color="text.secondary">
            Your wishlist is empty
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 400, mx: "auto" }}
          >
            Start saving your favorite items to keep track of what you love
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/products")}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              animation: `${pulse} 2s infinite`,
              "&:hover": {
                animation: "none",
              },
            }}
            startIcon={<RemoveRedEye />}
          >
            Browse Products
          </Button>
        </EmptyState>
      ) : (
        <Grid container spacing={3}>
          {wishlistItems.map((product, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <Grow in={true} timeout={500 + index * 100}>
                <ProductCard>
                  <Box sx={{ position: "relative" }}>
                    <ProductImage
                      className="product-image"
                      component="img"
                      image={
                        product.images?.[0] ||
                        "https://source.unsplash.com/random/300x300/?product"
                      }
                      alt={product.name}
                    />
                    <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                      <Chip
                        label={product.stock > 0 ? "In Stock" : "Out of Stock"}
                        color={product.stock > 0 ? "success" : "error"}
                        size="small"
                      />
                    </Box>
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h6" component="h3" gutterBottom noWrap>
                      {product.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {product.description}
                    </Typography>
                    <Typography variant="h5" color="primary" fontWeight="bold">
                      ৳{product.price.toLocaleString()}
                    </Typography>
                  </CardContent>

                  <Box sx={{ p: 2, pt: 0, display: "flex", gap: 1 }}>
                    <AddToCartButton
                      id={`add-to-cart-${product._id}`}
                      variant="contained"
                      fullWidth
                      onClick={() => addToCartFromWishlist(product._id)}
                      disabled={
                        product.stock === 0 || removingItem === product._id
                      }
                      startIcon={<ShoppingCartCheckout />}
                    >
                      {removingItem === product._id
                        ? "Adding..."
                        : "Add to Cart"}
                    </AddToCartButton>

                    <ActionButton
                      actiontype="view"
                      component={Link}
                      to={`/products/${product._id}`}
                    >
                      <Visibility />
                    </ActionButton>

                    <ActionButton
                      actiontype="delete"
                      onClick={() => confirmRemove(product._id)}
                      disabled={removingItem === product._id}
                    >
                      <Delete />
                    </ActionButton>
                  </Box>
                </ProductCard>
              </Grow>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Remove from Wishlist?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to remove this item from your wishlist?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => removeFromWishlist(itemToRemove)}
            color="error"
            autoFocus
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
};

export default Wishlist;

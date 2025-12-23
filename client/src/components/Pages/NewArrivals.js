import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  useTheme,
  alpha,
  Fade,
  Skeleton,
  Pagination,
  Breadcrumbs,
  Link as MUILink,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  InputAdornment,
  Alert,
  Snackbar,
  Stack,
  useMediaQuery,
  Paper,
  Divider,
  Badge,
} from "@mui/material";
import { Link, Navigate } from "react-router-dom";
import {
  Home as HomeIcon,
  NavigateNext,
  FavoriteBorder,
  Favorite,
  ShoppingCart,
  GridView,
  ViewList,
  Close,
  Search,
  FilterList,
  Sort,
  LocalShipping,
  Star,
  StarBorder,
  Lock,
} from "@mui/icons-material";
import axios from "axios";
import { getProductImage as getImageUrl } from "../../utils/imageHelper";
import { useAuth } from "../contexts/AuthContext";
import Rating from "@mui/material/Rating";

// Enhanced FilterSection component
const FilterSection = ({
  searchTerm,
  handleSearch,
  handleKeyPress,
  categoryFilter,
  handleCategoryChange,
  categories,
  sortBy,
  handleSortChange,
  viewMode,
  setViewMode,
  clearFilters,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const getId = (p) =>
    typeof p?._id === "string" ? p._id : p?._id?._id || p?.id || "";
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  if (isMobile) {
    return (
      <Paper
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 3,
          bgcolor: "background.paper",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <Stack spacing={2}>
          {/* Search on mobile */}
          <TextField
            placeholder="Search new arrivals..."
            variant="outlined"
            value={searchTerm}
            onChange={handleSearch}
            onKeyPress={handleKeyPress}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            {/* View mode toggle */}
            <Box
              sx={{
                display: "flex",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                overflow: "hidden",
                flex: 1,
              }}
            >
              <Button
                onClick={() => setViewMode("grid")}
                size="small"
                sx={{
                  flex: 1,
                  borderRadius: 0,
                  bgcolor:
                    viewMode === "grid"
                      ? alpha(theme.palette.primary.main, 0.1)
                      : "transparent",
                  color:
                    viewMode === "grid"
                      ? theme.palette.primary.main
                      : "text.secondary",
                  "&:hover": {
                    bgcolor:
                      viewMode === "grid"
                        ? alpha(theme.palette.primary.main, 0.2)
                        : "action.hover",
                  },
                }}
              >
                <GridView fontSize="small" />
              </Button>
              <Divider orientation="vertical" flexItem />
              <Button
                onClick={() => setViewMode("list")}
                size="small"
                sx={{
                  flex: 1,
                  borderRadius: 0,
                  bgcolor:
                    viewMode === "list"
                      ? alpha(theme.palette.primary.main, 0.1)
                      : "transparent",
                  color:
                    viewMode === "list"
                      ? theme.palette.primary.main
                      : "text.secondary",
                  "&:hover": {
                    bgcolor:
                      viewMode === "list"
                        ? alpha(theme.palette.primary.main, 0.2)
                        : "action.hover",
                  },
                }}
              >
                <ViewList fontSize="small" />
              </Button>
            </Box>

            {/* Sort dropdown */}
            <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
              <Select
                value={sortBy}
                onChange={handleSortChange}
                displayEmpty
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="price-low">Price: Low</MenuItem>
                <MenuItem value="price-high">Price: High</MenuItem>
                <MenuItem value="rating">Top Rated</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Category filter */}
          <FormControl size="small" fullWidth>
            <Select
              value={categoryFilter}
              onChange={handleCategoryChange}
              displayEmpty
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Clear filters button */}
          {(searchTerm || categoryFilter || sortBy !== "newest") && (
            <Button
              onClick={clearFilters}
              size="small"
              startIcon={<Close fontSize="small" />}
              variant="outlined"
              fullWidth
              sx={{ borderRadius: 2 }}
            >
              Clear Filters
            </Button>
          )}
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        mb: 4,
        p: 3,
        borderRadius: 3,
        bgcolor: "background.paper",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <Grid container spacing={2} alignItems="center">
        {/* Search */}
        <Grid item xs={12} md={3}>
          <TextField
            placeholder="Search new arrivals..."
            variant="outlined"
            value={searchTerm}
            onChange={handleSearch}
            onKeyPress={handleKeyPress}
            fullWidth
            size={isTablet ? "small" : "medium"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Grid>

        {/* Category filter */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size={isTablet ? "small" : "medium"}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={handleCategoryChange}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Sort by */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size={isTablet ? "small" : "medium"}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={handleSortChange}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="price-low">Price: Low to High</MenuItem>
              <MenuItem value="price-high">Price: High to Low</MenuItem>
              <MenuItem value="name">Name A-Z</MenuItem>
              <MenuItem value="rating">Highest Rated</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* View mode and actions */}
        <Grid item xs={12} md={3}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: { xs: "flex-start", md: "flex-end" },
              gap: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <IconButton
                onClick={() => setViewMode("grid")}
                size="small"
                sx={{
                  borderRadius: 0,
                  bgcolor:
                    viewMode === "grid"
                      ? alpha(theme.palette.primary.main, 0.1)
                      : "transparent",
                  color:
                    viewMode === "grid"
                      ? theme.palette.primary.main
                      : "text.secondary",
                }}
              >
                <GridView />
              </IconButton>
              <Divider orientation="vertical" flexItem />
              <IconButton
                onClick={() => setViewMode("list")}
                size="small"
                sx={{
                  borderRadius: 0,
                  bgcolor:
                    viewMode === "list"
                      ? alpha(theme.palette.primary.main, 0.1)
                      : "transparent",
                  color:
                    viewMode === "list"
                      ? theme.palette.primary.main
                      : "text.secondary",
                }}
              >
                <ViewList />
              </IconButton>
            </Box>

            {(searchTerm || categoryFilter || sortBy !== "newest") && (
              <Button
                onClick={clearFilters}
                startIcon={<Close />}
                variant="outlined"
                size={isTablet ? "small" : "medium"}
                sx={{ borderRadius: 2 }}
              >
                Clear
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

const NewArrivals = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const getId = (p) =>
    typeof p?._id === "string" ? p._id : p?._id?._id || p?.id || "";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  const [wishlist, setWishlist] = useState([]);
  const [addingToCart, setAddingToCart] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        const limit = viewMode === "grid" ? (isMobile ? 8 : 12) : 6;
        const sortMapping = {
          newest: { sortBy: "createdAt", sortOrder: "desc" },
          "price-low": { sortBy: "price", sortOrder: "asc" },
          "price-high": { sortBy: "price", sortOrder: "desc" },
          name: { sortBy: "name", sortOrder: "asc" },
          rating: { sortBy: "ratingsAverage", sortOrder: "desc" },
        };
        const s = sortMapping[sortBy] || sortMapping["newest"];

        let url = `/api/products?page=${page}&limit=${limit}&sortBy=${s.sortBy}&sortOrder=${s.sortOrder}`;
        if (categoryFilter) url += `&category=${categoryFilter}`;
        if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

        const res = await axios.get(url);
        setProducts(res.data.products || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error("Failed to load new arrivals:", err);
        setSnackbar({
          open: true,
          message: "Failed to load new arrivals",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchNewArrivals();
  }, [page, sortBy, viewMode, categoryFilter, searchTerm, isMobile]);

  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handlePageChange = (_e, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setSortBy("newest");
    setPage(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") e.preventDefault();
  };

  const toggleWishlist = (productId) => {
    if (!user) {
      setSnackbar({
        open: true,
        message: "Please login to use wishlist",
        severity: "warning",
      });
      return;
    }
    if (user?.role === "admin") {
      setSnackbar({
        open: true,
        message: "Admins cannot use wishlist",
        severity: "error",
      });
      return;
    }
    const newWishlist = wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];
    setWishlist(newWishlist);
    localStorage.setItem("wishlist", JSON.stringify(newWishlist));
    window.dispatchEvent(new Event("wishlist-updated"));
  };

  const addToCart = async (productId, productName) => {
    if (!user) {
      setSnackbar({
        open: true,
        message: "Please login to add items to cart",
        severity: "warning",
      });
      return;
    }
    if (user?.role === "admin") {
      setSnackbar({
        open: true,
        message: "Admins cannot add products to cart",
        severity: "error",
      });
      return;
    }
    try {
      setAddingToCart(productId);
      await axios.post(
        "/api/cart/add",
        { productId, quantity: 1 },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSnackbar({
        open: true,
        message: `${productName} added to cart!`,
        severity: "success",
      });
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      console.error("Error adding to cart:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to add to cart",
        severity: "error",
      });
    } finally {
      setAddingToCart(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Function to get product image with fallback
  const getProductImage = (product) => {
    const imageUrl = getImageUrl(product);
    if (imageUrl) return imageUrl;
    return `https://source.unsplash.com/random/300x300/?product,${
      product.name || "shopping"
    }`;
  };

  // Function to render product card in grid view
  const renderGridCard = (product) => (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        overflow: "hidden",
        transition: "transform 0.3s, box-shadow 0.3s",
        border: "1px solid",
        borderColor: "divider",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <Box sx={{ position: "relative", pt: "75%", bgcolor: "#fafafa" }}>
        <CardMedia
          component="img"
          image={getProductImage(product)}
          alt={product.name}
          disabled={!user}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            p: isMobile ? 1 : 2,
          }}
          onError={(e) => {
            e.currentTarget.src = `https://source.unsplash.com/random/300x300/?product,${
              product.name || "shopping"
            }`;
          }}
        />
        <IconButton
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            "&:hover": { backgroundColor: "white" },
          }}
          onClick={() => toggleWishlist(product._id)}
        >
          {!user ? (
            <Lock fontSize="small" />
          ) : wishlist.includes(product._id) ? (
            <Favorite fontSize="small" color="error" />
          ) : (
            <FavoriteBorder fontSize="small" />
          )}
        </IconButton>
        {product.stock === 0 && (
          <Chip
            label="Out of Stock"
            color="error"
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              fontWeight: 600,
              fontSize: "0.7rem",
            }}
          />
        )}
        {product.isNew && (
          <Chip
            label="New"
            color="success"
            size="small"
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
      <CardContent sx={{ flexGrow: 1, p: isMobile ? 2 : 3 }}>
        <Typography
          variant={isMobile ? "subtitle2" : "subtitle1"}
          component="h3"
          gutterBottom
          sx={{
            fontWeight: 600,
            lineHeight: 1.2,
            height: isMobile ? "2.4em" : "2.8em",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {product.name}
        </Typography>
        <Box display="flex" alignItems="center" mt={1} mb={2}>
          <Rating
            value={product.ratingsAverage || 0}
            readOnly
            size="small"
            precision={0.5}
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            ({product.ratingsQuantity || 0})
          </Typography>
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: isMobile ? "none" : "block",
            mb: 2,
            lineHeight: 1.4,
            height: "2.8em",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {product.description || "No description available"}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: "auto",
          }}
        >
          <Typography
            variant={isMobile ? "h6" : "h5"}
            color="primary"
            sx={{ fontWeight: 700 }}
          >
            ৳{product.price}
          </Typography>
          <Button
            variant="contained"
            size={isMobile ? "small" : "medium"}
            startIcon={!user ? <Lock /> : <ShoppingCart />}
            disabled={
              !user || product.stock === 0 || addingToCart === product._id
            }
            onClick={() => addToCart(product._id, product.name)}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              minWidth: isMobile ? "auto" : "120px",
              px: isMobile ? 1 : 2,
            }}
          >
            {!user
              ? "Login"
              : addingToCart === product._id
              ? "..."
              : isMobile
              ? ""
              : "Add"}
          </Button>
        </Box>
      </CardContent>
      <Box sx={{ p: isMobile ? 2 : 3, pt: 0 }}>
        <Button
          variant="outlined"
          fullWidth
          component={!user ? "button" : Link}
          to={user ? `/products/${getId(product)}` : undefined}
          disabled={!user}
          startIcon={!user ? <Lock /> : undefined}
          size={isMobile ? "small" : "medium"}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          {!user ? "Login" : isMobile ? "Details" : "View Details"}
        </Button>
      </Box>
    </Card>
  );

  // Function to render product card in list view
  const renderListCard = (product) => (
    <Card
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        borderRadius: 3,
        overflow: "hidden",
        mb: 3,
        transition: "transform 0.3s, box-shadow 0.3s",
        border: "1px solid",
        borderColor: "divider",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[6],
        },
      }}
    >
      {/* Image section */}
      <Box
        sx={{
          width: { xs: "100%", sm: 200 },
          height: { xs: 200, sm: 240 },
          position: "relative",
          bgcolor: "#fafafa",
          flexShrink: 0,
        }}
      >
        <CardMedia
          component="img"
          image={getProductImage(product)}
          alt={product.name}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            p: 2,
          }}
        />
        <IconButton
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            "&:hover": { backgroundColor: "white" },
          }}
          onClick={() => toggleWishlist(product._id)}
        >
          {!user ? (
            <Lock fontSize="small" />
          ) : wishlist.includes(product._id) ? (
            <Favorite fontSize="small" color="error" />
          ) : (
            <FavoriteBorder fontSize="small" />
          )}
        </IconButton>
        {product.isNew && (
          <Chip
            label="New"
            color="success"
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              fontWeight: 600,
            }}
          />
        )}
      </Box>

      {/* Content section */}
      <Box
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h6"
            component="h3"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            {product.name}
          </Typography>
          <Box display="flex" alignItems="center" mt={1} mb={2}>
            <Rating
              value={product.ratingsAverage || 0}
              readOnly
              precision={0.5}
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({product.ratingsQuantity || 0} reviews)
            </Typography>
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              lineHeight: 1.6,
              display: { xs: "none", md: "block" },
            }}
          >
            {product.description || "No description available"}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
          }}
        >
          <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
            ৳{product.price}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant={product.stock === 0 ? "outlined" : "contained"}
              startIcon={!user ? <Lock /> : <ShoppingCart />}
              disabled={
                !user || product.stock === 0 || addingToCart === product._id
              }
              onClick={() => addToCart(product._id, product.name)}
              size={isMobile ? "small" : "medium"}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              {!user
                ? "Login"
                : addingToCart === product._id
                ? "Adding..."
                : "Add to Cart"}
            </Button>
            <Button
              variant="outlined"
              component={!user ? "button" : Link}
              to={user ? `/products/${getId(product)}` : undefined}
              disabled={!user}
              startIcon={!user ? <Lock /> : undefined}
              size={isMobile ? "small" : "medium"}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              {!user ? "Login" : "View Details"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Card>
  );

  return (
    <>
      {user?.role === "admin" && <Navigate to="/admin" replace />}

      {/* Header Banner */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.9
          )} 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`,
          color: "white",
          py: { xs: 4, md: 6 },
          mb: 4,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.05" fill-rule="evenodd"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3Ccircle cx="13" cy="13" r="3"/%3E%3C/g%3E%3C/svg%3E")',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Breadcrumbs
            aria-label="breadcrumb"
            separator={
              <NavigateNext
                fontSize="small"
                sx={{ color: alpha("#fff", 0.8) }}
              />
            }
            sx={{ color: alpha("#fff", 0.9) }}
          >
            <MUILink component={Link} underline="hover" color="inherit" to="/">
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <HomeIcon fontSize="inherit" /> Home
              </Box>
            </MUILink>
            <Typography color="inherit">New Arrivals</Typography>
          </Breadcrumbs>
          <Typography
            variant={isMobile ? "h4" : "h3"}
            component="h1"
            sx={{ fontWeight: 800, mt: 1 }}
          >
            New Arrivals
          </Typography>
          <Typography
            variant="body1"
            sx={{ opacity: 0.9, mt: 1, maxWidth: 600 }}
          >
            Discover our latest products. Freshly added items updated daily!
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 6 }}>
        {/* Filter Section */}
        <FilterSection
          searchTerm={searchTerm}
          handleSearch={handleSearch}
          handleKeyPress={handleKeyPress}
          categoryFilter={categoryFilter}
          handleCategoryChange={handleCategoryChange}
          categories={categories}
          sortBy={sortBy}
          handleSortChange={handleSortChange}
          viewMode={viewMode}
          setViewMode={setViewMode}
          clearFilters={clearFilters}
        />

        {/* Results count */}
        {!loading && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Showing {products.length}{" "}
            {products.length === 1 ? "product" : "products"}
          </Typography>
        )}

        {/* Products Grid/List */}
        {loading ? (
          <Grid container spacing={isMobile ? 2 : 3}>
            {Array.from(
              new Array(viewMode === "grid" ? (isMobile ? 4 : 8) : 3)
            ).map((_, index) => (
              <Grid
                item
                xs={6}
                sm={viewMode === "grid" ? 4 : 12}
                md={viewMode === "grid" ? 3 : 12}
                key={index}
              >
                <Card
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    height={isMobile ? 160 : 200}
                    animation="wave"
                    sx={{ bgcolor: "grey.100" }}
                  />
                  <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                    <Skeleton animation="wave" height={24} width="80%" />
                    <Skeleton
                      animation="wave"
                      height={16}
                      width="60%"
                      sx={{ mt: 2 }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 2,
                      }}
                    >
                      <Skeleton animation="wave" height={28} width="40%" />
                      <Skeleton animation="wave" height={36} width="45%" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : products.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 3,
              bgcolor: "grey.50",
            }}
          >
            <Search sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No products found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search or filter to find what you're looking
              for.
            </Typography>
            <Button
              variant="outlined"
              onClick={clearFilters}
              sx={{ borderRadius: 2 }}
            >
              Clear All Filters
            </Button>
          </Paper>
        ) : (
          <>
            <Grid container spacing={isMobile ? 2 : 3}>
              {products.map((product) => (
                <Grid
                  item
                  xs={viewMode === "grid" ? 6 : 12}
                  sm={viewMode === "grid" ? 4 : 12}
                  md={viewMode === "grid" ? 3 : 12}
                  key={product._id}
                >
                  <Fade in={true} timeout={500}>
                    {viewMode === "grid"
                      ? renderGridCard(product)
                      : renderListCard(product)}
                  </Fade>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  shape="rounded"
                  size={isMobile ? "small" : "medium"}
                  siblingCount={isMobile ? 0 : 1}
                />
              </Box>
            )}
          </>
        )}
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
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
    </>
  );
};

export default NewArrivals;

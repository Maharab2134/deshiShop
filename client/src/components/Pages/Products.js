import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery,
  alpha,
  Skeleton,
  Fade,
  Fab,
  InputAdornment,
  Alert,
} from "@mui/material";
import {
  FilterList,
  Search,
  Tune,
  Close,
  FavoriteBorder,
  Favorite,
  ShoppingCart,
  ViewList,
  GridView,
  Home,
  NavigateNext,
  Refresh,
  Lock,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import Rating from "@mui/material/Rating";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { getProductImage } from "../../utils/imageHelper";
import { useAuth } from "../contexts/AuthContext";

// --- FilterSection moved OUTSIDE Products ---
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
  const [searchFocused, setSearchFocused] = useState(false);
  const theme = useTheme();

  return (
    <Box
      sx={{
        mb: 4,
        p: 3,
        borderRadius: 3,
        bgcolor: "background.paper",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
        }}
      >
        <TextField
          placeholder="Search products..."
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          onKeyPress={handleKeyPress}
          sx={{
            minWidth: 200,
            flexGrow: 1,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color={searchFocused ? "primary" : "action"} />
              </InputAdornment>
            ),
          }}
        />

        <FormControl sx={{ minWidth: 200, flexGrow: 1 }}>
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

        <FormControl sx={{ minWidth: 200, flexGrow: 1 }}>
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

        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            onClick={() => setViewMode("grid")}
            color={viewMode === "grid" ? "primary" : "default"}
            sx={{
              bgcolor:
                viewMode === "grid"
                  ? alpha(theme.palette.primary.main, 0.1)
                  : "transparent",
              borderRadius: 2,
            }}
          >
            <GridView />
          </IconButton>
          <IconButton
            onClick={() => setViewMode("list")}
            color={viewMode === "list" ? "primary" : "default"}
            sx={{
              bgcolor:
                viewMode === "list"
                  ? alpha(theme.palette.primary.main, 0.1)
                  : "transparent",
              borderRadius: 2,
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
            sx={{ borderRadius: 2 }}
          >
            Clear Filters
          </Button>
        )}
      </Box>
    </Box>
  );
};
// --- End FilterSection ---

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [wishlist, setWishlist] = useState([]);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Local focus state for mobile search bar
  const [mobileSearchFocused, setMobileSearchFocused] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const { user } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  const categoryFromUrl = queryParams.get("category");
  const getId = (p) =>
    typeof p?._id === "string" ? p._id : p?._id?._id || p?.id || "";

  useEffect(() => {
    if (categoryFromUrl) {
      setCategoryFilter(categoryFromUrl);
    }

    fetchCategories();
    if (user?.role === "admin") {
      setSnackbar({
        open: true,
        message: "Admins cannot add products to cart",
        severity: "error",
      });
      return;
    }
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, [categoryFromUrl]);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [categoryFilter, sortBy, page, searchTerm, viewMode]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Map frontend sort values to backend expected parameters
      const sortMapping = {
        newest: { sortBy: "createdAt", sortOrder: "desc" },
        "price-low": { sortBy: "price", sortOrder: "asc" },
        "price-high": { sortBy: "price", sortOrder: "desc" },
        name: { sortBy: "name", sortOrder: "asc" },
        rating: { sortBy: "ratingsAverage", sortOrder: "desc" },
      };

      const sortConfig = sortMapping[sortBy] || sortMapping["newest"];

      let url = `/api/products?page=${page}&limit=${
        viewMode === "grid" ? 12 : 6
      }&sortBy=${sortConfig.sortBy}&sortOrder=${sortConfig.sortOrder}`;

      if (categoryFilter) {
        url += `&category=${categoryFilter}`;
      }

      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const response = await axios.get(url);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setPage(1);
    if (isMobile) {
      setMobileFiltersOpen(false);
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
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

    // Dispatch custom event to notify Navbar
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

    try {
      setAddingToCart(productId);
      await axios.post(
        "/api/cart/add",
        {
          productId,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setSnackbar({
        open: true,
        message: `${productName} added to cart!`,
        severity: "success",
      });

      // Dispatch custom event to notify Navbar
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

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setSortBy("newest");
    setPage(1);
    setError(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Prevent form submission when pressing Enter in search field
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const ProductCardGrid = ({ product }) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
      <Fade in={true} timeout={800}>
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
              transform: "translateY(-8px)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            },
          }}
        >
          <Box sx={{ position: "relative", p: 2, bgcolor: "#fafafa" }}>
            <CardMedia
              component="img"
              height="220"
              image={
                getProductImage(product) ||
                "https://source.unsplash.com/random/300x300/?product"
              }
              alt={product.name}
              sx={{
                objectFit: "contain",
                transition: "transform 0.5s",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
              onError={(e) => {
                e.target.src =
                  "https://source.unsplash.com/random/300x300/?product";
              }}
            />
            <IconButton
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                backgroundColor: "white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                "&:hover": {
                  backgroundColor: "white",
                },
              }}
              onClick={() => toggleWishlist(product._id)}
            >
              {wishlist.includes(product._id) ? (
                <Favorite color="error" />
              ) : (
                <FavoriteBorder />
              )}
            </IconButton>
            {product.stock === 0 && (
              <Chip
                label="Out of Stock"
                color="error"
                size="small"
                sx={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  fontWeight: 600,
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
                  top: 16,
                  left: 16,
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
          <CardContent sx={{ flexGrow: 1, p: 3 }}>
            <Typography
              variant="h6"
              component="h3"
              gutterBottom
              sx={{ fontWeight: 600, fontSize: "1.1rem" }}
            >
              {product.name}
            </Typography>

            <Box display="flex" alignItems="center" mt={1} mb={2}>
              <Rating
                value={product.ratingsAverage || 0}
                readOnly
                size="small"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({product.ratingsQuantity || 0})
              </Typography>
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, lineHeight: 1.5 }}
            >
              {product.description && product.description.length > 80
                ? `${product.description.substring(0, 80)}...`
                : product.description || "No description available"}
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: "auto",
              }}
            >
              <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                ৳{product.price}
              </Typography>

              <Button
                variant="contained"
                size="small"
                startIcon={!user ? <Lock /> : <ShoppingCart />}
                disabled={
                  !user || product.stock === 0 || addingToCart === product._id
                }
                onClick={() => addToCart(product._id, product.name)}
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: "none",
                  },
                }}
              >
                {!user
                  ? "Login"
                  : addingToCart === product._id
                  ? "Adding..."
                  : "Add to Cart"}
              </Button>
            </Box>
          </CardContent>

          <Box sx={{ p: 3, pt: 0 }}>
            <Button
              variant="outlined"
              fullWidth
              component={!user ? "button" : Link}
              to={user ? `/products/${getId(product)}` : undefined}
              disabled={!user}
              startIcon={!user ? <Lock /> : undefined}
              sx={{
                borderRadius: 2,
                py: 1,
                fontWeight: 600,
              }}
            >
              {!user ? "Login to View" : "View Details"}
            </Button>
          </Box>
        </Card>
      </Fade>
    </Grid>
  );

  const ProductCardList = ({ product }) => (
    <Grid item xs={12} key={product._id}>
      <Fade in={true} timeout={800}>
        <Card
          sx={{
            display: "flex",
            borderRadius: 3,
            overflow: "hidden",
            mb: 3,
            transition: "transform 0.3s, box-shadow 0.3s",
            border: "1px solid",
            borderColor: "divider",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
            },
          }}
        >
          <Box
            sx={{
              width: 240,
              flexShrink: 0,
              position: "relative",
              bgcolor: "#fafafa",
              p: 2,
            }}
          >
            <CardMedia
              component="img"
              height="200"
              image={
                getProductImage(product) ||
                "https://source.unsplash.com/random/200x200/?product"
              }
              alt={product.name}
              sx={{
                objectFit: "contain",
                height: "100%",
              }}
            />
            <IconButton
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                backgroundColor: "white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                "&:hover": {
                  backgroundColor: "white",
                },
              }}
              onClick={() => toggleWishlist(product._id)}
            >
              {wishlist.includes(product._id) ? (
                <Favorite color="error" />
              ) : (
                <FavoriteBorder />
              )}
            </IconButton>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              p: 3,
              position: "relative",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box sx={{ flexGrow: 1, pr: 2 }}>
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
                    size="small"
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    ({product.ratingsQuantity || 0} reviews)
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, lineHeight: 1.6 }}
                >
                  {product.description || "No description available"}
                </Typography>
              </Box>

              <Typography
                variant="h5"
                color="primary"
                sx={{ fontWeight: 700, ml: 2, whiteSpace: "nowrap" }}
              >
                ৳{product.price}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2, mt: "auto", pt: 2 }}>
              <Button
                variant="outlined"
                startIcon={!user ? <Lock /> : <ShoppingCart />}
                disabled={
                  !user || product.stock === 0 || addingToCart === product._id
                }
                onClick={() => addToCart(product._id, product.name)}
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                {!user
                  ? "Login"
                  : addingToCart === product._id
                  ? "Adding..."
                  : "Add to Cart"}
              </Button>
              <Button
                variant="contained"
                component={!user ? "button" : Link}
                to={user ? `/products/${getId(product)}` : undefined}
                disabled={!user}
                startIcon={!user ? <Lock /> : undefined}
                sx={{ borderRadius: 2, fontWeight: 600, boxShadow: "none" }}
              >
                {!user ? "Login" : "View Details"}
              </Button>
            </Box>
          </Box>
        </Card>
      </Fade>
    </Grid>
  );

  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {Array.from(new Array(viewMode === "grid" ? 12 : 6)).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
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
              height={220}
              animation="wave"
              sx={{ bgcolor: "grey.100" }}
            />
            <CardContent sx={{ p: 3 }}>
              <Skeleton animation="wave" height={28} width="80%" />
              <Skeleton
                animation="wave"
                height={20}
                width="60%"
                sx={{ mt: 2 }}
              />
              <Skeleton
                animation="wave"
                height={20}
                width="40%"
                sx={{ mt: 1, mb: 2 }}
              />
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
              >
                <Skeleton animation="wave" height={30} width="40%" />
                <Skeleton animation="wave" height={36} width="45%" />
              </Box>
            </CardContent>
            <Box sx={{ p: 3, pt: 0 }}>
              <Skeleton animation="wave" height={42} sx={{ borderRadius: 2 }} />
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <Home sx={{ mr: 0.5 }} fontSize="small" />
          Home
        </Link>
        <Typography color="text.primary">Products</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700, color: "text.primary" }}
        >
          Our Products
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600 }}>
          Discover our carefully curated collection of premium products
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={fetchProducts}
              startIcon={<Refresh />}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Desktop Filters */}
      {!isMobile && (
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
      )}

      {/* Mobile Filter Button */}
      {isMobile && (
        <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
          <Button
            variant="outlined"
            startIcon={<Tune />}
            onClick={() => setMobileFiltersOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Filters & Sort
          </Button>
          <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
            <IconButton
              onClick={() => setViewMode("grid")}
              color={viewMode === "grid" ? "primary" : "default"}
              sx={{
                bgcolor:
                  viewMode === "grid"
                    ? alpha(theme.palette.primary.main, 0.1)
                    : "transparent",
                borderRadius: 2,
              }}
            >
              <GridView />
            </IconButton>
            <IconButton
              onClick={() => setViewMode("list")}
              color={viewMode === "list" ? "primary" : "default"}
              sx={{
                bgcolor:
                  viewMode === "list"
                    ? alpha(theme.palette.primary.main, 0.1)
                    : "transparent",
                borderRadius: 2,
              }}
            >
              <ViewList />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Mobile Filters Drawer */}
      <Drawer
        anchor="right"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: 320,
            p: 3,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6">Filters & Sort</Typography>
          <IconButton onClick={() => setMobileFiltersOpen(false)}>
            <Close />
          </IconButton>
        </Box>

        {/* Mobile search bar with its own focus state */}
        <TextField
          fullWidth
          placeholder="Search products..."
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
          onFocus={() => setMobileSearchFocused(true)}
          onBlur={() => setMobileSearchFocused(false)}
          onKeyPress={handleKeyPress}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color={mobileSearchFocused ? "primary" : "action"} />
              </InputAdornment>
            ),
          }}
        />

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            label="Category"
            onChange={handleCategoryChange}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category._id} value={category._id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} label="Sort By" onChange={handleSortChange}>
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="price-low">Price: Low to High</MenuItem>
            <MenuItem value="price-high">Price: High to Low</MenuItem>
            <MenuItem value="name">Name A-Z</MenuItem>
            <MenuItem value="rating">Highest Rated</MenuItem>
          </Select>
        </FormControl>

        {(searchTerm || categoryFilter || sortBy !== "newest") && (
          <Button
            onClick={clearFilters}
            fullWidth
            startIcon={<Close />}
            variant="outlined"
            sx={{ mb: 2 }}
          >
            Clear All Filters
          </Button>
        )}

        <Button
          onClick={() => setMobileFiltersOpen(false)}
          fullWidth
          variant="contained"
          sx={{ mt: 2, borderRadius: 2 }}
        >
          Apply Filters
        </Button>
      </Drawer>

      {/* Products Grid */}
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <Grid container spacing={viewMode === "grid" ? 3 : 0}>
          {products.map((product) =>
            viewMode === "grid" ? (
              <ProductCardGrid key={product._id} product={product} />
            ) : (
              <ProductCardList key={product._id} product={product} />
            )
          )}
        </Grid>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size={isMobile ? "small" : "medium"}
            sx={{
              "& .MuiPaginationItem-root": {
                borderRadius: 2,
                fontWeight: 600,
              },
            }}
          />
        </Box>
      )}

      {products.length === 0 && !loading && (
        <Box textAlign="center" sx={{ mt: 8, py: 8 }}>
          <img
            src="https://cdni.iconscout.com/illustration/premium/thumb/no-product-found-8853572-7262762.png"
            alt="No products found"
            style={{ width: "200px", margin: "0 auto 24px", opacity: 0.7 }}
          />
          <Typography variant="h5" gutterBottom color="text.secondary">
            No products found
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, maxWidth: 400, mx: "auto" }}
          >
            Try adjusting your search or filter criteria to find what you're
            looking for.
          </Typography>
          <Button
            variant="contained"
            onClick={clearFilters}
            sx={{ borderRadius: 2 }}
          >
            Clear All Filters
          </Button>
        </Box>
      )}

      {/* Floating Action Button for Mobile Filters */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="filters"
          onClick={() => setMobileFiltersOpen(true)}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            display: { md: "none" },
          }}
        >
          <FilterList />
        </Fab>
      )}

      {/* Snackbar for notifications */}
      {snackbar.open && (
        <Alert
          severity={snackbar.severity}
          onClose={handleCloseSnackbar}
          sx={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            minWidth: 300,
            boxShadow: 6,
          }}
        >
          {snackbar.message}
        </Alert>
      )}
    </Container>
  );
};

export default Products;

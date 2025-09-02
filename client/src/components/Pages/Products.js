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
  Slide,
  Fab,
  Badge,
  InputAdornment,
  CircularProgress,
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
  Star,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryFromUrl = queryParams.get("category");

  useEffect(() => {
    if (categoryFromUrl) {
      setCategoryFilter(categoryFromUrl);
    }

    fetchCategories();
    // Load wishlist from localStorage
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, [categoryFromUrl]);

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, sortBy, page, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = `/api/products?page=${page}&limit=${
        viewMode === "grid" ? 12 : 6
      }&sort=${sortBy}`;

      if (categoryFilter) {
        url += `&category=${categoryFilter}`;
      }

      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }

      const response = await axios.get(url);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching products:", error);
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
    const newWishlist = wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];

    setWishlist(newWishlist);
    localStorage.setItem("wishlist", JSON.stringify(newWishlist));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setSortBy("newest");
    setPage(1);
  };

  const renderRating = (rating) => {
    return (
      <Box display="flex" alignItems="center" mt={1}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            sx={{
              color: star <= rating ? "#FFD700" : "#ddd",
              fontSize: "16px",
            }}
          />
        ))}
        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
          ({Math.floor(Math.random() * 100)})
        </Typography>
      </Box>
    );
  };

  const FilterSection = () => (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}
      >
        <TextField
          placeholder="Search products..."
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
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
                <Search color="action" />
              </InputAdornment>
            ),
          }}
        />

        <FormControl sx={{ minWidth: 200 }}>
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

        <FormControl sx={{ minWidth: 200 }}>
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
          >
            <GridView />
          </IconButton>
          <IconButton
            onClick={() => setViewMode("list")}
            color={viewMode === "list" ? "primary" : "default"}
          >
            <ViewList />
          </IconButton>
        </Box>

        {(searchTerm || categoryFilter || sortBy !== "newest") && (
          <Button onClick={clearFilters} startIcon={<Close />}>
            Clear Filters
          </Button>
        )}
      </Box>
    </Box>
  );

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
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
            },
          }}
        >
          <Box sx={{ position: "relative" }}>
            <CardMedia
              component="img"
              height="240"
              image={
                product.images && product.images[0]
                  ? product.images[0]
                  : "https://source.unsplash.com/random/300x300/?product"
              }
              alt={product.name}
              sx={{ objectFit: "contain", p: 2, backgroundColor: "#f9f9f9" }}
              onError={(e) => {
                e.target.src =
                  "https://source.unsplash.com/random/300x300/?product";
              }}
            />
            <IconButton
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                backgroundColor: alpha("#fff", 0.9),
                "&:hover": {
                  backgroundColor: "#fff",
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
                  top: 12,
                  left: 12,
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
                  top: 12,
                  left: 12,
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
              sx={{ fontWeight: 600 }}
            >
              {product.name}
            </Typography>
            {renderRating(4)}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, mb: 2 }}
            >
              {product.description.length > 80
                ? `${product.description.substring(0, 80)}...`
                : product.description}
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
              <Chip
                icon={<ShoppingCart />}
                label="Add to Cart"
                size="small"
                variant="outlined"
                clickable
                sx={{ fontWeight: 600 }}
              />
            </Box>
          </CardContent>
          <Box sx={{ p: 3, pt: 0 }}>
            <Button
              variant="contained"
              fullWidth
              component={Link}
              to={`/products/${product._id}`}
              sx={{
                borderRadius: 2,
                py: 1.2,
                fontWeight: 600,
              }}
            >
              View Details
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
            mb: 2,
            transition: "transform 0.3s, box-shadow 0.3s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
            },
          }}
        >
          <Box sx={{ width: 200, flexShrink: 0, position: "relative" }}>
            <CardMedia
              component="img"
              height="200"
              image={
                product.images && product.images[0]
                  ? product.images[0]
                  : "https://source.unsplash.com/random/200x200/?product"
              }
              alt={product.name}
              sx={{
                objectFit: "contain",
                p: 2,
                height: "100%",
                backgroundColor: "#f9f9f9",
              }}
            />
            <IconButton
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                backgroundColor: alpha("#fff", 0.9),
                "&:hover": {
                  backgroundColor: "#fff",
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
            sx={{ display: "flex", flexDirection: "column", flexGrow: 1, p: 3 }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
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
                {renderRating(4)}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1, mb: 2 }}
                >
                  {product.description}
                </Typography>
              </Box>
              <Typography
                variant="h5"
                color="primary"
                sx={{ fontWeight: 700, ml: 2 }}
              >
                ৳{product.price}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2, mt: "auto" }}>
              <Button
                variant="outlined"
                startIcon={<ShoppingCart />}
                disabled={product.stock === 0}
                sx={{ borderRadius: 2 }}
              >
                Add to Cart
              </Button>
              <Button
                variant="contained"
                component={Link}
                to={`/products/${product._id}`}
                sx={{ borderRadius: 2 }}
              >
                View Details
              </Button>
            </Box>
          </Box>
        </Card>
      </Fade>
    </Grid>
  );

  const LoadingSkeleton = () => (
    <Grid container spacing={4}>
      {Array.from(new Array(viewMode === "grid" ? 12 : 6)).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Skeleton variant="rectangular" height={240} animation="wave" />
            <CardContent sx={{ p: 3 }}>
              <Skeleton animation="wave" height={30} width="80%" />
              <Skeleton
                animation="wave"
                height={20}
                width="60%"
                sx={{ mt: 1 }}
              />
              <Skeleton
                animation="wave"
                height={20}
                width="40%"
                sx={{ mt: 1 }}
              />
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
              >
                <Skeleton animation="wave" height={30} width="40%" />
                <Skeleton animation="wave" height={30} width="40%" />
              </Box>
            </CardContent>
            <Box sx={{ p: 3, pt: 0 }}>
              <Skeleton animation="wave" height={45} sx={{ borderRadius: 2 }} />
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          Discover Products
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600 }}>
          Explore our curated collection of high-quality products
        </Typography>
      </Box>

      {/* Desktop Filters */}
      {!isMobile && <FilterSection />}

      {/* Mobile Filter Button */}
      {isMobile && (
        <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
          <Button
            variant="outlined"
            startIcon={<Tune />}
            onClick={() => setMobileFiltersOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Filters
          </Button>
          <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
            <IconButton
              onClick={() => setViewMode("grid")}
              color={viewMode === "grid" ? "primary" : "default"}
            >
              <GridView />
            </IconButton>
            <IconButton
              onClick={() => setViewMode("list")}
              color={viewMode === "list" ? "primary" : "default"}
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
            width: 300,
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
          <Typography variant="h6">Filters</Typography>
          <IconButton onClick={() => setMobileFiltersOpen(false)}>
            <Close />
          </IconButton>
        </Box>

        <TextField
          fullWidth
          placeholder="Search products..."
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
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
          <Button onClick={clearFilters} fullWidth startIcon={<Close />}>
            Clear Filters
          </Button>
        )}
      </Drawer>

      {/* Products Grid */}
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <Grid container spacing={viewMode === "grid" ? 4 : 0}>
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
          <Typography variant="h5" gutterBottom color="text.secondary">
            No products found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search or filters
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
            bottom: 16,
            right: 16,
            display: { md: "none" },
          }}
        >
          <FilterList />
        </Fab>
      )}
    </Container>
  );
};

export default Products;

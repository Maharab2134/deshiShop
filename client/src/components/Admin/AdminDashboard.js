import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Autocomplete,
  Chip,
  Alert,
  Snackbar,
  Avatar,
  LinearProgress,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  Slide,
  Zoom,
  Skeleton,
  Divider,
  Switch,
  FormControlLabel,
  InputAdornment,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
} from "@mui/material";
import {
  Edit,
  Delete,
  Add,
  Category,
  ShoppingCart,
  People,
  TrendingUp,
  Inventory,
  LocalOffer,
  Visibility,
  Search,
  FilterList,
  Dashboard,
  Notifications,
  Settings,
  Logout,
  Image,
  Description,
  AttachMoney,
  Inventory2,
  Star,
  CheckCircle,
  Pending,
  Cancel,
  Update,
  ExpandMore,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openOrderDialog, setOpenOrderDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchAllData();
    } else {
      navigate("/");
    }
  }, [user, navigate]);

  // Recalculate stats whenever products, users, or orders change
  useEffect(() => {
    calculateStats();
  }, [products, users, orders]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchUsers(),
        fetchOrders(),
        fetchCategories(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      showSnackbar("Error loading dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalRevenue = orders.reduce((sum, order) => {
      // Ensure we're working with numbers
      const amount =
        typeof order.totalAmount === "number"
          ? order.totalAmount
          : parseFloat(order.totalAmount) || 0;
      return sum + amount;
    }, 0);

    const totalOrders = orders.length;
    const totalUsers = users.length;
    const totalProducts = products.length;

    setStats({ totalRevenue, totalOrders, totalUsers, totalProducts });
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get("/api/products");
      const productsData = response.data.products || response.data;
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      showSnackbar("Error fetching products", "error");
      setProducts([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users");
      const usersData = response.data.users || response.data;
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      showSnackbar("Error fetching users", "error");
      setUsers([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get("/api/orders");
      const ordersData = response.data.orders || response.data;
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showSnackbar("Error fetching orders", "error");
      setOrders([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      showSnackbar("Error fetching categories", "error");
    }
  };
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Use the correct endpoint for status updates
      await axios.put(`/api/orders/${orderId}/status`, {
        status: newStatus.toLowerCase(),
      });
      showSnackbar("Order status updated successfully");
      fetchOrders(); // Refresh orders list

      // If we're viewing the order details, update the selected order as well
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      showSnackbar("Error updating order status", "error");
    }
  };

  const updateOrderPaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/payment-status`, {
        paymentStatus: newPaymentStatus,
      });
      showSnackbar("Payment status updated successfully");
      fetchOrders(); // Refresh orders list

      // If viewing order details, update selected order as well
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, paymentStatus: newPaymentStatus });
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      showSnackbar("Error updating payment status", "error");
    }
  };

  // KEEP this showSnackbar function - it's needed throughout the component
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setOpenProductDialog(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`/api/products/${id}`);
        fetchProducts();
        showSnackbar("Product deleted successfully");
      } catch (error) {
        console.error("Error deleting product:", error);
        showSnackbar("Error deleting product", "error");
      }
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOpenOrderDialog(true);
  };

  const handleSubmitProduct = async (productData) => {
    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, productData);
        showSnackbar("Product updated successfully");
      } else {
        await axios.post("/api/products", productData);
        showSnackbar("Product created successfully");
      }
      setOpenProductDialog(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      showSnackbar("Error saving product", "error");
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setOpenCategoryDialog(true);
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`/api/categories/${id}`);
        fetchCategories();
        showSnackbar("Category deleted successfully");
      } catch (error) {
        console.error("Error deleting category:", error);
        showSnackbar("Error deleting category", "error");
      }
    }
  };

  // Open user details dialog
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setOpenUserDialog(true);
  };

  const handleSubmitCategory = async (categoryData) => {
    try {
      if (editingCategory) {
        await axios.put(`/api/categories/${editingCategory._id}`, categoryData);
        showSnackbar("Category updated successfully");
      } else {
        await axios.post("/api/categories", categoryData);
        showSnackbar("Category created successfully");
      }
      setOpenCategoryDialog(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      showSnackbar("Error saving category", "error");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <CheckCircle color="success" />;
      case "pending":
        return <Pending color="warning" />;
      case "cancelled":
        return <Cancel color="error" />;
      case "processing":
        return <Update color="info" />;
      case "shipped":
        return <LocalOffer color="primary" />;
      default:
        return <Pending color="action" />;
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || user.role !== "admin") {
    return (
      <Container>
        <Typography variant="h4" align="center" sx={{ mt: 4 }}>
          Admin Access Required
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      {/* Sidebar */}
      <Paper
        sx={{
          width: 280,
          p: 2,
          borderRadius: 0,
          display: { xs: "none", md: "block" },
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: theme.palette.primary.main }}
          >
            DeshiShop Admin
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Admin Dashboard
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Button
            fullWidth
            startIcon={<Dashboard />}
            sx={{ justifyContent: "flex-start", mb: 1 }}
            onClick={() => setTabValue(4)}
          >
            Dashboard
          </Button>
          <Button
            fullWidth
            startIcon={<Inventory />}
            sx={{ justifyContent: "flex-start", mb: 1 }}
            onClick={() => setTabValue(0)}
          >
            Products
          </Button>
          <Button
            fullWidth
            startIcon={<Category />}
            sx={{ justifyContent: "flex-start", mb: 1 }}
            onClick={() => setTabValue(1)}
          >
            Categories
          </Button>
          <Button
            fullWidth
            startIcon={<People />}
            sx={{ justifyContent: "flex-start", mb: 1 }}
            onClick={() => setTabValue(2)}
          >
            Users
          </Button>
          <Button
            fullWidth
            startIcon={<ShoppingCart />}
            sx={{ justifyContent: "flex-start", mb: 1 }}
            onClick={() => setTabValue(3)}
          >
            Orders
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Button
            fullWidth
            startIcon={<Settings />}
            sx={{ justifyContent: "flex-start", mb: 1 }}
          >
            Settings
          </Button>
          <Button
            fullWidth
            startIcon={<Logout />}
            sx={{ justifyContent: "flex-start" }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Container maxWidth="xl" sx={{ p: 0 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Admin Dashboard
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <TextField
                placeholder="Search..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  display: { xs: "none", sm: "block" },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                  },
                }}
              />
              <Chip
                avatar={<Avatar>{user.name?.charAt(0)}</Avatar>}
                label={user.name}
                variant="outlined"
              />
            </Box>
          </Box>

          {/* Mobile Tabs */}
          {isMobile && (
            <Paper sx={{ mb: 3, borderRadius: 3 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  "& .MuiTab-root": {
                    minWidth: "auto",
                    px: 2,
                    fontSize: "0.8rem",
                  },
                }}
              >
                <Tab icon={<Inventory />} label="Products" />
                <Tab icon={<Category />} label="Categories" />
                <Tab icon={<People />} label="Users" />
                <Tab icon={<ShoppingCart />} label="Orders" />
                <Tab icon={<Dashboard />} label="Analytics" />
              </Tabs>
            </Paper>
          )}

          {loading ? (
            <Box>
              <Skeleton
                variant="rectangular"
                height={200}
                sx={{ borderRadius: 3, mb: 3 }}
              />
              <Skeleton
                variant="rectangular"
                height={400}
                sx={{ borderRadius: 3 }}
              />
            </Box>
          ) : (
            <>
              {/* Analytics Dashboard */}
              {tabValue === 4 && (
                <Fade in={true} timeout={500}>
                  <Box>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                          title="Total Revenue"
                          value={`৳${stats.totalRevenue.toLocaleString()}`}
                          icon={<AttachMoney />}
                          color={theme.palette.primary.main}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                          title="Total Orders"
                          value={stats.totalOrders}
                          icon={<ShoppingCart />}
                          color={theme.palette.success.main}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                          title="Total Users"
                          value={stats.totalUsers}
                          icon={<People />}
                          color={theme.palette.warning.main}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                          title="Total Products"
                          value={stats.totalProducts}
                          icon={<Inventory2 />}
                          color={theme.palette.info.main}
                        />
                      </Grid>
                    </Grid>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                          <Typography variant="h6" gutterBottom>
                            Recent Orders
                          </Typography>
                          <TableContainer>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Order ID</TableCell>
                                  <TableCell>Customer</TableCell>
                                  <TableCell>Amount</TableCell>
                                  <TableCell>Status</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {orders.slice(0, 5).map((order) => (
                                  <TableRow key={order._id}>
                                    <TableCell>
                                      #{order._id?.substring(0, 8)}
                                    </TableCell>
                                    <TableCell>{order.user?.name}</TableCell>
                                    <TableCell>৳{order.totalAmount}</TableCell>
                                    <TableCell>
                                      <Chip
                                        icon={getStatusIcon(order.orderStatus)}
                                        label={order.orderStatus}
                                        size="small"
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                          <Typography variant="h6" gutterBottom>
                            Quick Actions
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                            }}
                          >
                            <Button
                              variant="contained"
                              startIcon={<Add />}
                              onClick={() => setOpenProductDialog(true)}
                              sx={{ borderRadius: 2 }}
                            >
                              Add Product
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<Category />}
                              onClick={() => setOpenCategoryDialog(true)}
                              sx={{ borderRadius: 2 }}
                            >
                              Add Category
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<People />}
                              onClick={() => setTabValue(2)}
                              sx={{ borderRadius: 2 }}
                            >
                              View Users
                            </Button>
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                </Fade>
              )}

              {/* Products Tab */}
              <TabPanel value={tabValue} index={0}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 3,
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <TextField
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      minWidth: 250,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                      },
                    }}
                  />
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<FilterList />}
                      sx={{ borderRadius: 3 }}
                    >
                      Filters
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setOpenProductDialog(true)}
                      sx={{ borderRadius: 3 }}
                    >
                      Add Product
                    </Button>
                  </Box>
                </Box>

                <TableContainer
                  component={Paper}
                  sx={{ borderRadius: 3, overflow: "hidden" }}
                >
                  <Table>
                    <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
                      <TableRow>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>
                          Product
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>
                          Price
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>
                          Stock
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>
                          Category
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>
                          Status
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product._id} hover>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Avatar
                                src={product.images?.[0]}
                                variant="rounded"
                                sx={{ width: 50, height: 50 }}
                              >
                                <Image />
                              </Avatar>
                              <Box>
                                <Typography fontWeight={600}>
                                  {product.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {product.description?.substring(0, 50)}...
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight={600} color="primary">
                              ৳{product.price}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <LinearProgress
                                variant="determinate"
                                value={(product.stock / 100) * 100}
                                sx={{
                                  width: 60,
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.2
                                  ),
                                  "& .MuiLinearProgress-bar": {
                                    bgcolor:
                                      product.stock > 10
                                        ? theme.palette.success.main
                                        : theme.palette.warning.main,
                                  },
                                }}
                              />
                              <Typography variant="body2">
                                {product.stock}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={product.category?.name || product.category}
                              color="primary"
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                product.stock > 0 ? "In Stock" : "Out of Stock"
                              }
                              color={product.stock > 0 ? "success" : "error"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Tooltip title="Edit">
                                <IconButton
                                  onClick={() => handleEditProduct(product)}
                                  sx={{
                                    color: theme.palette.primary.main,
                                    "&:hover": {
                                      bgcolor: alpha(
                                        theme.palette.primary.main,
                                        0.1
                                      ),
                                    },
                                  }}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  onClick={() =>
                                    handleDeleteProduct(product._id)
                                  }
                                  sx={{
                                    color: theme.palette.error.main,
                                    "&:hover": {
                                      bgcolor: alpha(
                                        theme.palette.error.main,
                                        0.1
                                      ),
                                    },
                                  }}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="View">
                                <IconButton
                                  sx={{
                                    color: theme.palette.info.main,
                                    "&:hover": {
                                      bgcolor: alpha(
                                        theme.palette.info.main,
                                        0.1
                                      ),
                                    },
                                  }}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              {/* Categories Tab */}
              <TabPanel value={tabValue} index={1}>
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}
                >
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenCategoryDialog(true)}
                    sx={{ borderRadius: 3 }}
                  >
                    Add Category
                  </Button>
                </Box>
                <Grid container spacing={3}>
                  {categories.map((category) => (
                    <Grid item xs={12} sm={6} md={4} key={category._id}>
                      <CategoryCard
                        category={category}
                        onEdit={handleEditCategory}
                        onDelete={handleDeleteCategory}
                      />
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>

              {/* Users Tab */}
              <TabPanel value={tabValue} index={2}>
                <TableContainer
                  component={Paper}
                  sx={{ borderRadius: 3, overflow: "hidden" }}
                >
                  <Table>
                    <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
                      <TableRow>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>
                          User
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>
                          Email
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>
                          Role
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>
                          Joined
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>
                          Status
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow
                          key={user._id}
                          hover
                          sx={{ cursor: "pointer" }}
                          onClick={() => handleViewUser(user)}
                        >
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Avatar>{user.name?.charAt(0)}</Avatar>
                              <Typography fontWeight={600}>
                                {user.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Chip
                              label={user.role}
                              color={
                                user.role === "admin" ? "primary" : "default"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip label="Active" color="success" size="small" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              {/* Orders Tab */}
              <TabPanel value={tabValue} index={3}>
                <TableContainer
                  component={Paper}
                  sx={{ borderRadius: 3, overflow: "hidden" }}
                >
                  <Table>
                    <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
                      <TableRow>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>
                          Order ID
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>
                          Customer
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>
                          Amount
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>
                          Status
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>
                          Date
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order._id} hover>
                          <TableCell>#{order._id?.substring(0, 8)}</TableCell>
                          <TableCell>{order.user?.name}</TableCell>
                          <TableCell>
                            <Typography fontWeight={600} color="primary">
                              ৳{order.totalAmount}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(order.orderStatus)}
                              label={order.orderStatus}
                              color={
                                order.orderStatus === "Delivered"
                                  ? "success"
                                  : order.orderStatus === "Pending"
                                  ? "warning"
                                  : order.orderStatus === "Cancelled"
                                  ? "error"
                                  : order.orderStatus === "Processing"
                                  ? "info"
                                  : order.orderStatus === "Shipped"
                                  ? "primary"
                                  : "default"
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              sx={{ borderRadius: 2 }}
                              onClick={() => handleViewOrder(order)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
            </>
          )}

          <ProductDialog
            open={openProductDialog}
            onClose={() => {
              setOpenProductDialog(false);
              setEditingProduct(null);
            }}
            onSubmit={handleSubmitProduct}
            product={editingProduct}
            categories={categories}
          />

          <CategoryDialog
            open={openCategoryDialog}
            onClose={() => {
              setOpenCategoryDialog(false);
              setEditingCategory(null);
            }}
            onSubmit={handleSubmitCategory}
            category={editingCategory}
          />

          <OrderDialog
            open={openOrderDialog}
            onClose={() => {
              setOpenOrderDialog(false);
              setSelectedOrder(null);
            }}
            order={selectedOrder}
            onStatusUpdate={updateOrderStatus}
            onPaymentStatusUpdate={updateOrderPaymentStatus}
          />

          <UserDialog
            open={openUserDialog}
            onClose={() => {
              setOpenUserDialog(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
          />

          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </Box>
  );
};

// User details dialog
const UserDialog = ({ open, onClose, user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!user) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
    >
      <DialogTitle>User Details</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
          <Avatar
            src={user.avatar || user.profileImage}
            sx={{ width: 64, height: 64 }}
          >
            {user.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6">{user.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
            <Chip
              label={user.role}
              size="small"
              sx={{ mt: 1 }}
              color={user.role === "admin" ? "primary" : "default"}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Phone:</strong> {user.phone || "N/A"}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Address:</strong> {user.address || "N/A"}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Joined:</strong>{" "}
          {user.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A"}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Additional components for better organization
const StatCard = ({ title, value, icon, color }) => (
  <Paper
    sx={{
      p: 3,
      borderRadius: 3,
      background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(
        color,
        0.05
      )} 100%)`,
      border: `1px solid ${alpha(color, 0.2)}`,
    }}
  >
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={700} color={color}>
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          bgcolor: alpha(color, 0.1),
          p: 1.5,
          borderRadius: 3,
        }}
      >
        {React.cloneElement(icon, {
          sx: { fontSize: 32, color: color },
        })}
      </Box>
    </Box>
  </Paper>
);

const CategoryCard = ({ category, onEdit, onDelete }) => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        transition: "transform 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          {category.name}
        </Typography>
        <Chip
          label={category.isActive ? "Active" : "Inactive"}
          color={category.isActive ? "success" : "default"}
          size="small"
        />
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {category.description || "No description available"}
      </Typography>

      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          size="small"
          startIcon={<Edit />}
          onClick={() => onEdit(category)}
          sx={{ borderRadius: 2 }}
        >
          Edit
        </Button>
        <Button
          size="small"
          startIcon={<Delete />}
          onClick={() => onDelete(category._id)}
          color="error"
          sx={{ borderRadius: 2 }}
        >
          Delete
        </Button>
      </Box>
    </Paper>
  );
};
const paymentStatusOptions = [
  { value: "Pending", label: "Pending", color: "warning" },
  { value: "Paid", label: "Paid", color: "success" },
  { value: "Failed", label: "Failed", color: "error" },
  { value: "Refunded", label: "Refunded", color: "info" },
];

const paymentStatusMap = {
  Pending: "pending",
  Paid: "completed",
  Failed: "failed",
  Refunded: "refunded",
};

function displayPaymentStatus(status) {
  switch (status) {
    case "completed":
      return "Paid";
    case "pending":
      return "Pending";
    case "failed":
      return "Failed";
    case "refunded":
      return "Refunded";
    default:
      return status;
  }
}
// Order Dialog Component
// Order Dialog Component - Modern UI Update
const OrderDialog = ({
  open,
  onClose,
  order,
  onStatusUpdate,
  onPaymentStatusUpdate,
}) => {
  const [status, setStatus] = useState(order?.orderStatus || "");
  const [paymentStatus, setPaymentStatus] = useState(
    displayPaymentStatus(order?.paymentStatus) || ""
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (order) {
      setStatus(order.orderStatus);
      setPaymentStatus(displayPaymentStatus(order.paymentStatus));
    }
  }, [order]);

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    setStatus(newStatus);
    if (order && order._id) {
      onStatusUpdate(order._id, newStatus);
    }
  };

  const handlePaymentStatusChange = (event) => {
    const newStatus = event.target.value;
    setPaymentStatus(newStatus);
    if (order && order._id) {
      onPaymentStatusUpdate(order._id, paymentStatusMap[newStatus]);
    }
  };

  if (!order) return null;

  // Helper function to parse shipping address
  const getShippingAddress = () => {
    if (typeof order.shippingAddress === "string") {
      return {
        street: order.shippingAddress,
        city: "Dhaka",
        country: "Bangladesh",
      };
    }
    return order.shippingAddress || {};
  };

  const shippingAddress = getShippingAddress();

  const statusOptions = [
    { value: "Pending", label: "Pending", color: "warning", icon: <Pending /> },
    {
      value: "Processing",
      label: "Processing",
      color: "info",
      icon: <Update />,
    },
    {
      value: "Shipped",
      label: "Shipped",
      color: "primary",
      icon: <LocalOffer />,
    },
    {
      value: "Delivered",
      label: "Delivered",
      color: "success",
      icon: <CheckCircle />,
    },
    {
      value: "Cancelled",
      label: "Cancelled",
      color: "error",
      icon: <Cancel />,
    },
  ];

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find((opt) => opt.value === status);
    return statusOption ? statusOption.color : "default";
  };

  const getStatusIcon = (status) => {
    const statusOption = statusOptions.find((opt) => opt.value === status);
    return statusOption ? statusOption.icon : <Pending />;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          background: theme.palette.background.default,
        },
      }}
    >
      {/* Header with gradient background */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: "white",
          p: 3,
          position: "relative",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            color: "white",
          }}
        >
          <Cancel />
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <ShoppingCart sx={{ fontSize: 32, mr: 2 }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Order Details
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              #{order._id?.substring(0, 10)}...
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
          <Chip
            icon={getStatusIcon(order.orderStatus)}
            label={order.orderStatus}
            sx={{
              background: "rgba(255, 255, 255, 0.2)",
              color: "white",
              fontWeight: 600,
              backdropFilter: "blur(10px)",
            }}
          />
          <Chip
            label={`৳${order.totalAmount?.toFixed(2) || "0.00"}`}
            sx={{
              background: "rgba(255, 255, 255, 0.2)",
              color: "white",
              fontWeight: 600,
              backdropFilter: "blur(10px)",
            }}
          />
          <Chip
            label={new Date(order.createdAt).toLocaleDateString()}
            sx={{
              background: "rgba(255, 255, 255, 0.2)",
              color: "white",
              fontWeight: 600,
              backdropFilter: "blur(10px)",
            }}
          />
        </Box>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        <Grid container>
          {/* Left Panel - Order Information */}
          <Grid item xs={12} md={8}>
            <Box sx={{ p: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 3,
                  color: theme.palette.primary.main,
                }}
              >
                <Inventory sx={{ mr: 1 }} /> Order Items
              </Typography>

              <List sx={{ mb: 3 }}>
                {order.items?.map((item, index) => (
                  <ListItem
                    key={index}
                    divider
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: index % 2 === 0 ? "action.hover" : "transparent",
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: "action.selected",
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        badgeContent={item.quantity}
                        color="primary"
                        anchorOrigin={{ vertical: "top", horizontal: "left" }}
                      >
                        <Avatar
                          src={item.product?.images?.[0]}
                          variant="rounded"
                          sx={{ width: 60, height: 60, mr: 2 }}
                        >
                          <Image />
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography fontWeight={600}>
                          {item.product?.name || `Product ${index + 1}`}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            Unit Price: ৳{item.price}
                          </Typography>
                          {item.product?.category && (
                            <Chip
                              label={item.product.category}
                              size="small"
                              variant="outlined"
                              sx={{ mt: 0.5, height: 20, fontSize: "0.7rem" }}
                            />
                          )}
                        </Box>
                      }
                    />
                    <Typography fontWeight={600} color="primary">
                      ৳{(item.quantity * item.price).toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>

              {/* Order Summary */}
              <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: theme.palette.primary.main,
                  }}
                >
                  <AttachMoney sx={{ mr: 1 }} /> Order Summary
                </Typography>

                <Box sx={{ pl: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography>Subtotal:</Typography>
                    <Typography>
                      ৳{order.subtotal?.toFixed(2) || "0.00"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography>Shipping:</Typography>
                    <Typography>
                      ৳{order.shippingFee?.toFixed(2) || "0.00"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography>Tax:</Typography>
                    <Typography>
                      ৳{order.taxAmount?.toFixed(2) || "0.00"}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6" color="primary">
                      ৳{order.totalAmount?.toFixed(2) || "0.00"}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Grid>

          {/* Right Panel - Customer & Actions */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                p: 3,
                height: "100%",
                bgcolor: "grey.50",
                borderLeft: { md: `1px solid ${theme.palette.divider}` },
              }}
            >
              {/* Customer Information */}
              <Paper sx={{ p: 2.5, borderRadius: 3, mb: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: theme.palette.primary.main,
                  }}
                >
                  <People sx={{ mr: 1 }} /> Customer Information
                </Typography>

                <Box sx={{ pl: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.main }}>
                      {order.user?.name?.charAt(0) || "C"}
                    </Avatar>
                    <Box>
                      <Typography fontWeight={600}>
                        {order.user?.name || "N/A"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.user?.email || "N/A"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Description
                      sx={{ fontSize: 20, mr: 1, color: "text.secondary" }}
                    />
                    <Typography variant="body2">
                      {order.phone || "No phone provided"}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Shipping Address */}
              <Paper sx={{ p: 2.5, borderRadius: 3, mb: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: theme.palette.primary.main,
                  }}
                >
                  <LocalOffer sx={{ mr: 1 }} /> Shipping Address
                </Typography>

                <Box sx={{ pl: 1 }}>
                  <Typography variant="body2" paragraph>
                    {shippingAddress.street || "No address provided"}
                  </Typography>
                  <Typography variant="body2">
                    {shippingAddress.city}, {shippingAddress.state}
                  </Typography>
                  <Typography variant="body2">
                    {shippingAddress.postalCode} {shippingAddress.country}
                  </Typography>
                </Box>
              </Paper>

              {/* Payment Information */}
              <Paper sx={{ p: 2.5, borderRadius: 3, mb: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: theme.palette.primary.main,
                  }}
                >
                  <AttachMoney sx={{ mr: 1 }} /> Payment Information
                </Typography>

                <Box sx={{ pl: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="body2">Method:</Typography>
                    <Chip
                      label={order.paymentMethod || "N/A"}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Payment Status:
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      value={paymentStatus}
                      onChange={handlePaymentStatusChange}
                      size="small"
                    >
                      {paymentStatusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Chip
                              label={option.label}
                              size="small"
                              color={option.color}
                              sx={{ mr: 1 }}
                            />
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Box>
              </Paper>

              {/* Order Status Update */}
              <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: theme.palette.primary.main,
                  }}
                >
                  <Update sx={{ mr: 1 }} /> Update Status
                </Typography>

                <TextField
                  select
                  fullWidth
                  value={status}
                  onChange={handleStatusChange}
                  label="Order Status"
                  size="small"
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          sx={{
                            color: `${option.color}.main`,
                            mr: 1,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {option.icon}
                        </Box>
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2, borderRadius: 2 }}
                  onClick={() => onStatusUpdate(order._id, status)}
                >
                  Update Order Status
                </Button>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
// ProductDialog and CategoryDialog components remain similar but with improved styling
const ProductDialog = ({ open, onClose, onSubmit, product, categories }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    featured: false,
    images: [""],
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        stock: product.stock || "",
        category: product.category?.name || product.category || "",
        featured: product.featured || false,
        images:
          product.images && product.images.length > 0 ? product.images : [""],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        featured: false,
        images: [""],
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (event, newValue) => {
    setFormData((prev) => ({
      ...prev,
      category: newValue || "",
    }));
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      images: [e.target.value],
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "white",
          fontWeight: 600,
        }}
      >
        {product ? "Edit Product" : "Add New Product"}
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              name="name"
              label="Product Name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="price"
              label="Price (৳)"
              type="number"
              fullWidth
              value={formData.price}
              onChange={handleChange}
              inputProps={{ min: 0, step: 0.01 }}
              required
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="stock"
              label="Stock Quantity"
              type="number"
              fullWidth
              value={formData.stock}
              onChange={handleChange}
              inputProps={{ min: 0 }}
              required
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              freeSolo
              options={categories.map((category) => category.name)}
              value={formData.category}
              onChange={handleCategoryChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Category"
                  required
                  helperText="Type to search existing categories or enter a new one"
                  sx={{ mb: 2 }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="image"
              label="Product Image Link"
              fullWidth
              value={formData.images[0] || ""}
              onChange={handleImageChange}
              helperText="Paste a direct image URL (e.g. https://...)"
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      featured: e.target.checked,
                    }))
                  }
                  name="featured"
                />
              }
              label="Featured Product"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{ borderRadius: 2 }}
        >
          {product ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CategoryDialog = ({ open, onClose, onSubmit, category }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        isActive: category.isActive !== undefined ? category.isActive : true,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        isActive: true,
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "white",
          fontWeight: 600,
        }}
      >
        {category ? "Edit Category" : "Add New Category"}
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              name="name"
              label="Category Name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  name="isActive"
                />
              }
              label="Active Category"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{ borderRadius: 2 }}
        >
          {category ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminDashboard;

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
  Modal,
  CardMedia,
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
  QrCode,
  Download,
  Share,
  Print,
  Close,
  CloudUpload,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import jsQR from "jsqr";
import { QRCodeCanvas } from "qrcode.react";

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
  const [openQrDialog, setOpenQrDialog] = useState(false);
  const [selectedProductForQr, setSelectedProductForQr] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategoryTerm, setSearchCategoryTerm] = useState("");
  const [searchOrderTerm, setSearchOrderTerm] = useState("");
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [filters, setFilters] = useState({
    priceMin: "",
    priceMax: "",
    category: "",
    stock: "all", // all, inStock, outOfStock
  });
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
      await axios.put(`/api/orders/${orderId}/status`, {
        status: newStatus.toLowerCase(),
      });
      showSnackbar("Order status updated successfully");
      fetchOrders();

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
      fetchOrders();

      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, paymentStatus: newPaymentStatus });
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      showSnackbar("Error updating payment status", "error");
    }
  };

  // Generate QR Code for product
  const generateProductQRCode = async (productData, productId) => {
    try {
      // Create QR code data - you can customize what to include
      const qrData = JSON.stringify({
        productId: productId,
        name: productData.name,
        price: productData.price,
        category: productData.category,
        timestamp: new Date().toISOString(),
      });

      // Generate QR code image
      const qrCodeImage = `data:image/svg+xml;base64,${btoa(
        `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="256" height="256" viewBox="0 0 256 256">
          <!-- QR code will be generated by QRCode component -->
        </svg>`
      )}`;

      // If you want to save QR code to backend, you can do:
      // await axios.post(`/api/products/${productId}/qrcode`, { qrData, qrCodeImage });

      return {
        qrData,
        qrCodeImage,
        productUrl: `${window.location.origin}/products/${productId}`,
      };
    } catch (error) {
      console.error("Error generating QR code:", error);
      return null;
    }
  };

  // Handle product submission with QR generation
  const handleSubmitProduct = async (productData) => {
    try {
      let response;
      if (editingProduct) {
        response = await axios.put(
          `/api/products/${editingProduct._id}`,
          productData
        );
        showSnackbar("Product updated successfully");
      } else {
        response = await axios.post("/api/products", productData);
        showSnackbar("Product created successfully");
      }

      // Get the product ID from response
      const productId = response.data._id || editingProduct?._id;

      // Generate QR code for the product
      const qrInfo = await generateProductQRCode(productData, productId);

      if (qrInfo) {
        // Show QR code dialog
        setSelectedProductForQr({
          ...productData,
          _id: productId,
          qrInfo,
        });
        setOpenQrDialog(true);
      }

      // Close product dialog and refresh
      setOpenProductDialog(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      showSnackbar("Error saving product", "error");
    }
  };

  const handleViewQRCode = (product) => {
    // Generate QR data for existing product
    const qrInfo = {
      qrData: JSON.stringify({
        productId: product._id,
        name: product.name,
        price: product.price,
        category: product.category?.name || product.category,
      }),
      productUrl: `${window.location.origin}/products/${product._id}`,
    };

    setSelectedProductForQr({
      ...product,
      qrInfo,
    });
    setOpenQrDialog(true);
  };

  const handleDownloadQRCode = () => {
    if (!selectedProductForQr) return;

    const canvas = document.getElementById("product-qr-code");
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `QR_${selectedProductForQr.name.replace(
        /\s+/g,
        "_"
      )}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      showSnackbar("QR code downloaded successfully");
    }
  };

  const handlePrintQRCode = () => {
    const printContent = document.getElementById("qr-code-print-content");
    if (printContent) {
      const printWindow = window.open("", "", "width=600,height=600");
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code - ${selectedProductForQr?.name}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
              h2 { color: #333; }
              .product-info { margin: 20px 0; }
              .qr-container { margin: 20px auto; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

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

  const handleViewProductDetails = (product) => {
    setSelectedProductDetails(product);
    setOpenDetailsDialog(true);
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

  const filteredProducts = products.filter((product) => {
    // Search filter
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof product.category === "object"
        ? product.category?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
        : product.category?.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    // Price filter
    const price = Number(product.price);
    if (filters.priceMin && price < Number(filters.priceMin)) return false;
    if (filters.priceMax && price > Number(filters.priceMax)) return false;

    // Category filter
    if (filters.category) {
      const productCategory =
        typeof product.category === "object"
          ? product.category.name
          : product.category;
      if (productCategory !== filters.category) return false;
    }

    // Stock filter
    if (filters.stock === "inStock" && product.stock <= 0) return false;
    if (filters.stock === "outOfStock" && product.stock > 0) return false;

    return true;
  });

  const filteredCategories = categories.filter(
    (category) =>
      category.name?.toLowerCase().includes(searchCategoryTerm.toLowerCase()) ||
      category.description
        ?.toLowerCase()
        .includes(searchCategoryTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(
    (order) =>
      order._id?.toLowerCase().includes(searchOrderTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchOrderTerm.toLowerCase()) ||
      order.orderStatus?.toLowerCase().includes(searchOrderTerm.toLowerCase())
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
              {tabValue === 0 && (
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
              )}
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
                      onClick={() => setOpenFilterDialog(true)}
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
                          QR Code
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
                                src={
                                  product.images?.[0]?.url ||
                                  product.images?.[0]
                                }
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
                            <Tooltip title="View QR Code">
                              <IconButton
                                onClick={() => handleViewQRCode(product)}
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
                                <QrCode />
                              </IconButton>
                            </Tooltip>
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
                              <Tooltip title="View Details">
                                <IconButton
                                  onClick={() =>
                                    handleViewProductDetails(product)
                                  }
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
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 3,
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <TextField
                    placeholder="Search categories..."
                    value={searchCategoryTerm}
                    onChange={(e) => setSearchCategoryTerm(e.target.value)}
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
                  {filteredCategories.map((category) => (
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
                    placeholder="Search orders..."
                    value={searchOrderTerm}
                    onChange={(e) => setSearchOrderTerm(e.target.value)}
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
                </Box>
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
                      {filteredOrders.map((order) => (
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

          {/* Product Dialog */}
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

          {/* Filter Dialog */}
          <Dialog
            open={openFilterDialog}
            onClose={() => setOpenFilterDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ fontWeight: 700 }}>Filter Products</DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Min Price"
                    type="number"
                    fullWidth
                    value={filters.priceMin}
                    onChange={(e) =>
                      setFilters({ ...filters, priceMin: e.target.value })
                    }
                    inputProps={{ min: 0, step: 1 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Max Price"
                    type="number"
                    fullWidth
                    value={filters.priceMax}
                    onChange={(e) =>
                      setFilters({ ...filters, priceMax: e.target.value })
                    }
                    inputProps={{ min: 0, step: 1 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    options={[
                      "",
                      ...categories.map((category) => category.name),
                    ]}
                    value={filters.category}
                    onChange={(event, newValue) =>
                      setFilters({ ...filters, category: newValue || "" })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Category"
                        placeholder="All Categories"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    label="Stock Status"
                    fullWidth
                    value={filters.stock}
                    onChange={(e) =>
                      setFilters({ ...filters, stock: e.target.value })
                    }
                  >
                    <MenuItem value="all">All Products</MenuItem>
                    <MenuItem value="inStock">In Stock</MenuItem>
                    <MenuItem value="outOfStock">Out of Stock</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={() => {
                  setFilters({
                    priceMin: "",
                    priceMax: "",
                    category: "",
                    stock: "all",
                  });
                }}
              >
                Clear Filters
              </Button>
              <Button
                onClick={() => setOpenFilterDialog(false)}
                variant="contained"
              >
                Apply
              </Button>
            </DialogActions>
          </Dialog>

          {/* QR Code Dialog */}
          <QRCodeDialog
            open={openQrDialog}
            onClose={() => {
              setOpenQrDialog(false);
              setSelectedProductForQr(null);
            }}
            product={selectedProductForQr}
            onDownload={handleDownloadQRCode}
            onPrint={handlePrintQRCode}
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

          {/* Product Details Dialog */}
          <Dialog
            open={openDetailsDialog}
            onClose={() => {
              setOpenDetailsDialog(false);
              setSelectedProductDetails(null);
            }}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ fontWeight: 700 }}>Product Details</DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              {selectedProductDetails && (
                <Box>
                  {selectedProductDetails.images &&
                    selectedProductDetails.images.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={
                            selectedProductDetails.images[0]?.url ||
                            selectedProductDetails.images[0]
                          }
                          alt={selectedProductDetails.name}
                          sx={{ borderRadius: 1, mb: 2 }}
                        />
                      </Box>
                    )}
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {selectedProductDetails.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {selectedProductDetails.description}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Price
                      </Typography>
                      <Typography variant="h6" sx={{ color: "success.main" }}>
                        ৳ {selectedProductDetails.price}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Stock
                      </Typography>
                      <Typography variant="h6">
                        {selectedProductDetails.stock}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Category
                      </Typography>
                      <Typography variant="body2">
                        {typeof selectedProductDetails.category === "object"
                          ? selectedProductDetails.category.name
                          : selectedProductDetails.category}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Rating
                      </Typography>
                      <Typography variant="body2">
                        ⭐ {selectedProductDetails.rating || "N/A"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={() => {
                  setOpenDetailsDialog(false);
                  setSelectedProductDetails(null);
                }}
                sx={{ borderRadius: 2 }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>

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

// QR Code Dialog Component
const QRCodeDialog = ({ open, onClose, product, onDownload, onPrint }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!product) return null;

  const qrData = product.qrInfo?.qrData
    ? JSON.parse(product.qrInfo.qrData)
    : {
        productId: product._id,
        name: product.name,
        price: product.price,
        category: product.category?.name || product.category,
      };

  const productUrl =
    product.qrInfo?.productUrl ||
    `${window.location.origin}/products/${product._id}`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Product QR Code
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 4, bgcolor: "grey.50" }}>
        <Grid container spacing={4}>
          {/* QR Code Section */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: `2px solid ${theme.palette.primary.main}`,
                borderRadius: 3,
                height: "100%",
                background: `linear-gradient(135deg, ${alpha(
                  theme.palette.primary.light,
                  0.1
                )} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: `0 8px 24px ${alpha(
                    theme.palette.primary.main,
                    0.15
                  )}`,
                  transform: "translateY(-2px)",
                },
              }}
            >
              <div id="qr-code-print-content">
                <Box
                  sx={{
                    p: 3,
                    bgcolor: "white",
                    borderRadius: 2,
                    border: `2px dashed ${theme.palette.primary.main}`,
                    mb: 3,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 250,
                    boxShadow: `inset 0 2px 8px ${alpha(
                      theme.palette.primary.main,
                      0.05
                    )}`,
                  }}
                >
                  <QRCodeCanvas
                    id="product-qr-code"
                    value={JSON.stringify({
                      name: product.name,
                      price: product.price,
                      stock: product.stock,
                      category: product.category?.name || product.category,
                      description: product.description,
                    })}
                    size={220}
                    level="H"
                    includeMargin={true}
                    style={{
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                    }}
                  />
                </Box>

                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 0.5,
                      fontWeight: 700,
                      color: theme.palette.primary.main,
                    }}
                  >
                    {product.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mb: 1 }}
                  >
                    Scan to view product details
                  </Typography>
                  <Chip
                    label={`৳${product.price}`}
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </div>

              <Divider sx={{ my: 2.5, width: "100%" }} />

              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  textAlign: "center",
                  fontSize: "0.75rem",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <QrCode sx={{ fontSize: 14 }} />
                  ID: {product._id?.substring(0, 16)}...
                </Box>
              </Typography>
            </Paper>
          </Grid>

          {/* Product Info & Actions Section */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {/* Product Information */}
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.info.main,
                    0.08
                  )} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 700,
                    color: theme.palette.info.main,
                    mb: 2,
                  }}
                >
                  <Inventory sx={{ mr: 1.5, fontSize: 24 }} />
                  Product Details
                </Typography>

                <Box sx={{ pl: 1 }}>
                  <Box sx={{ mb: 2.5 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", mb: 0.5, fontWeight: 500 }}
                    >
                      Name
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: "1rem",
                        color: theme.palette.text.primary,
                      }}
                    >
                      {product.name}
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          borderRadius: 1.5,
                          border: `1px solid ${alpha(
                            theme.palette.primary.main,
                            0.1
                          )}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            mb: 0.5,
                            fontWeight: 500,
                            fontSize: "0.85rem",
                          }}
                        >
                          Price
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: theme.palette.primary.main,
                            fontSize: "1.1rem",
                          }}
                        >
                          ৳{product.price}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: alpha(theme.palette.success.main, 0.05),
                          borderRadius: 1.5,
                          border: `1px solid ${alpha(
                            theme.palette.success.main,
                            0.1
                          )}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            mb: 0.5,
                            fontWeight: 500,
                            fontSize: "0.85rem",
                          }}
                        >
                          Stock
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: theme.palette.success.main,
                            fontSize: "1.1rem",
                          }}
                        >
                          {product.stock}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2.5 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        mb: 0.8,
                        fontWeight: 500,
                      }}
                    >
                      Category
                    </Typography>
                    <Chip
                      icon={<Category />}
                      label={product.category?.name || product.category}
                      variant="outlined"
                      color="primary"
                      sx={{
                        fontWeight: 600,
                        height: 32,
                        borderWidth: 2,
                      }}
                    />
                  </Box>
                </Box>
              </Paper>

              {/* Action Buttons */}
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.primary.main,
                    0.08
                  )} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  flexGrow: 1,
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    mb: 2,
                  }}
                >
                  <QrCode sx={{ mr: 1.5, fontSize: 24 }} />
                  QR Code Actions
                </Typography>

                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Download />}
                      onClick={onDownload}
                      sx={{
                        borderRadius: 2,
                        height: 48,
                        fontWeight: 600,
                        textTransform: "none",
                        fontSize: "0.95rem",
                        boxShadow: `0 4px 12px ${alpha(
                          theme.palette.primary.main,
                          0.3
                        )}`,
                        "&:hover": {
                          boxShadow: `0 6px 16px ${alpha(
                            theme.palette.primary.main,
                            0.4
                          )}`,
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Download PNG
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Print />}
                      onClick={onPrint}
                      sx={{
                        borderRadius: 2,
                        height: 48,
                        fontWeight: 600,
                        textTransform: "none",
                        fontSize: "0.95rem",
                        borderWidth: 2,
                        "&:hover": {
                          borderWidth: 2,
                          transform: "translateY(-2px)",
                          boxShadow: `0 4px 12px ${alpha(
                            theme.palette.primary.main,
                            0.2
                          )}`,
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Print
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Share />}
                      sx={{
                        borderRadius: 2,
                        height: 48,
                        fontWeight: 600,
                        textTransform: "none",
                        fontSize: "0.95rem",
                        borderWidth: 2,
                        "&:hover": {
                          borderWidth: 2,
                          transform: "translateY(-2px)",
                          boxShadow: `0 4px 12px ${alpha(
                            theme.palette.primary.main,
                            0.2
                          )}`,
                        },
                        transition: "all 0.3s ease",
                      }}
                      onClick={() => {
                        navigator.clipboard.writeText(productUrl);
                      }}
                    >
                      Copy Product Link
                    </Button>
                  </Grid>
                </Grid>

                {/* QR Data Info */}
                <Box
                  sx={{
                    mt: 3,
                    pt: 2.5,
                    borderTop: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.2
                    )}`,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      gutterBottom: true,
                      fontWeight: 600,
                      mb: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Description sx={{ fontSize: 18 }} />
                    QR Data Contains:
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      p: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      borderRadius: 1.5,
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}`,
                      fontSize: "0.7rem",
                      overflow: "auto",
                      maxHeight: 120,
                      color: theme.palette.text.secondary,
                      fontFamily: "monospace",
                      lineHeight: 1.4,
                    }}
                  >
                    {JSON.stringify(qrData, null, 2)}
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
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
const OrderDialog = ({
  open,
  onClose,
  order,
  onStatusUpdate,
  onPaymentStatusUpdate,
}) => {
  const [status, setStatus] = useState(order?.orderStatus?.toLowerCase() || "");
  const [paymentStatus, setPaymentStatus] = useState(
    displayPaymentStatus(order?.paymentStatus) || ""
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (order) {
      setStatus(order.orderStatus?.toLowerCase() || "");
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
    { value: "pending", label: "Pending", color: "warning", icon: <Pending /> },
    {
      value: "processing",
      label: "Processing",
      color: "info",
      icon: <Update />,
    },
    {
      value: "shipped",
      label: "Shipped",
      color: "primary",
      icon: <LocalOffer />,
    },
    {
      value: "delivered",
      label: "Delivered",
      color: "success",
      icon: <CheckCircle />,
    },
    {
      value: "cancelled",
      label: "Cancelled",
      color: "error",
      icon: <Cancel />,
    },
  ];

  const getStatusIcon = (status) => {
    const statusOption = statusOptions.find(
      (opt) => opt.value === (status || "").toLowerCase()
    );
    return statusOption ? statusOption.icon : <Pending />;
  };

  const getStatusLabel = (status) => {
    const statusOption = statusOptions.find(
      (opt) => opt.value === (status || "").toLowerCase()
    );
    return statusOption ? statusOption.label : status || "Pending";
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
            label={getStatusLabel(order.orderStatus)}
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
                          src={
                            item.product?.images?.[0]?.url ||
                            item.product?.images?.[0]
                          }
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
                            Quantity: <strong>{item.quantity}</strong> | Unit
                            Price: ৳{item.price}
                          </Typography>
                          {item.product?.category && (
                            <Chip
                              label={
                                typeof item.product.category === "object"
                                  ? item.product.category.name
                                  : item.product.category
                              }
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

          <Grid item xs={12} md={4}>
            <Box
              sx={{
                p: 3,
                height: "100%",
                bgcolor: "grey.50",
                borderLeft: { md: `1px solid ${theme.palette.divider}` },
              }}
            >
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

              <Paper
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: "background.paper",
                }}
              >
                {/* Title */}
                <Typography
                  variant="h6"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: theme.palette.primary.main,
                    mb: 2,
                    fontWeight: 600,
                  }}
                >
                  <Update sx={{ mr: 1 }} />
                  Update Status
                </Typography>

                {/* Status Select */}
                <TextField
                  select
                  fullWidth
                  value={status}
                  onChange={handleStatusChange}
                  size="small"
                  sx={{ mb: 2 }}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            color: `${option.color}.main`,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {option.icon}
                        </Box>
                        <Typography variant="body2">{option.label}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>

                {/* Action Button */}
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    height: 44,
                    fontWeight: 600,
                    textTransform: "none",
                  }}
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

// ProductDialog Component
const ProductDialog = ({ open, onClose, onSubmit, product, categories }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    featured: false,
    images: [],
  });
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const videoRef = React.useRef(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        stock: product.stock || "",
        category: product.category?.name || product.category || "",
        featured: product.featured || false,
        images: product.images || [],
      });
      if (product.images && product.images.length > 0) {
        const existingImages = product.images.map((img) =>
          typeof img === "string" ? { url: img, publicId: "" } : img
        );
        setUploadedImages(existingImages);
      }
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        featured: false,
        images: [],
      });
      setUploadedImages([]);
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const formDataToUpload = new FormData();
      formDataToUpload.append("image", file);

      const response = await axios.post(
        "/api/upload/product",
        formDataToUpload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        const newImage = {
          url: response.data.imageUrl,
          publicId: response.data.publicId,
        };
        setUploadedImages((prev) => [...prev, newImage]);
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, newImage],
        }));
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (index) => {
    const imageToRemove = uploadedImages[index];

    if (imageToRemove.publicId) {
      try {
        const publicIdEncoded = imageToRemove.publicId.replace(/\//g, "--");
        await axios.delete(`/api/upload/delete/${publicIdEncoded}`);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));
  };

  const handleSubmit = () => {
    const dataToSubmit = {
      ...formData,
      images: uploadedImages.length > 0 ? uploadedImages : formData.images,
    };
    onSubmit(dataToSubmit);
  };

  const startScanning = async () => {
    setScannerActive(true);
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        scanQRCode();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions.");
      setScannerActive(false);
      setIsScanning(false);
    }
  };

  const scanQRCode = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const scanInterval = setInterval(() => {
      if (!isScanning || !videoRef.current) {
        clearInterval(scanInterval);
        return;
      }

      const video = videoRef.current;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          stopScanning();

          // ✅ CASE 1: JSON QR
          try {
            const data = JSON.parse(code.data);
            setFormData((prev) => ({
              ...prev,
              name: data.name || prev.name,
              price: data.price || prev.price,
              stock: data.stock || prev.stock,
              category: data.category || prev.category,
              description: data.description || prev.description,
            }));
            alert("Product data loaded from QR!");
            return;
          } catch (e) {}

          // ✅ CASE 2: URL QR
          if (code.data.startsWith("http")) {
            alert("QR contains product link:\n" + code.data);
            setFormData((prev) => ({
              ...prev,
              description: `Imported from QR: ${code.data}`,
            }));
          }
        }
      }
    }, 500);
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    setScannerActive(false);
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
        {scannerActive && (
          <Box
            sx={{
              mb: 3,
              position: "relative",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              style={{
                width: "100%",
                height: "300px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "2px solid #1976d2",
              }}
            />
            <Button
              variant="contained"
              color="error"
              onClick={stopScanning}
              sx={{ mt: 2, width: "100%" }}
            >
              Stop Scanning
            </Button>
          </Box>
        )}
        <Grid container spacing={2} sx={{ mt: scannerActive ? 1 : 1 }}>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                name="name"
                label="Product Name"
                fullWidth
                value={formData.name}
                onChange={handleChange}
                required
              />

              {!scannerActive && (
                <Button
                  variant="outlined"
                  startIcon={<QrCode />}
                  onClick={startScanning}
                  sx={{ height: "56px" }} // TextField height match
                >
                  Scan
                </Button>
              )}
            </Box>
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
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Product Images
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                disabled={uploading}
                fullWidth
                sx={{ mb: 2 }}
              >
                {uploading ? "Uploading..." : "Upload Image"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>

              {uploadedImages.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {uploadedImages.map((img, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: "relative",
                        width: 100,
                        height: 100,
                        borderRadius: 1,
                        overflow: "hidden",
                        border: "1px solid #ddd",
                      }}
                    >
                      <img
                        src={img.url || img}
                        alt={`Product ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveImage(index)}
                        sx={{
                          position: "absolute",
                          top: 2,
                          right: 2,
                          bgcolor: "rgba(255, 255, 255, 0.8)",
                          "&:hover": {
                            bgcolor: "rgba(255, 255, 255, 0.95)",
                          },
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
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

// CategoryDialog Component
const CategoryDialog = ({ open, onClose, onSubmit, category }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
    image: null,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        isActive: category.isActive !== undefined ? category.isActive : true,
        image: category.image || null,
      });
      if (category.image) {
        const img =
          typeof category.image === "string"
            ? { url: category.image, publicId: "" }
            : category.image;
        setUploadedImage(img);
      }
    } else {
      setFormData({
        name: "",
        description: "",
        isActive: true,
        image: null,
      });
      setUploadedImage(null);
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert("Image size should be less than 3MB");
      return;
    }

    setUploading(true);
    try {
      const formDataToUpload = new FormData();
      formDataToUpload.append("image", file);

      const response = await axios.post(
        "/api/upload/category",
        formDataToUpload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        const newImage = {
          url: response.data.imageUrl,
          publicId: response.data.publicId,
        };
        setUploadedImage(newImage);
        setFormData((prev) => ({
          ...prev,
          image: newImage,
        }));
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (uploadedImage && uploadedImage.publicId) {
      try {
        const publicIdEncoded = uploadedImage.publicId.replace(/\//g, "--");
        await axios.delete(`/api/upload/delete/${publicIdEncoded}`);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    setUploadedImage(null);
    setFormData((prev) => ({
      ...prev,
      image: null,
    }));
  };

  const handleSubmit = () => {
    const dataToSubmit = {
      ...formData,
      image: uploadedImage || formData.image,
    };
    onSubmit(dataToSubmit);
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
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Category Image (Optional)
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                disabled={uploading}
                fullWidth
                sx={{ mb: 2 }}
              >
                {uploading ? "Uploading..." : "Upload Image"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>

              {uploadedImage && (
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    maxWidth: 200,
                    height: 150,
                    borderRadius: 1,
                    overflow: "hidden",
                    border: "1px solid #ddd",
                    mx: "auto",
                  }}
                >
                  <img
                    src={uploadedImage.url || uploadedImage}
                    alt="Category"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={handleRemoveImage}
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      bgcolor: "rgba(255, 255, 255, 0.8)",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.95)",
                      },
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
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

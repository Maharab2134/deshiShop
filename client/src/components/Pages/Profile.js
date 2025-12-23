import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  Paper,
  Chip,
  Switch,
  FormControlLabel,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  Slide,
  Zoom,
  Skeleton,
} from "@mui/material";
import {
  Edit,
  CameraAlt,
  Security,
  History,
  Person,
  Lock,
  Notifications,
  Payment,
  LocationOn,
  CheckCircle,
  LocalShipping,
  Star,
  Link,
} from "@mui/icons-material";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        bio: user.bio || "",
      });
      // Fetch mock orders for demonstration
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("/api/orders/my-orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put("/api/users/profile", profileData);
      updateUser(response.data);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: "Error updating profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "success";
      case "Shipped":
        return "info";
      case "Processing":
        return "warning";
      default:
        return "default";
    }
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
            <Person sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Please login to view your profile
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 800 }}
        >
          My Profile
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage your account settings and preferences
        </Typography>
      </Box>

      {/* Profile Overview Card */}
      <Slide direction="up" in={true} timeout={500}>
        <Paper
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.05
            )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            flexDirection={isMobile ? "column" : "row"}
            textAlign={isMobile ? "center" : "left"}
          >
            <Box
              sx={{
                position: "relative",
                mr: isMobile ? 0 : 3,
                mb: isMobile ? 2 : 0,
              }}
            >
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  fontSize: "2.5rem",
                  bgcolor: theme.palette.primary.main,
                  mb: 1,
                }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </Avatar>
              <IconButton
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  bgcolor: theme.palette.primary.main,
                  color: "white",
                  "&:hover": {
                    bgcolor: theme.palette.primary.dark,
                  },
                }}
                size="small"
              >
                <CameraAlt />
              </IconButton>
            </Box>
            <Box flexGrow={1}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                {user.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>
              <Chip
                icon={<Star />}
                label="Gold Member"
                color="warning"
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
            <Box>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setEditing(!editing)}
                sx={{ borderRadius: 2 }}
              >
                {editing ? "Cancel Edit" : "Edit Profile"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Slide>

      {/* Tabs Section */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            "& .MuiTab-root": {
              py: 2,
              fontSize: "1rem",
              fontWeight: 500,
              minHeight: 64,
            },
          }}
        >
          <Tab icon={<Person />} label="Profile" />
          <Tab icon={<History />} label="Orders" />
          <Tab icon={<Security />} label="Security" />
          <Tab icon={<Notifications />} label="Notifications" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {message.text && (
            <Zoom in={true} timeout={500}>
              <Alert severity={message.type} sx={{ mb: 3, borderRadius: 2 }}>
                {message.text}
              </Alert>
            </Zoom>
          )}

          {/* Profile Tab */}
          {activeTab === 0 && (
            <Fade in={true} timeout={500}>
              <Box>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        required
                        disabled={!editing}
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        required
                        disabled
                        sx={{ mb: 2 }}
                        InputProps={{
                          endAdornment: (
                            <CheckCircle color="success" sx={{ ml: 1 }} />
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        disabled={!editing}
                        sx={{ mb: 2 }}
                        InputProps={{
                          startAdornment: (
                            <Typography sx={{ mr: 1, color: "text.secondary" }}>
                              +88
                            </Typography>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Bio"
                        name="bio"
                        multiline
                        rows={3}
                        value={profileData.bio}
                        onChange={handleInputChange}
                        disabled={!editing}
                        placeholder="Tell us a little about yourself..."
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address"
                        name="address"
                        multiline
                        rows={3}
                        value={profileData.address}
                        onChange={handleInputChange}
                        disabled={!editing}
                        sx={{ mb: 2 }}
                        InputProps={{
                          startAdornment: (
                            <LocationOn color="action" sx={{ mr: 1 }} />
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>

                  {editing && (
                    <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{ borderRadius: 2, px: 4 }}
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setEditing(false)}
                        sx={{ borderRadius: 2 }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}
                </form>
              </Box>
            </Fade>
          )}

          {/* Orders Tab */}
          {activeTab === 1 && (
            <Fade in={true} timeout={500}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Order History
                </Typography>

                {orders.length === 0 ? (
                  <Box textAlign="center" py={6}>
                    <LocalShipping
                      sx={{
                        fontSize: 60,
                        color: "text.secondary",
                        mb: 2,
                        opacity: 0.5,
                      }}
                    />
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      No orders yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your order history will appear here once you make a
                      purchase.
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {orders.map((order) => (
                      <Grid item xs={12} key={order._id}>
                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            flexDirection={isMobile ? "column" : "row"}
                          >
                            <Box>
                              <Typography variant="h6" gutterBottom>
                                Order #{order._id.slice(-6).toUpperCase()}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Placed on{" "}
                                {new Date(order.createdAt).toLocaleDateString()}
                              </Typography>
                              <Typography variant="body2">
                                {order.items.length} item
                                {order.items.length > 1 ? "s" : ""} • ৳
                                {order.totalAmount?.toFixed(2)}
                              </Typography>
                            </Box>
                            <Box sx={{ mt: isMobile ? 2 : 0 }}>
                              <Chip
                                label={order.orderStatus || ""}
                                color={getStatusColor(order.orderStatus)}
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                              />
                            </Box>
                          </Box>
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{ mt: 2, borderRadius: 2 }}
                            onClick={() => navigate(`/order/${order._id}`)}
                          >
                            View Order Details
                          </Button>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </Fade>
          )}

          {/* Security Tab */}
          {activeTab === 2 && (
            <Fade in={true} timeout={500}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Security Settings
                </Typography>

                <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Change Password
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ mb: 2 }}
                  >
                    Update your password to keep your account secure
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        type="password"
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                  </Grid>

                  <Button
                    variant="contained"
                    startIcon={<Lock />}
                    sx={{ borderRadius: 2 }}
                  >
                    Update Password
                  </Button>
                </Paper>

                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Two-Factor Authentication
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ mb: 2 }}
                  >
                    Add an extra layer of security to your account
                  </Typography>

                  <FormControlLabel
                    control={<Switch checked={false} />}
                    label="Enable Two-Factor Authentication"
                  />
                </Paper>
              </Box>
            </Fade>
          )}

          {/* Notifications Tab */}
          {activeTab === 3 && (
            <Fade in={true} timeout={500}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Notification Preferences
                </Typography>

                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Box sx={{ mb: 3 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationsEnabled}
                          onChange={(e) =>
                            setNotificationsEnabled(e.target.checked)
                          }
                        />
                      }
                      label="Enable Notifications"
                    />
                    <Typography variant="body2" color="text.secondary">
                      Receive important updates about your orders and account
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={<Switch checked={true} />}
                      label="Order Updates"
                    />
                    <Typography variant="body2" color="text.secondary">
                      Get notified about your order status
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={<Switch checked={true} />}
                      label="Promotional Offers"
                    />
                    <Typography variant="body2" color="text.secondary">
                      Receive special offers and discounts
                    </Typography>
                  </Box>

                  <Box>
                    <FormControlLabel
                      control={<Switch checked={false} />}
                      label="Newsletter"
                    />
                    <Typography variant="body2" color="text.secondary">
                      Subscribe to our monthly newsletter
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Fade>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;

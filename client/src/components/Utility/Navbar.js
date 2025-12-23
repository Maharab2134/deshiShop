import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  alpha,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Container,
  Slide,
  useScrollTrigger,
  Fade,
} from "@mui/material";
import {
  ShoppingCart,
  Favorite,
  Menu as MenuIcon,
  Person,
  ExitToApp,
  Dashboard,
  AccountCircle,
  Close,
  Home,
  Category,
  Inventory,
  NewReleases,
} from "@mui/icons-material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { styled } from "@mui/system";
import axios from "axios";

// Styled components
const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "scrolled",
})(({ theme, scrolled }) => ({
  backgroundColor: scrolled
    ? alpha(theme.palette.background.paper, 0.95)
    : theme.palette.background.paper,
  color: theme.palette.text.primary,
  backdropFilter: scrolled ? "blur(10px)" : "none",
  boxShadow: scrolled ? theme.shadows[4] : theme.shadows[1],
  transition: "all 0.3s ease",
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  margin: theme.spacing(0, 0.5),
  position: "relative",
  overflow: "hidden",
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1, 2),
  fontWeight: 500,
  textTransform: "none",
  fontSize: "0.95rem",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "0%",
    height: "2px",
    backgroundColor: theme.palette.primary.main,
    transition: "width 0.3s ease",
  },
  "&:hover::after": {
    width: "80%",
  },
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    width: 280,
  },
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  textDecoration: "none",
}));

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Update wishlist count from localStorage
  useEffect(() => {
    const updateWishlistCount = () => {
      const wishlist = localStorage.getItem("wishlist");
      if (wishlist) {
        const items = JSON.parse(wishlist);
        setWishlistCount(items.length);
      } else {
        setWishlistCount(0);
      }
    };

    // Initial load
    updateWishlistCount();

    // Listen for wishlist updates
    window.addEventListener("wishlist-updated", updateWishlistCount);

    // Cleanup
    return () => {
      window.removeEventListener("wishlist-updated", updateWishlistCount);
    };
  }, []);

  // Update cart count from backend API
  useEffect(() => {
    const updateCartCount = async () => {
      if (user) {
        try {
          const response = await axios.get("/api/cart", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          const totalItems =
            response.data.items?.reduce(
              (sum, item) => sum + item.quantity,
              0
            ) || 0;
          setCartCount(totalItems);
        } catch (error) {
          console.error("Error fetching cart count:", error);
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };

    // Initial load
    updateCartCount();

    // Listen for cart updates
    window.addEventListener("cart-updated", updateCartCount);

    // Cleanup
    return () => {
      window.removeEventListener("cart-updated", updateCartCount);
    };
  }, [user]);

  // Handle scroll effect
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 10,
  });

  const handleLogout = () => {
    logout();
    navigate("/");
    setProfileAnchor(null);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchor(null);
  };

  // Menu items logic
  let menuItems = [];

  if (user && user.role === "admin") {
    menuItems = [
      { text: "Home", path: "/", icon: <Home /> },
      { text: "Products", path: "/products", icon: <Inventory /> },
      { text: "Dashboard", path: "/admin", icon: <Dashboard /> },
    ];
  } else {
    menuItems = [
      { text: "Home", path: "/", icon: <Home /> },
      { text: "Products", path: "/products", icon: <Inventory /> },
      { text: "New Arrivals", path: "/new-arrivals", icon: <NewReleases /> },
      { text: "Categories", path: "/categories", icon: <Category /> },
      ...(user
        ? [{ text: "Orders", path: "/my-orders", icon: <Inventory /> }]
        : []),
    ];
  }

  const drawer = (
    <Box sx={{ width: 280 }} role="presentation">
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <LogoText
          variant="h6"
          component={Link}
          to="/"
          sx={{ textDecoration: "none" }}
        >
          deshiShop
        </LogoText>
        <IconButton
          color="inherit"
          onClick={() => setDrawerOpen(false)}
          sx={{ color: theme.palette.text.primary }}
        >
          <Close />
        </IconButton>
      </Box>
      <List sx={{ py: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            onClick={() => setDrawerOpen(false)}
            selected={location.pathname === item.path}
            sx={{
              "&.Mui-selected": {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                borderRight: `3px solid ${theme.palette.primary.main}`,
              },
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
              },
              py: 1.5,
              px: 3,
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}

        <Divider sx={{ my: 1 }} />

        {user ? (
          <>
            <ListItem
              button
              component={Link}
              to="/profile"
              onClick={() => setDrawerOpen(false)}
              selected={location.pathname === "/profile"}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  borderRight: `3px solid ${theme.palette.primary.main}`,
                },
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
                py: 1.5,
                px: 3,
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem
              button
              onClick={handleLogout}
              sx={{
                py: 1.5,
                px: 3,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem
              button
              component={Link}
              to="/login"
              onClick={() => setDrawerOpen(false)}
              selected={location.pathname === "/login"}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  borderRight: `3px solid ${theme.palette.primary.main}`,
                },
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
                py: 1.5,
                px: 3,
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/register"
              onClick={() => setDrawerOpen(false)}
              selected={location.pathname === "/register"}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  borderRight: `3px solid ${theme.palette.primary.main}`,
                },
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
                py: 1.5,
                px: 3,
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                <Person />
              </ListItemIcon>
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <Slide appear={false} direction="down" in={!trigger}>
        <StyledAppBar position="sticky" scrolled={trigger ? "true" : undefined}>
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setDrawerOpen(true)}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <LogoText
              variant="h5"
              component={Link}
              to="/"
              sx={{
                flexGrow: { xs: 1, md: 0 },
                textDecoration: "none",
                mr: { md: 3 },
                display: "flex",
                alignItems: "center",
              }}
            >
              deshiShop
            </LogoText>

            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: "flex", ml: 3 }}>
                {menuItems.map((item) => (
                  <NavButton
                    key={item.text}
                    component={Link}
                    to={item.path}
                    sx={{ mx: 0.5 }}
                  >
                    {item.text}
                  </NavButton>
                ))}
              </Box>
            )}

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Only show wishlist/cart for non-admin users */}
              {user?.role !== "admin" && (
                <>
                  <IconButton
                    color="inherit"
                    component={Link}
                    to="/wishlist"
                    sx={{
                      borderRadius: 2,
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    <Badge badgeContent={wishlistCount} color="secondary">
                      <Favorite />
                    </Badge>
                  </IconButton>
                  <IconButton
                    color="inherit"
                    component={Link}
                    to="/cart"
                    sx={{
                      borderRadius: 2,
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    <Badge badgeContent={cartCount} color="secondary">
                      <ShoppingCart />
                    </Badge>
                  </IconButton>
                </>
              )}

              {user ? (
                <>
                  <IconButton
                    color="inherit"
                    onClick={handleProfileMenuOpen}
                    sx={{
                      ml: 0.5,
                      borderRadius: 2,
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: "primary.main",
                        fontSize: "0.9rem",
                        fontWeight: 500,
                      }}
                    >
                      {user.name ? (
                        user.name.charAt(0).toUpperCase()
                      ) : (
                        <Person />
                      )}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={profileAnchor}
                    open={Boolean(profileAnchor)}
                    onClose={handleProfileMenuClose}
                    PaperProps={{
                      sx: {
                        mt: 1.5,
                        minWidth: 200,
                        boxShadow: theme.shadows[3],
                        borderRadius: 2,
                        overflow: "hidden",
                      },
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  >
                    <MenuItem
                      onClick={handleProfileMenuClose}
                      component={Link}
                      to="/profile"
                    >
                      <AccountCircle
                        sx={{ mr: 1.5, color: theme.palette.text.secondary }}
                      />
                      Profile
                    </MenuItem>
                    {user.role === "admin" && (
                      <MenuItem
                        onClick={handleProfileMenuClose}
                        component={Link}
                        to="/admin"
                      >
                        <Dashboard
                          sx={{ mr: 1.5, color: theme.palette.text.secondary }}
                        />
                        Dashboard
                      </MenuItem>
                    )}
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <ExitToApp
                        sx={{ mr: 1.5, color: theme.palette.text.secondary }}
                      />
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <NavButton
                    component={Link}
                    to="/login"
                    variant="outlined"
                    sx={{
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      "&:hover": {
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    Login
                  </NavButton>
                  <NavButton
                    component={Link}
                    to="/register"
                    variant="contained"
                    sx={{
                      display: { xs: "none", sm: "inline-flex" },
                      boxShadow: "none",
                      "&:hover": {
                        boxShadow: theme.shadows[2],
                      },
                    }}
                  >
                    Register
                  </NavButton>
                </Box>
              )}
            </Box>
          </Toolbar>
        </StyledAppBar>
      </Slide>

      <StyledDrawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {drawer}
      </StyledDrawer>
    </>
  );
};

export default Navbar;

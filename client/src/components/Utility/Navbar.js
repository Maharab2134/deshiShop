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
  ListItemText,
  useMediaQuery,
  useTheme,
  alpha,
  InputBase,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Fade,
  Container,
} from "@mui/material";
import {
  ShoppingCart,
  Favorite,
  Menu as MenuIcon,
  Search,
  Person,
  ExitToApp,
  Dashboard,
  AccountCircle,
  Close,
} from "@mui/icons-material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { styled, keyframes } from "@mui/system";

// Custom animations
const slideDown = keyframes`
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(255,255,255,0.3); }
  50% { box-shadow: 0 0 20px rgba(255,255,255,0.5); }
  100% { box-shadow: 0 0 5px rgba(255,255,255,0.3); }
`;

// Styled components
const StyledAppBar = styled(AppBar)(({ theme, scrolled }) => ({
  backgroundColor: scrolled
    ? alpha(theme.palette.primary.main, 0.95)
    : theme.palette.primary.main,
  backdropFilter: scrolled ? "blur(10px)" : "none",
  boxShadow: scrolled ? theme.shadows[4] : "none",
  transition: "all 0.3s ease",
  animation: `${slideDown} 0.5s ease-out`,
}));

const SearchContainer = styled("div")(({ theme, focused }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  marginRight: theme.spacing(2),
  marginLeft: theme.spacing(2),
  width: "100%",
  maxWidth: "400px",
  transition: "all 0.3s ease",
  animation: focused ? `${glow} 2s infinite` : "none",
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: "inherit",
  margin: theme.spacing(0, 0.5),
  position: "relative",
  overflow: "hidden",
  borderRadius: theme.spacing(1),
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "0%",
    height: "2px",
    backgroundColor: theme.palette.common.white,
    transition: "width 0.3s ease",
  },
  "&:hover::after": {
    width: "100%",
  },
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.1),
  },
}));

const AnimatedBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    animation: `${pulse} 2s infinite`,
  },
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    backgroundColor: theme.palette.primary.main,
    color: "white",
    width: 280,
  },
}));

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Handle scroll effect
  const handleScroll = () => {
    setScrolled(window.scrollY > 10);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setProfileAnchor(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchFocused(false);
    }
  };

  const handleMobileSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    } else {
      // If no query, just navigate to products page
      navigate("/products");
    }
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
      { text: "Home", path: "/" },
      { text: "Products", path: "/products" },
      { text: "Dashboard", path: "/admin" },
    ];
  } else {
    menuItems = [
      { text: "Home", path: "/" },
      { text: "Products", path: "/products" },
      { text: "Categories", path: "/categories" },
      ...(user ? [{ text: "Orders", path: "/my-orders" }] : []),
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
        }}
      >
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ textDecoration: "none", color: "inherit" }}
        >
          deshiShop
        </Typography>
        <IconButton color="inherit" onClick={() => setDrawerOpen(false)}>
          <Close />
        </IconButton>
      </Box>
      <Divider sx={{ backgroundColor: alpha("#fff", 0.2) }} />
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
                backgroundColor: alpha(theme.palette.common.white, 0.1),
              },
              "&:hover": {
                backgroundColor: alpha(theme.palette.common.white, 0.05),
              },
            }}
          >
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
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
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                },
                "&:hover": {
                  backgroundColor: alpha(theme.palette.common.white, 0.05),
                },
              }}
            >
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
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
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                },
                "&:hover": {
                  backgroundColor: alpha(theme.palette.common.white, 0.05),
                },
              }}
            >
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
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                },
                "&:hover": {
                  backgroundColor: alpha(theme.palette.common.white, 0.05),
                },
              }}
            >
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <StyledAppBar position="fixed" scrolled={scrolled ? "true" : undefined}>
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

          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              flexGrow: { xs: 1, md: 0 },
              textDecoration: "none",
              color: "inherit",
              fontWeight: "bold",
              mr: { md: 3 },
              display: "flex",
              alignItems: "center",
            }}
          >
            deshiShop
          </Typography>

          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: "flex" }}>
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

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              style={{
                display: isMobile ? "none" : "flex",
                alignItems: "center",
              }}
            >
              <SearchContainer focused={searchFocused}>
                <SearchIconWrapper>
                  <Search />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </SearchContainer>
            </form>

            {/* Mobile search */}
            {isMobile && (
              <>
                <SearchContainer
                  focused={searchFocused}
                  sx={{ display: { xs: "flex", md: "none" } }}
                >
                  <SearchIconWrapper>
                    <Search />
                  </SearchIconWrapper>
                  <StyledInputBase
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                  />
                </SearchContainer>
                <IconButton color="inherit" onClick={handleMobileSearch}>
                  <Search />
                </IconButton>
              </>
            )}

            {/* Only show wishlist/cart for non-admin users */}
            {user?.role !== "admin" && (
              <>
                <IconButton color="inherit" component={Link} to="/wishlist">
                  <AnimatedBadge badgeContent={user?.wishlistCount || 0}>
                    <Favorite />
                  </AnimatedBadge>
                </IconButton>
                <IconButton color="inherit" component={Link} to="/cart">
                  <AnimatedBadge badgeContent={user?.cartCount || 0}>
                    <ShoppingCart />
                  </AnimatedBadge>
                </IconButton>
              </>
            )}

            {user ? (
              <>
                <IconButton
                  color="inherit"
                  onClick={handleProfileMenuOpen}
                  sx={{ ml: 0.5 }}
                >
                  <Avatar
                    sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}
                  >
                    {user.name ? user.name.charAt(0).toUpperCase() : <Person />}
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
                    },
                  }}
                >
                  <MenuItem
                    onClick={handleProfileMenuClose}
                    component={Link}
                    to="/profile"
                  >
                    <AccountCircle sx={{ mr: 1.5 }} /> Profile
                  </MenuItem>
                  {user.role === "admin" && (
                    <MenuItem
                      onClick={handleProfileMenuClose}
                      component={Link}
                      to="/admin"
                    >
                      <Dashboard sx={{ mr: 1.5 }} /> Dashboard
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>
                    <ExitToApp sx={{ mr: 1.5 }} /> Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: "flex" }}>
                <NavButton component={Link} to="/login">
                  Login
                </NavButton>
                <NavButton
                  component={Link}
                  to="/register"
                  sx={{ display: { xs: "none", sm: "inline-flex" } }}
                >
                  Register
                </NavButton>
              </Box>
            )}
          </Box>
        </Toolbar>
      </StyledAppBar>

      <StyledDrawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {drawer}
      </StyledDrawer>

      <Toolbar />
    </>
  );
};

export default Navbar;

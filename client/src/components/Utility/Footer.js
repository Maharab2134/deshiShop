import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  TextField,
  Button,
  Divider,
  Fade,
  Slide,
  Zoom,
  Grow,
  useScrollTrigger,
  Fab,
  alpha,
  InputAdornment,
} from "@mui/material";
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Phone,
  Email,
  LocationOn,
  KeyboardArrowUp,
  Send,
  WhatsApp,
  Telegram,
  YouTube,
  Pinterest,
} from "@mui/icons-material";
import { keyframes, styled } from "@mui/system";

// Custom animations
const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled components
const StyledFooter = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: "white",
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(4),
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.light})`,
  },
}));

const AnimatedIconButton = styled(IconButton)(({ theme }) => ({
  color: "white",
  backgroundColor: alpha(theme.palette.common.white, 0.1),
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(1),
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: theme.palette.secondary.main,
    transform: "translateY(-3px)",
    animation: `${floatAnimation} 2s infinite`,
  },
}));

const SubscribeButton = styled(Button)(({ theme }) => ({
  borderRadius: "0 8px 8px 0",
  padding: theme.spacing(1.5),
  minWidth: "auto",
  animation: `${pulseAnimation} 2s infinite`,
  "&:hover": {
    animation: "none",
    transform: "scale(1.05)",
  },
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: alpha(theme.palette.common.white, 0.8),
  display: "block",
  marginBottom: theme.spacing(1),
  transition: "all 0.2s ease",
  textDecoration: "none",
  position: "relative",
  width: "fit-content",
  "&:hover": {
    color: theme.palette.common.white,
    transform: "translateX(5px)",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: -2,
    left: 0,
    width: 0,
    height: "1px",
    backgroundColor: theme.palette.common.white,
    transition: "width 0.3s ease",
  },
  "&:hover::after": {
    width: "100%",
  },
}));

const ScrollTopFab = styled(Fab)(({ theme }) => ({
  position: "fixed",
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  zIndex: 1000,
  backgroundColor: theme.palette.secondary.main,
  color: "white",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: theme.palette.secondary.dark,
    transform: "translateY(-5px)",
  },
}));

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Show scroll-to-top button when scrolling down
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  useEffect(() => {
    setIsVisible(trigger);
  }, [trigger]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Thank you for subscribing with: ${email}`);
      setEmail("");
    }
  };

  const socialLinks = [
    { icon: <Facebook />, url: "https://facebook.com", color: "#1877F2" },
    { icon: <Twitter />, url: "https://twitter.com", color: "#1DA1F2" },
    { icon: <LinkedIn />, url: "https://linkedin.com", color: "#0A66C2" },
    { icon: <YouTube />, url: "https://youtube.com", color: "#FF0000" },
    { icon: <WhatsApp />, url: "https://wa.me", color: "#25D366" },
  ];

  const quickLinks = [
    { name: "Home", url: "/" },
    { name: "Products", url: "/products" },
    { name: "Categories", url: "/categories" },
    { name: "About Us", url: "/about" },
    { name: "Contact", url: "/contact" },
  ];

  const customerServiceLinks = [
    { name: "Help Center", url: "/help" },
    { name: "Returns & Refunds", url: "/returns" },
    { name: "Shipping Info", url: "/shipping" },
    { name: "Privacy Policy", url: "/privacy" },
    { name: "Terms of Service", url: "/terms" },
  ];

  return (
    <>
      <StyledFooter component="footer">
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Company Info */}
            <Grid item xs={12} md={4}>
              <Fade in={mounted} timeout={1000}>
                <Box>
                  <Typography
                    variant="h4"
                    gutterBottom
                    sx={{
                      fontWeight: "bold",
                      background: "linear-gradient(45deg, #fff, #e0e0e0)",
                      backgroundClip: "text",
                      textFillColor: "transparent",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    deshiShop
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    Your trusted local e-commerce platform. We bring the best
                    products to your doorstep with fast delivery and excellent
                    customer service.
                  </Typography>

                  <Box sx={{ mt: 3 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: "medium" }}
                    >
                      Subscribe to our newsletter
                    </Typography>
                    <Box
                      component="form"
                      onSubmit={handleSubscribe}
                      sx={{ display: "flex", mt: 1 }}
                    >
                      <TextField
                        placeholder="Your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        required
                        size="small"
                        sx={{
                          flexGrow: 1,
                          backgroundColor: alpha("#fff", 0.1),
                          borderRadius: "8px 0 0 8px",
                          "& .MuiOutlinedInput-root": {
                            color: "white",
                            "& fieldset": {
                              border: "none",
                            },
                            "&:hover fieldset": {
                              border: "none",
                            },
                            "&.Mui-focused fieldset": {
                              border: "none",
                            },
                          },
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end" >
                              <SubscribeButton
                                type="submit"
                                variant="contained"
                                color="secondary"
                              >
                                <Send />
                              </SubscribeButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Fade>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={12} sm={6} md={2}>
              <Slide in={mounted} timeout={800} direction="up">
                <Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: "medium" }}
                  >
                    Quick Links
                  </Typography>
                  {quickLinks.map((link, index) => (
                    <Grow
                      in={mounted}
                      timeout={500 + index * 100}
                      key={link.name}
                    >
                      <FooterLink href={link.url} variant="body2">
                        {link.name}
                      </FooterLink>
                    </Grow>
                  ))}
                </Box>
              </Slide>
            </Grid>

            {/* Customer Service */}
            <Grid item xs={12} sm={6} md={2}>
              <Slide in={mounted} timeout={1000} direction="up">
                <Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: "medium" }}
                  >
                    Customer Service
                  </Typography>
                  {customerServiceLinks.map((link, index) => (
                    <Grow
                      in={mounted}
                      timeout={600 + index * 100}
                      key={link.name}
                    >
                      <FooterLink href={link.url} variant="body2">
                        {link.name}
                      </FooterLink>
                    </Grow>
                  ))}
                </Box>
              </Slide>
            </Grid>

            {/* Contact Info */}
            <Grid item xs={12} md={4}>
              <Fade in={mounted} timeout={1200}>
                <Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: "medium" }}
                  >
                    Contact Info
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <LocationOn sx={{ mr: 1, color: "secondary.main" }} />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      123 Main Street, Dhaka, Bangladesh
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Phone sx={{ mr: 1, color: "secondary.main" }} />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      +880 1234 567890
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Email sx={{ mr: 1, color: "secondary.main" }} />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      info@deshishop.com
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: "medium" }}
                    >
                      Follow Us
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                      {socialLinks.map((social, index) => (
                        <Zoom
                          in={mounted}
                          timeout={800 + index * 100}
                          key={index}
                        >
                          <AnimatedIconButton
                            href={social.url}
                            target="_blank"
                            rel="noopener"
                            sx={{
                              "&:hover": { backgroundColor: social.color },
                            }}
                          >
                            {social.icon}
                          </AnimatedIconButton>
                        </Zoom>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Fade>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, backgroundColor: alpha("#fff", 0.2) }} />

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              pt: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{ opacity: 0.8, mb: { xs: 2, sm: 0 } }}
            >
              © {new Date().getFullYear()} DeshiShop. All rights reserved.
            </Typography>
            <Box sx={{ display: "flex" }}>
              <FooterLink href="/privacy" variant="body2" sx={{ mr: 2, mb: 0 }}>
                Privacy Policy
              </FooterLink>
              <FooterLink href="/terms" variant="body2" sx={{ mb: 0 }}>
                Terms of Service
              </FooterLink>
            </Box>
          </Box>
        </Container>
      </StyledFooter>

      {/* Scroll to top button */}
      <Zoom in={isVisible}>
        <ScrollTopFab
          size="medium"
          onClick={scrollToTop}
          aria-label="scroll back to top"
        >
          <KeyboardArrowUp />
        </ScrollTopFab>
      </Zoom>
    </>
  );
};

export default Footer;

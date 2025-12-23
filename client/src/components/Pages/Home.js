import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  alpha,
  Skeleton,
  Fade,
  Zoom,
  Slide,
  Grow,
  useScrollTrigger,
  Fab,
} from "@mui/material";
import { Link } from "react-router-dom";
import { getProductImage as getImageUrl } from "../../utils/imageHelper";
import { useAuth } from "../contexts/AuthContext";
import {
  LocalShipping,
  Payment,
  Star,
  FavoriteBorder,
  ShoppingCart,
  ArrowForward,
  Shield,
  KeyboardArrowUp,
  TrendingUp,
  Diversity3,
  Nature as Eco,
  ArrowBackIosNew,
  ArrowForwardIos,
  Lock,
} from "@mui/icons-material";
import { keyframes } from "@emotion/react";

// Floating animation for visual elements
const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Pulse animation for CTAs
const pulseAnimation = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(25, 118, 210, 0); }
  100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
`;

// Scroll to top component
function ScrollTop(props) {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = (event) => {
    const anchor = (event.target.ownerDocument || document).querySelector(
      "#back-to-top-anchor"
    );
    if (anchor) {
      anchor.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  return (
    <Zoom in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}
      >
        {children}
      </Box>
    </Zoom>
  );
}

const Home = () => {
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const getId = (p) =>
    typeof p?._id === "string" ? p._id : p?._id?._id || p?.id || "";
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [brandIndex, setBrandIndex] = useState(0);
  const [brandPaused, setBrandPaused] = useState(false);

  const slides = [
    {
      id: 1,
      title: "Big Savings on Electronics",
      subtitle: "Up to 40% off on top brands",
      image:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1470&auto=format&fit=crop",
      to: "/products?category=electronics",
      cta: "Shop Electronics",
      mobileImage:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "Handcrafted Local Goods",
      subtitle: "Discover unique items from local artisans",
      image:
        "https://images.unsplash.com/photo-1534614971-6be99a7a3ffd?q=80&w=1470&auto=format&fit=crop",
      to: "/products?tag=handcrafted",
      cta: "Explore Crafts",
      mobileImage:
        "https://images.unsplash.com/photo-1534614971-6be99a7a3ffd?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "Fashion For Every Season",
      subtitle: "Trending styles at friendly prices",
      image:
        "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=1470&auto=format&fit=crop",
      to: "/products?category=fashion",
      cta: "Browse Fashion",
      mobileImage:
        "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=800&auto=format&fit=crop",
    },
  ];

  useEffect(() => {
    setLoading(true);
    // Simulate API call with timeout
    setTimeout(() => {
      fetch("/api/products?limit=3")
        .then((res) => res.json())
        .then((data) => {
          setFeaturedProducts(data.products || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching products:", err);
          setLoading(false);
        });
    }, 1000);
  }, []);

  // Auto-rotate slider
  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [isPaused, slides.length]);

  // Brands carousel data
  const brands = [
    { name: "Daraz", logo: "https://via.placeholder.com/140x60?text=Daraz" },
    { name: "Walton", logo: "https://via.placeholder.com/140x60?text=Walton" },
    { name: "Bata", logo: "https://via.placeholder.com/140x60?text=Bata" },
    { name: "Aarong", logo: "https://via.placeholder.com/140x60?text=Aarong" },
    {
      name: "Samsung",
      logo: "https://via.placeholder.com/140x60?text=Samsung",
    },
    { name: "Huawei", logo: "https://via.placeholder.com/140x60?text=Huawei" },
    { name: "Sony", logo: "https://via.placeholder.com/140x60?text=Sony" },
    { name: "Pran", logo: "https://via.placeholder.com/140x60?text=Pran" },
  ];

  const getVisibleBrands = (start, count) => {
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(brands[(start + i) % brands.length]);
    }
    return result;
  };

  // Auto-rotate brands
  useEffect(() => {
    if (brandPaused) return;
    const id = setInterval(() => {
      setBrandIndex((p) => (p + 1) % brands.length);
    }, 3500);
    return () => clearInterval(id);
  }, [brandPaused, brands.length]);

  // Function to render star ratings
  const renderRating = (rating) => {
    return (
      <Box display="flex" alignItems="center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            sx={{
              color: star <= rating ? "#FFD700" : "#ddd",
              fontSize: "16px",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.2)",
              },
            }}
          />
        ))}
        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
          ({Math.floor(Math.random() * 100)})
        </Typography>
      </Box>
    );
  };

  // Function to get product image with fallback
  const getProductImage = (product) => {
    const imageUrl = getImageUrl(product);
    if (imageUrl) return imageUrl;
    return `https://source.unsplash.com/random/300x300/?product,${
      product.name || "shopping"
    }`;
  };

  return (
    <>
      {/* Anchor for scroll to top */}
      <Box id="back-to-top-anchor" />

      {/* Hero Section - Modern Design */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${
            theme.palette.primary.main
          } 0%, ${alpha(theme.palette.primary.dark, 0.9)} 100%)`,
          color: "white",
          py: { xs: 6, md: 12 },
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
            zIndex: 0,
          },
        }}
      >
        {/* Animated floating shapes */}
        <Box
          sx={{
            position: "absolute",
            top: "10%",
            left: "5%",
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: alpha("#fff", 0.1),
            animation: `${floatAnimation} 6s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "20%",
            right: "10%",
            width: 30,
            height: 30,
            borderRadius: "50%",
            backgroundColor: alpha("#fff", 0.15),
            animation: `${floatAnimation} 5s ease-in-out infinite 1s`,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "15%",
            left: "15%",
            width: 25,
            height: 25,
            borderRadius: "50%",
            backgroundColor: alpha("#fff", 0.1),
            animation: `${floatAnimation} 7s ease-in-out infinite 0.5s`,
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container alignItems="center" spacing={4}>
            <Grid item xs={12} md={6}>
              <Fade in timeout={1000}>
                <Box>
                  <Chip
                    label="Bangladesh's Premier Marketplace"
                    sx={{
                      backgroundColor: alpha("#fff", 0.2),
                      color: "white",
                      mb: 2,
                      fontWeight: 500,
                      animation: `${pulseAnimation} 2s infinite`,
                    }}
                  />
                  <Typography
                    variant={isMobile ? "h3" : "h2"}
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 800,
                      lineHeight: 1.2,
                      textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    Discover Amazing{" "}
                    <Box
                      component="span"
                      sx={{
                        background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
                        backgroundClip: "text",
                        textFillColor: "transparent",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Local Products
                    </Box>
                  </Typography>
                  <Typography
                    variant={isMobile ? "body1" : "h6"}
                    sx={{
                      mb: 4,
                      opacity: 0.9,
                      fontWeight: 300,
                    }}
                  >
                    Shop from hundreds of Bangladeshi sellers with fast delivery
                    and secure payment options.
                  </Typography>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems={{ xs: "stretch", sm: "center" }}
                  >
                    <Button
                      variant="contained"
                      color="secondary"
                      size={isMobile ? "medium" : "large"}
                      component={Link}
                      to="/products"
                      endIcon={<ArrowForward />}
                      sx={{
                        borderRadius: 2,
                        py: isMobile ? 1 : 1.5,
                        fontWeight: 600,
                        boxShadow: `0 4px 12px ${alpha(
                          theme.palette.secondary.main,
                          0.4
                        )}`,
                        "&:hover": {
                          boxShadow: `0 6px 16px ${alpha(
                            theme.palette.secondary.main,
                            0.5
                          )}`,
                          transform: "translateY(-2px)",
                          transition: "transform 0.3s",
                        },
                        animation: `${pulseAnimation} 2s infinite`,
                      }}
                    >
                      Shop Now
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      size={isMobile ? "medium" : "large"}
                      component={Link}
                      to="/categories"
                      sx={{
                        borderRadius: 2,
                        py: isMobile ? 1 : 1.5,
                        fontWeight: 500,
                        borderWidth: 2,
                        "&:hover": {
                          borderWidth: 2,
                          backgroundColor: alpha("#fff", 0.1),
                          transform: "translateY(-2px)",
                          transition: "transform 0.3s",
                        },
                      }}
                    >
                      Browse Categories
                    </Button>
                  </Stack>
                </Box>
              </Fade>
            </Grid>
            {!isTablet && (
              <Grid item xs={12} md={6}>
                <Slide direction="left" in timeout={1000}>
                  <Box
                    sx={{
                      position: "relative",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: "-20px",
                        right: "-20px",
                        width: "100%",
                        height: "100%",
                        border: `2px solid ${alpha("#fff", 0.3)}`,
                        borderRadius: 4,
                        zIndex: 0,
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                      alt="Shopping experience"
                      sx={{
                        width: "100%",
                        height: "auto",
                        borderRadius: 4,
                        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                        position: "relative",
                        zIndex: 1,
                        transition: "transform 0.5s",
                        "&:hover": {
                          transform: "scale(1.02)",
                        },
                      }}
                    />
                  </Box>
                </Slide>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      {/* Promo Slider - Fixed for mobile and desktop */}
      <Container maxWidth="lg" sx={{ pt: isMobile ? 4 : 6 }}>
        <Box
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          sx={{
            position: "relative",
            borderRadius: { xs: 2, md: 3 },
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            height: { xs: 280, sm: 350, md: 400 },
            backgroundColor: "grey.100",
            width: "100%",
          }}
        >
          {slides.map((slide, index) => (
            <Fade
              in={index === currentSlide}
              timeout={500}
              key={slide.id}
              unmountOnExit
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                }}
              >
                {/* Background Image - Different images for mobile/desktop */}
                <Box
                  component="img"
                  src={
                    isMobile ? slide.mobileImage || slide.image : slide.image
                  }
                  alt={slide.title}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: isMobile ? "center" : "center",
                  }}
                />

                {/* Overlay for better text readability */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background: isMobile
                      ? `linear-gradient(to top, ${alpha(
                          theme.palette.common.black,
                          0.7
                        )} 0%, ${alpha(
                          theme.palette.common.black,
                          0.3
                        )} 50%, transparent 100%)`
                      : `linear-gradient(90deg, ${alpha(
                          theme.palette.common.black,
                          0.6
                        )} 0%, ${alpha(
                          theme.palette.common.black,
                          0.2
                        )} 60%, transparent 100%)`,
                  }}
                />

                {/* Content */}
                <Container
                  maxWidth="lg"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: isMobile ? "flex-end" : "center",
                    pb: isMobile ? 4 : 0,
                  }}
                >
                  <Grid container sx={{ height: "100%" }}>
                    <Grid item xs={12} md={isMobile ? 12 : 7}>
                      <Box
                        sx={{
                          color: "white",
                          p: isMobile ? 3 : 4,
                          textAlign: isMobile ? "center" : "left",
                        }}
                      >
                        <Typography
                          variant={isMobile ? "h5" : "h3"}
                          sx={{
                            fontWeight: 700,
                            mb: 1,
                            textShadow: "0 2px 6px rgba(0,0,0,0.4)",
                            fontSize: {
                              xs: "1.5rem",
                              sm: "2rem",
                              md: "2.5rem",
                            },
                          }}
                        >
                          {slide.title}
                        </Typography>
                        <Typography
                          variant={isMobile ? "body1" : "h6"}
                          sx={{
                            opacity: 0.9,
                            mb: isMobile ? 2 : 3,
                            fontSize: {
                              xs: "0.875rem",
                              sm: "1rem",
                              md: "1.25rem",
                            },
                          }}
                        >
                          {slide.subtitle}
                        </Typography>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={isMobile ? 1.5 : 2}
                          justifyContent={isMobile ? "center" : "flex-start"}
                        >
                          <Button
                            variant="contained"
                            color="secondary"
                            component={Link}
                            to={slide.to}
                            endIcon={<ArrowForward />}
                            size={isMobile ? "medium" : "large"}
                            sx={{
                              borderRadius: 2,
                              px: isMobile ? 2 : 3,
                              py: isMobile ? 0.75 : 1,
                              fontWeight: 600,
                              minWidth: isMobile ? "140px" : "auto",
                            }}
                          >
                            {slide.cta}
                          </Button>
                          <Button
                            variant="outlined"
                            color="inherit"
                            component={Link}
                            to="/products"
                            size={isMobile ? "medium" : "large"}
                            sx={{
                              borderWidth: 2,
                              minWidth: isMobile ? "140px" : "auto",
                            }}
                          >
                            View All
                          </Button>
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>
                </Container>
              </Box>
            </Fade>
          ))}

          {/* Navigation Arrows */}
          {!isMobile && (
            <>
              <IconButton
                aria-label="previous"
                onClick={() =>
                  setCurrentSlide(
                    (prev) => (prev - 1 + slides.length) % slides.length
                  )
                }
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: 12,
                  transform: "translateY(-50%)",
                  backgroundColor: alpha("#000", 0.5),
                  color: "white",
                  "&:hover": {
                    backgroundColor: alpha("#000", 0.8),
                    transform: "translateY(-50%) scale(1.1)",
                  },
                  transition: "all 0.3s",
                  zIndex: 10,
                }}
              >
                <ArrowBackIosNew />
              </IconButton>
              <IconButton
                aria-label="next"
                onClick={() =>
                  setCurrentSlide((prev) => (prev + 1) % slides.length)
                }
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: 12,
                  transform: "translateY(-50%)",
                  backgroundColor: alpha("#000", 0.5),
                  color: "white",
                  "&:hover": {
                    backgroundColor: alpha("#000", 0.8),
                    transform: "translateY(-50%) scale(1.1)",
                  },
                  transition: "all 0.3s",
                  zIndex: 10,
                }}
              >
                <ArrowForwardIos />
              </IconButton>
            </>
          )}

          {/* Dots Indicator */}
          <Box
            sx={{
              position: "absolute",
              bottom: isMobile ? 12 : 16,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: isMobile ? 1 : 1.5,
              zIndex: 10,
            }}
          >
            {slides.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentSlide(index)}
                sx={{
                  width:
                    index === currentSlide
                      ? isMobile
                        ? 20
                        : 24
                      : isMobile
                      ? 8
                      : 12,
                  height: isMobile ? 8 : 10,
                  borderRadius: isMobile ? 4 : 5,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  backgroundColor:
                    index === currentSlide
                      ? theme.palette.secondary.main
                      : alpha("#fff", 0.5),
                  "&:hover": {
                    backgroundColor:
                      index === currentSlide
                        ? theme.palette.secondary.dark
                        : alpha("#fff", 0.8),
                  },
                }}
              />
            ))}
          </Box>

          {/* Mobile Swipe Indicator */}
          {isMobile && (
            <Box
              sx={{
                position: "absolute",
                bottom: 4,
                left: "50%",
                transform: "translateX(-50%)",
                color: alpha("#fff", 0.7),
                fontSize: "0.75rem",
                zIndex: 10,
              }}
            >
              Swipe to navigate
            </Box>
          )}
        </Box>
      </Container>

      {/* Featured Products */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Box textAlign="center" sx={{ mb: { xs: 4, md: 6 } }}>
          <Fade in timeout={800}>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 700,
                position: "relative",
                display: "inline-block",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 60,
                  height: 4,
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: 2,
                },
              }}
            >
              Featured Products
            </Typography>
          </Fade>
          <Fade in timeout={1000}>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mt: 2,
                maxWidth: 600,
                mx: "auto",
                px: isMobile ? 2 : 0,
              }}
            >
              Discover our most popular and trending products from local sellers
            </Typography>
          </Fade>
        </Box>

        <Grid container spacing={isMobile ? 2 : 3}>
          {loading
            ? // Show skeleton loaders while loading
              Array.from(new Array(3)).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Grow in timeout={500 + index * 200}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      }}
                    >
                      <Skeleton
                        variant="rectangular"
                        height={isMobile ? 160 : 200}
                        animation="wave"
                      />
                      <CardContent sx={{ flexGrow: 1, p: isMobile ? 2 : 3 }}>
                        <Skeleton animation="wave" height={30} width="80%" />
                        <Skeleton animation="wave" height={20} width="40%" />
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mt: 2,
                          }}
                        >
                          <Skeleton animation="wave" height={30} width="40%" />
                          <Skeleton animation="wave" height={30} width="40%" />
                        </Box>
                      </CardContent>
                      <Box sx={{ p: isMobile ? 2 : 3, pt: 0 }}>
                        <Skeleton
                          animation="wave"
                          height={isMobile ? 40 : 45}
                          sx={{ borderRadius: 2 }}
                        />
                      </Box>
                    </Card>
                  </Grow>
                </Grid>
              ))
            : // Show actual products when loaded
              featuredProducts.map((product, index) => (
                <Grid item xs={12} sm={6} md={4} key={product._id}>
                  <Grow in timeout={500 + index * 200}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: { xs: 2, md: 3 },
                        overflow: "hidden",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        transition: "transform 0.3s, box-shadow 0.3s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
                        },
                      }}
                    >
                      <Box sx={{ position: "relative", overflow: "hidden" }}>
                        <CardMedia
                          component="img"
                          height={isMobile ? 160 : 200}
                          image={getProductImage(product)}
                          alt={product.name}
                          sx={{
                            objectFit: "contain",
                            p: isMobile ? 1 : 2,
                            backgroundColor: "#f9f9f9",
                            transition: "transform 0.5s ease",
                            "&:hover": {
                              transform: "scale(1.05)",
                            },
                          }}
                          onError={(e) => {
                            e.target.src = `https://source.unsplash.com/random/300x300/?product,${
                              product.name || "shopping"
                            }`;
                          }}
                        />
                        <IconButton
                          size={isMobile ? "small" : "medium"}
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            backgroundColor: alpha("#fff", 0.9),
                            transition: "transform 0.3s, background-color 0.3s",
                            "&:hover": {
                              backgroundColor: "#fff",
                              transform: "scale(1.1)",
                            },
                          }}
                        >
                          <FavoriteBorder
                            fontSize={isMobile ? "small" : "medium"}
                          />
                        </IconButton>
                        {product.isNew && (
                          <Chip
                            label="New"
                            color="secondary"
                            size={isMobile ? "small" : "medium"}
                            sx={{
                              position: "absolute",
                              top: 8,
                              left: 8,
                              fontWeight: 600,
                              fontSize: isMobile ? "0.7rem" : "0.8rem",
                            }}
                          />
                        )}
                      </Box>
                      <CardContent sx={{ flexGrow: 1, p: isMobile ? 2 : 3 }}>
                        <Typography
                          variant={isMobile ? "subtitle1" : "h6"}
                          component="h3"
                          gutterBottom
                          sx={{
                            fontWeight: 600,
                            fontSize: isMobile ? "1rem" : "1.25rem",
                          }}
                        >
                          {product.name}
                        </Typography>
                        {renderRating(4)}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mt: 2,
                          }}
                        >
                          <Typography
                            variant={isMobile ? "h6" : "h5"}
                            color="primary"
                            sx={{ fontWeight: 700 }}
                          >
                            ৳{product.price}
                          </Typography>
                        </Box>
                      </CardContent>
                      <Box sx={{ p: isMobile ? 2 : 3, pt: 0 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          component={!user ? "button" : Link}
                          to={user ? `/products/${getId(product)}` : undefined}
                          disabled={!user}
                          startIcon={!user ? <Lock /> : <ShoppingCart />}
                          size={isMobile ? "medium" : "large"}
                          sx={{
                            borderRadius: 2,
                            py: isMobile ? 0.75 : 1.2,
                            fontWeight: 600,
                            fontSize: isMobile ? "0.875rem" : "1rem",
                            transition: "all 0.3s",
                            "&:hover": {
                              transform: !user ? "none" : "translateY(-2px)",
                              boxShadow: !user
                                ? "none"
                                : `0 6px 12px ${alpha(
                                    theme.palette.primary.main,
                                    0.3
                                  )}`,
                            },
                          }}
                        >
                          {!user ? "Login to View" : "View Details"}
                        </Button>
                      </Box>
                    </Card>
                  </Grow>
                </Grid>
              ))}
        </Grid>

        <Box sx={{ textAlign: "center", mt: { xs: 4, md: 6 } }}>
          <Fade in timeout={1000}>
            <Button
              variant="outlined"
              size={isMobile ? "medium" : "large"}
              component={Link}
              to="/products"
              endIcon={<ArrowForward />}
              sx={{
                borderRadius: 2,
                px: isMobile ? 3 : 4,
                py: isMobile ? 0.75 : 1.2,
                fontWeight: 600,
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                  transform: "translateY(-2px)",
                  transition: "transform 0.3s",
                },
              }}
            >
              View All Products
            </Button>
          </Fade>
        </Box>
      </Container>

      {/* Features Section */}
      <Box
        sx={{
          bgcolor: "grey.50",
          py: { xs: 6, md: 8 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: { xs: 4, md: 6 } }}>
            <Fade in timeout={800}>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                component="h2"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  position: "relative",
                  display: "inline-block",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: -8,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 60,
                    height: 4,
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: 2,
                  },
                }}
              >
                Why Choose DeshiShop?
              </Typography>
            </Fade>
            <Fade in timeout={1000}>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  mt: 2,
                  maxWidth: 600,
                  mx: "auto",
                  px: isMobile ? 2 : 0,
                }}
              >
                We're committed to providing the best shopping experience for
                our customers
              </Typography>
            </Fade>
          </Box>

          <Grid container spacing={isMobile ? 2 : 4}>
            {[
              {
                icon: <LocalShipping sx={{ fontSize: { xs: 32, md: 40 } }} />,
                title: "Fast Delivery",
                description:
                  "Quick and reliable delivery across all districts of Bangladesh within 2-5 business days",
                color: theme.palette.primary.main,
              },
              {
                icon: <Payment sx={{ fontSize: { xs: 32, md: 40 } }} />,
                title: "Secure Payment",
                description:
                  "Multiple secure payment options including bKash, Nagad, credit cards, and cash on delivery",
                color: theme.palette.success.main,
              },
              {
                icon: <Shield sx={{ fontSize: { xs: 32, md: 40 } }} />,
                title: "Quality Guarantee",
                description:
                  "Curated selection of quality local products with 7-day return policy for your peace of mind",
                color: theme.palette.warning.main,
              },
              {
                icon: <TrendingUp sx={{ fontSize: { xs: 32, md: 40 } }} />,
                title: "Trending Products",
                description:
                  "Stay updated with the latest trends and best-selling products in the market",
                color: theme.palette.info.main,
              },
              {
                icon: <Diversity3 sx={{ fontSize: { xs: 32, md: 40 } }} />,
                title: "Community Support",
                description:
                  "Support local businesses and contribute to the growth of Bangladesh's economy",
                color: theme.palette.secondary.main,
              },
              {
                icon: <Eco sx={{ fontSize: { xs: 32, md: 40 } }} />,
                title: "Eco-Friendly",
                description:
                  "Environmentally conscious packaging and sustainable product options available",
                color: theme.palette.success.main,
              },
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Fade in timeout={800 + index * 200}>
                  <Box
                    textAlign="center"
                    sx={{
                      px: 2,
                      py: isMobile ? 2 : 3,
                      borderRadius: 2,
                      transition: "transform 0.3s, box-shadow 0.3s",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        backgroundColor: "white",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: { xs: 64, md: 80 },
                        height: { xs: 64, md: 80 },
                        borderRadius: "50%",
                        backgroundColor: alpha(feature.color, 0.1),
                        color: feature.color,
                        mb: 2,
                        transition: "transform 0.3s",
                        "&:hover": {
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant={isMobile ? "subtitle1" : "h6"}
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Additional CTA Section */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: "white",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated background elements */}
        <Box
          sx={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            backgroundColor: alpha("#fff", 0.05),
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            backgroundColor: alpha("#fff", 0.03),
          }}
        />

        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <Fade in timeout={800}>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              component="h3"
              gutterBottom
              sx={{ fontWeight: 700, mb: 2 }}
            >
              Ready to Start Shopping?
            </Typography>
          </Fade>
          <Fade in timeout={1000}>
            <Typography
              variant={isMobile ? "body1" : "h6"}
              sx={{ mb: 4, opacity: 0.9, fontWeight: 300 }}
            >
              Join thousands of satisfied customers shopping on DeshiShop today
            </Typography>
          </Fade>
          <Fade in timeout={1200}>
            <Button
              variant="contained"
              color="secondary"
              size={isMobile ? "medium" : "large"}
              component={Link}
              to="/products"
              endIcon={<ArrowForward />}
              sx={{
                borderRadius: 2,
                px: isMobile ? 3 : 4,
                py: isMobile ? 1 : 1.5,
                fontWeight: 600,
                boxShadow: `0 4px 12px ${alpha("#000", 0.2)}`,
                "&:hover": {
                  boxShadow: `0 6px 16px ${alpha("#000", 0.3)}`,
                  transform: "translateY(-2px)",
                  transition: "transform 0.3s",
                },
                animation: `${pulseAnimation} 2s infinite`,
              }}
            >
              Explore Products
            </Button>
          </Fade>
        </Container>
      </Box>

      {/* Scroll to top button */}
      <ScrollTop>
        <Fab
          color="primary"
          size={isMobile ? "small" : "medium"}
          aria-label="scroll back to top"
        >
          <KeyboardArrowUp />
        </Fab>
      </ScrollTop>
    </>
  );
};

export default Home;

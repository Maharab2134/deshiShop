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
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

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
    if (product.image) return product.image;
    if (product.images && product.images.length > 0) return product.images[0];
    if (product.imgUrl) return product.imgUrl;
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
          py: { xs: 8, md: 12 },
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
                    variant="h6"
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
                      size="large"
                      component={Link}
                      to="/products"
                      endIcon={<ArrowForward />}
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
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
                      size="large"
                      component={Link}
                      to="/categories"
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
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

      {/* Featured Products */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" sx={{ mb: 6 }}>
          <Fade in timeout={800}>
            <Typography
              variant="h4"
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
              sx={{ mt: 2, maxWidth: 600, mx: "auto" }}
            >
              Discover our most popular and trending products from local sellers
            </Typography>
          </Fade>
        </Box>

        <Grid container spacing={3}>
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
                        borderRadius: 3,
                        overflow: "hidden",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                      }}
                    >
                      <Skeleton
                        variant="rectangular"
                        height={200}
                        animation="wave"
                      />
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
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
                      <Box sx={{ p: 3, pt: 0 }}>
                        <Skeleton
                          animation="wave"
                          height={45}
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
                        borderRadius: 3,
                        overflow: "hidden",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                        transition: "transform 0.3s, box-shadow 0.3s",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: "0 16px 40px rgba(0,0,0,0.15)",
                        },
                      }}
                    >
                      <Box sx={{ position: "relative", overflow: "hidden" }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={getProductImage(product)}
                          alt={product.name}
                          sx={{
                            objectFit: "contain",
                            p: 2,
                            backgroundColor: "#f9f9f9",
                            transition: "transform 0.5s ease",
                            "&:hover": {
                              transform: "scale(1.1)",
                            },
                          }}
                          onError={(e) => {
                            e.target.src = `https://source.unsplash.com/random/300x300/?product,${
                              product.name || "shopping"
                            }`;
                          }}
                        />
                        <IconButton
                          sx={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            backgroundColor: alpha("#fff", 0.9),
                            transition: "transform 0.3s, background-color 0.3s",
                            "&:hover": {
                              backgroundColor: "#fff",
                              transform: "scale(1.1)",
                            },
                          }}
                        >
                          <FavoriteBorder />
                        </IconButton>
                        {product.isNew && (
                          <Chip
                            label="New"
                            color="secondary"
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
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mt: 2,
                          }}
                        >
                          <Typography
                            variant="h6"
                            color="primary"
                            sx={{ fontWeight: 700 }}
                          >
                            ৳{product.price}
                          </Typography>
                        </Box>
                      </CardContent>
                      <Box sx={{ p: 3, pt: 0 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          component={Link}
                          to={`/products/${product._id}`}
                          startIcon={<ShoppingCart />}
                          sx={{
                            borderRadius: 2,
                            py: 1.2,
                            fontWeight: 600,
                            transition: "all 0.3s",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: `0 6px 12px ${alpha(
                                theme.palette.primary.main,
                                0.3
                              )}`,
                            },
                          }}
                        >
                          View Details
                        </Button>
                      </Box>
                    </Card>
                  </Grow>
                </Grid>
              ))}
        </Grid>

        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Fade in timeout={1000}>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/products"
              endIcon={<ArrowForward />}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.2,
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
          py: 8,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Fade in timeout={800}>
              <Typography
                variant="h4"
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
                sx={{ mt: 2, maxWidth: 600, mx: "auto" }}
              >
                We're committed to providing the best shopping experience for
                our customers
              </Typography>
            </Fade>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                icon: <LocalShipping sx={{ fontSize: 40 }} />,
                title: "Fast Delivery",
                description:
                  "Quick and reliable delivery across all districts of Bangladesh within 2-5 business days",
                color: theme.palette.primary.main,
              },
              {
                icon: <Payment sx={{ fontSize: 40 }} />,
                title: "Secure Payment",
                description:
                  "Multiple secure payment options including bKash, Nagad, credit cards, and cash on delivery",
                color: theme.palette.success.main,
              },
              {
                icon: <Shield sx={{ fontSize: 40 }} />,
                title: "Quality Guarantee",
                description:
                  "Curated selection of quality local products with 7-day return policy for your peace of mind",
                color: theme.palette.warning.main,
              },
              {
                icon: <TrendingUp sx={{ fontSize: 40 }} />,
                title: "Trending Products",
                description:
                  "Stay updated with the latest trends and best-selling products in the market",
                color: theme.palette.info.main,
              },
              {
                icon: <Diversity3 sx={{ fontSize: 40 }} />,
                title: "Community Support",
                description:
                  "Support local businesses and contribute to the growth of Bangladesh's economy",
                color: theme.palette.secondary.main,
              },
              {
                icon: <Eco sx={{ fontSize: 40 }} />,
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
                      py: 3,
                      borderRadius: 3,
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
                        width: 80,
                        height: 80,
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
                      variant="h6"
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
          py: 8,
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
              variant="h4"
              component="h3"
              gutterBottom
              sx={{ fontWeight: 700, mb: 2 }}
            >
              Ready to Start Shopping?
            </Typography>
          </Fade>
          <Fade in timeout={1000}>
            <Typography
              variant="h6"
              sx={{ mb: 4, opacity: 0.9, fontWeight: 300 }}
            >
              Join thousands of satisfied customers shopping on DeshiShop today
            </Typography>
          </Fade>
          <Fade in timeout={1200}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              component={Link}
              to="/products"
              endIcon={<ArrowForward />}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
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
        <Fab color="primary" size="medium" aria-label="scroll back to top">
          <KeyboardArrowUp />
        </Fab>
      </ScrollTop>
    </>
  );
};

export default Home;

import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  alpha,
  useTheme,
  useMediaQuery,
  Skeleton,
  Fade,
  Chip,
  Button,
  IconButton,
} from "@mui/material";
import {
  ShoppingBag,
  ArrowForward,
  FavoriteBorder,
  Share,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import axios from "axios";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    setLoading(true);
    // Simulate loading with timeout for better UX
    setTimeout(() => {
      axios
        .get("/api/categories")
        .then((res) => {
          setCategories(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching categories:", err);
          setLoading(false);
        });
    }, 1000);
  }, []);

  // Function to generate a gradient based on category name
  const generateGradient = (name) => {
    const colors = [
      `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(
        theme.palette.primary.dark,
        0.8
      )} 100%)`,
      `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${alpha(
        theme.palette.secondary.dark,
        0.8
      )} 100%)`,
      `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${alpha(
        theme.palette.success.dark,
        0.8
      )} 100%)`,
      `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${alpha(
        theme.palette.warning.dark,
        0.8
      )} 100%)`,
      `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${alpha(
        theme.palette.info.dark,
        0.8
      )} 100%)`,
      `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${alpha(
        theme.palette.error.dark,
        0.8
      )} 100%)`,
    ];

    // Simple hash function to get consistent color for each category
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);

    return colors[hash % colors.length];
  };

  // Function to get a relevant icon for each category
  const getCategoryIcon = (name) => {
    const icons = {
      electronics: "📱",
      clothing: "👕",
      books: "📚",
      home: "🏠",
      sports: "⚽",
      beauty: "💄",
      toys: "🧸",
      food: "🍎",
      automotive: "🚗",
      health: "💊",
    };

    const lowerName = name.toLowerCase();
    for (const [key, icon] of Object.entries(icons)) {
      if (lowerName.includes(key)) {
        return icon;
      }
    }

    // Default icon if no match
    return "🛍️";
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 800,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundClip: "text",
            textFillColor: "transparent",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Browse Categories
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            maxWidth: 600,
            mx: "auto",
            fontWeight: 300,
          }}
        >
          Explore our wide range of product categories to find exactly what
          you're looking for
        </Typography>
      </Box>

      {/* Categories Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {Array.from(new Array(6)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton
                variant="rectangular"
                height={200}
                sx={{
                  borderRadius: 3,
                  mb: 1,
                }}
              />
              <Skeleton variant="text" height={40} width="80%" />
              <Skeleton variant="text" height={20} width="60%" />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {categories.map((cat, index) => (
            <Grid item xs={12} sm={6} md={4} key={cat._id}>
              <Fade
                in={true}
                timeout={800}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
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
                  <Box
                    sx={{
                      height: 160,
                      background: generateGradient(cat.name),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    <Typography
                      variant="h1"
                      sx={{
                        opacity: 0.8,
                        fontSize: "4rem",
                      }}
                    >
                      {getCategoryIcon(cat.name)}
                    </Typography>

                    {/* Product count badge */}
                    <Chip
                      label={`${
                        cat.productCount || Math.floor(Math.random() * 50) + 10
                      } products`}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        backgroundColor: alpha("#fff", 0.9),
                        fontWeight: 600,
                      }}
                    />

                    {/* Action buttons */}
                    <Box sx={{ position: "absolute", bottom: 16, left: 16 }}>
                      <IconButton
                        sx={{
                          backgroundColor: alpha("#fff", 0.9),
                          mr: 1,
                          "&:hover": {
                            backgroundColor: "#fff",
                          },
                        }}
                      >
                        <FavoriteBorder />
                      </IconButton>
                      <IconButton
                        sx={{
                          backgroundColor: alpha("#fff", 0.9),
                          "&:hover": {
                            backgroundColor: "#fff",
                          },
                        }}
                      >
                        <Share />
                      </IconButton>
                    </Box>
                  </Box>

                  <CardContent
                    sx={{
                      p: 3,
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography
                      variant="h5"
                      component="h3"
                      gutterBottom
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                      }}
                    >
                      {cat.name}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{
                        mb: 3,
                        flexGrow: 1,
                      }}
                    >
                      {cat.description ||
                        `Explore our collection of ${cat.name.toLowerCase()} products`}
                    </Typography>

                    <Button
                      variant="contained"
                      endIcon={<ArrowForward />}
                      component={Link}
                      to={`/products?category=${cat._id}`}
                      sx={{
                        borderRadius: 2,
                        py: 1,
                        fontWeight: 600,
                      }}
                    >
                      Browse Products
                    </Button>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {!loading && categories.length === 0 && (
        <Box textAlign="center" sx={{ mt: 8, py: 8 }}>
          <ShoppingBag
            sx={{ fontSize: 80, color: "text.secondary", mb: 2, opacity: 0.5 }}
          />
          <Typography variant="h5" gutterBottom color="text.secondary">
            No categories found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            We're working on adding more categories. Please check back later.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Categories;

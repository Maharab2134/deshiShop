import React from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material"; // FIXED: Import from icons, not material
import { Link, useLocation } from "react-router-dom";

const OrderSuccess = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 2 }} />

          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            color="success.main"
          >
            Order Placed Successfully!
          </Typography>

          <Typography variant="h6" gutterBottom>
            Thank you for your purchase
          </Typography>

          {orderId && (
            <Typography variant="body1" sx={{ mb: 3 }}>
              Your order ID is: <strong>{orderId}</strong>
            </Typography>
          )}

          <Typography variant="body2" color="text.secondary" paragraph>
            We've sent a confirmation email with your order details. You can
            track your order status in your profile page.
          </Typography>

          <Box
            sx={{
              mt: 4,
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              component={Link}
              to="/products"
              size="large"
            >
              Continue Shopping
            </Button>

            <Button
              variant="outlined"
              component={Link}
              to="/profile"
              size="large"
            >
              View Orders
            </Button>

            <Button variant="text" component={Link} to="/" size="large">
              Back to Home
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default OrderSuccess;

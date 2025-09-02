import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Link,
  Fade,
  Slide,
  Zoom,
  Divider,
  InputAdornment,
  IconButton,
  useTheme,
  alpha,
  styled
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  AccountCircle,
  ArrowBack,
  CheckCircle,
  Fingerprint
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

// Custom animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled components
const AnimatedContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  animation: `${fadeIn} 0.8s ease-out`,
}));

const AuthCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  boxShadow: theme.shadows[10],
  overflow: 'hidden',
  maxWidth: 500,
  width: '100%',
  background: theme.palette.background.paper,
}));

const GradientHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  padding: theme.spacing(4),
  textAlign: 'center',
  color: 'white',
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1.5),
  fontWeight: 'bold',
  fontSize: '1.1rem',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[6],
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1.5),
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
}));

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (success) {
    return (
      <AnimatedContainer>
        <Fade in={true} timeout={500}>
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <CheckCircle sx={{ fontSize: 80, mb: 2, animation: `${pulse} 2s infinite` }} />
            <Typography variant="h3" gutterBottom>
              Welcome to DeshiShop!
            </Typography>
            <Typography variant="h6">
              Your account has been created successfully
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Redirecting you to the homepage...
            </Typography>
          </Box>
        </Fade>
      </AnimatedContainer>
    );
  }

  return (
    <AnimatedContainer>
      <AuthCard>
        <GradientHeader>
          <Slide in={true} timeout={800} direction="down">
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <AccountCircle sx={{ fontSize: 60, animation: `${float} 3s ease-in-out infinite` }} />
              </Box>
              <Typography variant="h3" component="h1" fontWeight="700">
                Join DeshiShop
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
                Create your account and start shopping
              </Typography>
            </Box>
          </Slide>
        </GradientHeader>

        <CardContent sx={{ p: 4 }}>
          <Fade in={true} timeout={1000}>
            <Box>
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    animation: `${fadeIn} 0.5s ease-out`
                  }}
                >
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <StyledTextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Enter your full name"
                />
                
                <StyledTextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="your.email@example.com"
                />
                
                <StyledTextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  placeholder="At least 6 characters"
                />
                
                <StyledTextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  sx={{ mb: 4 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Fingerprint color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleToggleConfirmPassword}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Confirm your password"
                />

                <AnimatedButton
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    animation: loading ? `${pulse} 1s infinite` : 'none',
                    mb: 3,
                  }}
                  startIcon={!loading && <AccountCircle />}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </AnimatedButton>
              </form>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?
                </Typography>
              </Divider>

              <Zoom in={true} timeout={1200}>
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="outlined"
                    fullWidth
                    size="large"
                    sx={{ borderRadius: 2, mb: 2 }}
                    startIcon={<ArrowBack />}
                  >
                    Back to Login
                  </Button>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    By creating an account, you agree to our{' '}
                    <Link component={RouterLink} to="/terms" color="primary">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link component={RouterLink} to="/privacy" color="primary">
                      Privacy Policy
                    </Link>
                  </Typography>
                </Box>
              </Zoom>
            </Box>
          </Fade>
        </CardContent>
      </AuthCard>
    </AnimatedContainer>
  );
};

export default Register;
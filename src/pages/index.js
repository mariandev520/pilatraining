import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  InputAdornment,
  IconButton,
  alpha,
} from "@mui/material";
import {
  PersonOutline as PersonIcon,
  LockOutlined as LockIcon,
  Visibility,
  VisibilityOff,
  FitnessCenter,
  Login as LoginIcon,
} from "@mui/icons-material";

export default function ModernLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Modern color palette
  const COLORS = {
    primary: "#3a86ff", // Bright Blue
    secondary: "#ffffff", // White
    dark: "#1a1a2e", // Dark Blue-Purple
    accent: "#8338ec", // Vibrant Purple
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", // Dark gradient
    error: "#ff006e", // Bright Pink-Red
    textLight: "rgba(255, 255, 255, 0.7)", // Light white for subtle text
    inputBorder: "rgba(255, 255, 255, 0.2)", // Softer border for inputs
    inputHoverBorder: "rgba(255, 255, 255, 0.4)", // Input border on hover
  };

  // Modern typography
  const TYPOGRAPHY = {
    heading: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 600,
      fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }, // Adjusted for smaller mobile
    },
    subtitle: {
      fontFamily: "'Open Sans', sans-serif",
      fontWeight: 400,
      fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' }, // Adjusted for smaller mobile
    },
    body: {
      fontFamily: "'Open Sans', sans-serif",
      fontWeight: 400,
      fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.95rem' }, // Adjusted for smaller mobile
    },
    button: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 500,
      fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' }, // Adjusted for smaller mobile
    }
  };

  const handleLogin = () => {
    setIsLoading(true);
    setError("");
    
    setTimeout(() => {
      if ((username === "admin" && password === "admin") || 
          (username === "user" && password === "user123")) {
        localStorage.setItem("usuario", JSON.stringify({ username }));
        router.push("/Dashboard");
      } else {
        setError("Credenciales incorrectas.");
        setIsLoading(false);
      }
    }, 1000);
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.3 } }
  };

  const iconBounce = {
    animate: {
      y: [0, -10, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
    }
  };

  const shimmer = {
    animate: {
      backgroundPosition: ['-200% 0%', '200% 0%'],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    }
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ height: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          height: "100%",
          background: COLORS.background,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background image overlay - responsive opacity */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: "url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: { xs: 0.08, sm: 0.12, md: 0.15 },
          }}
        />

        {/* Decorative radial gradient - more subtle, covers viewport */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "150%", sm: "100%", md: "80%" },
            height: { xs: "150%", sm: "100%", md: "80%" },
            background: `radial-gradient(circle, ${alpha(COLORS.primary, 0.1)} 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 1.5, sm: 3, md: 4 }, // Reduced padding around the card for mobile
            zIndex: 1,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key="login-form"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={formVariants}
            >
              <Paper
                elevation={10}
                sx={{
                  width: "100%",
                  maxWidth: { xs: '300px', sm: '380px', md: '450px' }, // **Reduced max width for mobile**
                  p: { xs: 3, sm: 4, md: 5 }, // **Reduced padding inside the card for mobile**
                  background: alpha(COLORS.dark, 0.9),
                  backdropFilter: "blur(12px)",
                  borderRadius: "16px",
                  border: `1px solid ${alpha(COLORS.primary, 0.2)}`,
                  boxShadow: `0 8px 30px ${alpha(COLORS.dark, 0.6)}`,
                }}
              >
                <Box sx={{ textAlign: "center", mb: { xs: 2.5, md: 4 } }}> {/* Reduced margin for mobile */}
                  <motion.div
                    variants={iconBounce}
                    initial="hidden"
                    animate="animate"
                  >
                    <FitnessCenter
                      sx={{
                        fontSize: { xs: 36, sm: 48, md: 60 }, // Slightly smaller icon for mobile
                        color: COLORS.primary,
                        mb: { xs: 1, md: 1.5 },
                      }}
                    />
                  </motion.div>
                  <Typography
                    variant="h4"
                    sx={{
                      ...TYPOGRAPHY.heading,
                      color: COLORS.secondary,
                      mb: 1,
                      fontSize: TYPOGRAPHY.heading.fontSize,
                    }}
                  >
                    Pilates Admin
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      ...TYPOGRAPHY.subtitle,
                      color: COLORS.textLight,
                      fontSize: TYPOGRAPHY.subtitle.fontSize,
                    }}
                  >
                    Accede a tu cuenta de administrador
                  </Typography>
                </Box>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert
                        severity="error"
                        sx={{
                          mb: 2.5, // Reduced margin below alert
                          background: alpha(COLORS.error, 0.2),
                          color: COLORS.secondary,
                          border: `1px solid ${COLORS.error}`,
                          fontWeight: TYPOGRAPHY.body.fontWeight,
                          fontSize: TYPOGRAPHY.body.fontSize,
                        }}
                      >
                        {error}
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Box component="form" sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Usuario"
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    sx={{
                      mb: 2.5, // Reduced margin below input
                      "& .MuiOutlinedInput-root": {
                        color: COLORS.secondary,
                        "& fieldset": {
                          borderColor: COLORS.inputBorder,
                          borderWidth: "1.5px",
                        },
                        "&:hover fieldset": {
                          borderColor: COLORS.inputHoverBorder,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: COLORS.primary,
                        },
                      },
                      "& .MuiInputLabel-root": {
                        ...TYPOGRAPHY.body,
                        color: COLORS.textLight,
                        "&.Mui-focused": {
                          color: COLORS.primary,
                        },
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: COLORS.textLight }} />
                        </InputAdornment>
                      ),
                      style: {
                        fontSize: TYPOGRAPHY.body.fontSize.xs,
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Contraseña"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{
                      mb: 2.5, // Reduced margin below input
                      "& .MuiOutlinedInput-root": {
                        color: COLORS.secondary,
                        "& fieldset": {
                          borderColor: COLORS.inputBorder,
                          borderWidth: "1.5px",
                        },
                        "&:hover fieldset": {
                          borderColor: COLORS.inputHoverBorder,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: COLORS.primary,
                        },
                      },
                      "& .MuiInputLabel-root": {
                        ...TYPOGRAPHY.body,
                        color: COLORS.textLight,
                        "&.Mui-focused": {
                          color: COLORS.primary,
                        },
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: COLORS.textLight }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: COLORS.textLight }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      style: {
                        fontSize: TYPOGRAPHY.body.fontSize.xs,
                      }
                    }}
                  />

                  <motion.div
                    whileHover={{ scale: 1.02, boxShadow: `0 6px 25px ${alpha(COLORS.primary, 0.4)}` }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleLogin}
                      disabled={isLoading}
                      sx={{
                        py: { xs: 1, sm: 1.2, md: 1.5 }, // **Reduced padding for mobile button**
                        borderRadius: "12px",
                        background: `linear-gradient(45deg, ${COLORS.primary} 0%, ${COLORS.accent} 100%)`,
                        color: COLORS.secondary,
                        ...TYPOGRAPHY.button,
                        fontSize: TYPOGRAPHY.button.fontSize,
                        textTransform: "none",
                        boxShadow: `0 4px 15px ${alpha(COLORS.primary, 0.3)}`,
                        overflow: "hidden",
                        position: "relative",
                        "&:before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: `linear-gradient(90deg, transparent, ${alpha(COLORS.secondary, 0.3)}, transparent)`,
                          transform: 'skewX(-20deg)',
                          transition: 'left 0.7s ease-out',
                        },
                        "&:hover:before": {
                          left: '100%',
                        }
                      }}
                    >
                      {isLoading ? (
                        <motion.div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                          }}
                          animate={{ 
                            rotate: 360,
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          Cargando...
                        </motion.div>
                      ) : (
                        <>
                          <LoginIcon sx={{ mr: 1 }} />
                          Iniciar sesión
                        </>
                      )}
                    </Button>
                  </motion.div>
                </Box>

                <Divider sx={{ my: { xs: 2, md: 3 }, borderColor: alpha(COLORS.secondary, 0.1) }} /> {/* Reduced margin for divider */}

                <Typography
                  variant="body2"
                  align="center"
                  sx={{
                    ...TYPOGRAPHY.body,
                    color: COLORS.textLight,
                    "& a": {
                      color: COLORS.primary,
                      textDecoration: "none",
                      fontWeight: 500,
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    },
                  }}
                >
                  <a href="#">¿Necesitas ayuda para acceder?</a>
                </Typography>
              </Paper>
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Container>
  );
}
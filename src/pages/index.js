import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  Divider,
} from "@mui/material";
import 'materialize-css/dist/css/materialize.min.css';


// Create motion components
const MotionPaper = motion(Paper);
const MotionBox = motion(Box);

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);
  const router = useRouter();

  // Updated color palette with pastel colors, soft greens and blues
  const COLORS = {
    primary: "#92D9B9", // Soft pastel green
    primaryDark: "#edf0bb ", // Slightly darker pastel green
    secondary: "#535C68", // Soft dark gray for text
    background: "#9cedf7  ", // Very light mint background
    accent: "#96CBDE", // Soft pastel blue
    formBg: "rgba(255, 255, 255, 0.95)", // Light form background
    error: "#f4a972 ", // Soft red for errors
    white: "#FFFFFF", // White
    textLight: "#8C9CAD", // Light text color
  };

  // Typography styles
  const TYPOGRAPHY = {
    logo: {
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 700,
      letterSpacing: "0.03em",
      textTransform: "uppercase",
      color: COLORS.secondary,
      fontSize: { xs: "2.2rem", md: "2.8rem" },
      lineHeight: 1.1,
    },
    subtitle: {
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 500,
      fontSize: { xs: "0.9rem", md: "1rem" },
      letterSpacing: "0.15em",
      textTransform: "uppercase",
      color: COLORS.textLight,
    },
    heading: {
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 600,
      color: COLORS.secondary,
    },
    body: {
      fontFamily: "'Poppins', sans-serif", 
      color: COLORS.secondary,
    },
  };

  // Frases motivacionales para el carrusel
  const motivationalQuotes = [
    {
      text: "El entrenamiento es una inversión, nunca un gasto.",
      author: "Evolution FYT"
    },
    {
      text: "En 10 sesiones sentirás la diferencia, en 20 verás la diferencia, en 30 tendrás un cuerpo nuevo.",
      author: "Joseph Pilates"
    },
    {
      text: "La disciplina es el puente entre tus metas y tus logros.",
      author: "Evolution FYT"
    },
    {
      text: "La respiración es la primera acción de la vida y la última. Nuestras vidas están conectadas por ella.",
      author: "Joseph Pilates"
    },
    {
      text: "El verdadero progreso ocurre cuando decides salir de tu zona de confort.",
      author: "Evolution FYT"
    }
  ];

  // Cambiar la frase cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prevQuote) => (prevQuote + 1) % motivationalQuotes.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogin = () => {
    setIsLoading(true);
    setError("");
    
    // Simulamos un pequeño retraso para la animación de carga
    setTimeout(() => {
      if (
        (username === "admin" && password === "admin") ||
        (username === "user" && password === "user123")
      ) {
        localStorage.setItem("usuario", JSON.stringify({ username }));
        router.push("/Dashboard");
      } else {
        setError("Credenciales incorrectas.");
        setIsLoading(false);
      }
    }, 1000);
  };

  // Variantes para animaciones de entrada y salida de las frases
  const quoteVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  // La dirección de la transición
  const [[page, direction], setPage] = useState([0, 0]);

  useEffect(() => {
    setPage([currentQuote, currentQuote > page ? 1 : -1]);
  }, [currentQuote]);

  return (
    <Container maxWidth="lg" disableGutters>
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          background: COLORS.background,
          fontFamily: TYPOGRAPHY.body.fontFamily,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative elements - softer, more pastel-colored */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0.3,
            zIndex: 0,
            overflow: "hidden",
          }}
        >
          {[...Array(6)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: "absolute",
                top: `${15 + i * 15}%`,
                left: `-10%`,
                width: "120%",
                height: "20px",
                background: `linear-gradient(90deg, transparent, ${COLORS.accent} 30%, ${COLORS.primaryDark} 70%, transparent)`,
                transform: `rotate(-${2 + i * 0.4}deg)`,
                opacity: 0.1 + (i * 0.03),
                borderRadius: "100px",
              }}
            />
          ))}
        </Box>

        {/* Animated bubbles - softer colors */}
        {[...Array(8)].map((_, i) => (
          <MotionBox
            key={i}
            style={{
              position: "absolute",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 60 + 30}px`,
              height: `${Math.random() * 60 + 30}px`,
              borderRadius: `${Math.random() * 50}%`,
              background: `radial-gradient(circle, ${COLORS.primary} 0%, ${COLORS.accent} 100%)`,
              opacity: Math.random() * 0.08 + 0.03,
              zIndex: 0,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50, 0],
              x: [0, Math.random() * 100 - 50, 0],
              rotate: [0, Math.random() * 360, 0],
            }}
            transition={{
              duration: Math.random() * 20 + 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}

        <Grid container>
          {/* Logo and motivational quotes section */}
          <Grid item xs={12} md={6} 
            sx={{ 
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: 6,
              position: 'relative',
            }}
          >
            <MotionBox
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                padding: 4,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {/* Logo */}
              <Box sx={{ textAlign: "center", mb: 6 }}>
                <Box sx={{ 
                  position: "relative", 
                  height: "25px", 
                  width: "100%",
                  overflow: "hidden",
                  mb: 2
                }}>
                  {/* Decorative stripes like in the logo - softer colors */}
                  {[...Array(5)].map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        position: "absolute",
                        top: `${i * 5}px`,
                        left: 0,
                        width: "100%",
                        height: "3px",
                        background: `linear-gradient(90deg, transparent 5%, ${COLORS.primaryDark} ${20 + i * 10}%, ${COLORS.accent} ${70 - i * 10}%, transparent 95%)`,
                        transform: `rotate(-${0.5 + i * 0.3}deg)`,
                        borderRadius: "100px",
                      }}
                    />
                  ))}
                </Box>
                
                {/* Logo text */}
                <Typography 
                  variant="h1" 
                  component="h1"
                  sx={TYPOGRAPHY.logo}
                >
                  <Box component="span" sx={{ color: COLORS.secondary }}>
                    TRAINING CENTER
                  </Box>{" "}
                  <Box component="span" sx={{ color: COLORS.primary }}>
                    MDP
                  </Box>
                </Typography>
                
                {/* Subtitle */}
                <Typography 
                  variant="subtitle1"
                  sx={TYPOGRAPHY.subtitle}
                >
                  CENTRO DE ENTRENAMIENTO
                </Typography>
                
                {/* Location */}
                <Typography 
                  variant="caption"
                  sx={{
                    fontFamily: TYPOGRAPHY.subtitle.fontFamily,
                    fontWeight: 400,
                    fontSize: "0.8rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: COLORS.primaryDark,
                    display: "block",
                    mt: 1,
                  }}
                >
                  MAR DEL PLATA
                </Typography>
              </Box>

              {/* Motivational quotes carousel - softer styling */}
              <MotionBox
                sx={{
                  width: "100%",
                  height: "200px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                  overflow: "hidden",
                  backgroundColor: COLORS.white,
                  borderRadius: "12px",
                  border: `1px solid ${COLORS.primaryDark}`,
                  boxShadow: `0 5px 20px rgba(0, 0, 0, 0.05)`,
                  padding: 4,
                }}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <motion.div
                  key={page}
                  custom={direction}
                  variants={quoteVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.5 }
                  }}
                  style={{
                    position: "absolute",
                    width: "80%",
                    height: "auto",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: COLORS.secondary,
                      fontWeight: 500,
                      lineHeight: 1.5,
                      fontStyle: "italic",
                      textAlign: "center",
                    }}
                  >
                    "{motivationalQuotes[page % motivationalQuotes.length].text}"
                  </Typography>
                  
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: COLORS.primary,
                      fontWeight: 600,
                      marginTop: 2,
                    }}
                  >
                    — {motivationalQuotes[page % motivationalQuotes.length].author}
                  </Typography>
                </motion.div>
              </MotionBox>

              {/* Indicators - softer colors */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 3,
                }}
              >
                {motivationalQuotes.map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: currentQuote === index ? COLORS.primary : "rgba(126, 183, 162, 0.3)",
                      margin: "0 5px",
                      transition: "background-color 0.3s",
                    }}
                  />
                ))}
              </Box>
            </MotionBox>
          </Grid>

          {/* Login form section - softer styling */}
          <Grid 
            item 
            xs={12} 
            md={6}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: { xs: "20px", md: "40px" },
              zIndex: 2,
            }}
          >
            <MotionPaper
              elevation={3}
              sx={{
                p: { xs: 4, md: 5 },
                borderRadius: "16px",
                width: "100%",
                maxWidth: 450,
                background: COLORS.formBg,
                boxShadow: `0 5px 20px rgba(0, 0, 0, 0.05)`,
                border: `1px solid rgba(150, 203, 222, 0.3)`,
                position: "relative",
                zIndex: 1,
              }}
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, type: "spring" }}
              whileHover={{ 
                boxShadow: `0 8px 25px rgba(150, 203, 222, 0.2)`,
              }}
            >
              <Typography 
                variant="h4"
                align="center"
                gutterBottom
                sx={{
                  color: COLORS.primary,
                  fontWeight: 600,
                  marginBottom: "25px",
                  fontFamily: TYPOGRAPHY.heading.fontFamily,
                  letterSpacing: "0.02em",
                  lineHeight: 1.2,
                  textAlign: "center",
                  position: "relative",
                  "&:after": {
                    content: '""',
                    display: "block",
                    width: "50px",
                    height: "3px",
                    background: `linear-gradient(to right, ${COLORS.primaryDark}, ${COLORS.accent})`,
                    margin: "12px auto 0",
                    borderRadius: "2px",
                  }
                }}
              >
                <motion.i 
                  className="material-icons" 
                  style={{ 
                    verticalAlign: "middle",
                    fontSize: "1.8rem",
                    marginRight: "10px",
                    color: COLORS.primary,
                  }}
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 5,
                  }}
                >
                  fitness_center
                </motion.i>
                Bienvenido
              </Typography>

              <Typography 
                variant="body1"
                align="center"
                sx={{
                  color: COLORS.textLight,
                  marginBottom: "25px",
                  fontWeight: 400,
                }}
              >
                Accede al panel de Administrador de Evolution FYT
              </Typography>

              {/* Error alert - softer styling */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(244, 123, 123, 0.1)",
                      fontFamily: TYPOGRAPHY.body.fontFamily,
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      background: "rgba(244, 123, 123, 0.1)",
                      border: "1px solid rgba(244, 123, 123, 0.2)",
                      color: "#663333", // Softer red text
                    }}
                    icon={false}
                  >
                    <motion.i 
                      className="material-icons" 
                      style={{ 
                        fontSize: "1.4rem",
                        color: COLORS.error,
                        verticalAlign: "middle",
                        marginRight: "8px",
                      }}
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: 3,
                      }}
                    >
                      error
                    </motion.i>
                    {error}
                  </Alert>
                </motion.div>
              )}

              {/* Login form - softer styling */}
              <Box
                component="form"
                sx={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: 2.5,
                  "& .MuiTextField-root": {
                    marginBottom: "16px"
                  },
                  fontFamily: TYPOGRAPHY.body.fontFamily,
                }}
              >
                {/* Username field - softer styling */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <TextField
                    label={
                      <span style={{ 
                        fontFamily: TYPOGRAPHY.body.fontFamily,
                        fontWeight: 500,
                        fontSize: "0.95rem",
                        color: COLORS.textLight,
                      }}>
                        Usuario
                      </span>
                    }
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <motion.i 
                          className="material-icons" 
                          style={{ 
                            marginRight: "12px", 
                            color: COLORS.primary,
                            fontSize: "1.3rem"
                          }}
                          whileHover={{ scale: 1.1 }}
                        >
                          person
                        </motion.i>
                      ),
                      style: {
                        fontFamily: TYPOGRAPHY.body.fontFamily,
                        fontSize: "0.95rem",
                        color: COLORS.secondary,
                      }
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        "& fieldset": {
                          borderColor: "rgba(146, 217, 185, 0.4)",
                          borderWidth: "1.5px",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(146, 217, 185, 0.6)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: COLORS.primary,
                          boxShadow: `0 0 0 3px rgba(146, 217, 185, 0.2)`,
                        },
                        "& input": {
                          color: COLORS.secondary,
                        }
                      },
                      "& .MuiInputLabel-root": {
                        fontFamily: TYPOGRAPHY.body.fontFamily,
                        color: COLORS.textLight,
                        "&.Mui-focused": {
                          color: COLORS.primary,
                        }
                      },
                    }}
                  />
                </motion.div>

                {/* Password field - softer styling */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <TextField
                    label={
                      <span style={{ 
                        fontFamily: TYPOGRAPHY.body.fontFamily,
                        fontWeight: 500,
                        fontSize: "0.95rem",
                        color: COLORS.textLight,
                      }}>
                        Contraseña
                      </span>
                    }
                    variant="outlined"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <motion.i 
                          className="material-icons" 
                          style={{ 
                            marginRight: "12px", 
                            color: COLORS.primary,
                            fontSize: "1.3rem"
                          }}
                          whileHover={{ scale: 1.1 }}
                        >
                          lock
                        </motion.i>
                      ),
                      style: {
                        fontFamily: TYPOGRAPHY.body.fontFamily,
                        fontSize: "0.95rem",
                        color: COLORS.secondary,
                      }
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        "& fieldset": {
                          borderColor: "rgba(146, 217, 185, 0.4)",
                          borderWidth: "1.5px",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(146, 217, 185, 0.6)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: COLORS.primary,
                          boxShadow: `0 0 0 3px rgba(146, 217, 185, 0.2)`,
                        },
                        "& input": {
                          color: COLORS.secondary,
                        }
                      },
                      "& .MuiInputLabel-root": {
                        fontFamily: TYPOGRAPHY.body.fontFamily,
                        color: COLORS.textLight,
                        "&.Mui-focused": {
                          color: COLORS.primary,
                        }
                      },
                    }}
                  />
                </motion.div>

                {/* Login button - softer styling */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="contained"
                    onClick={handleLogin}
                    fullWidth
                    disabled={isLoading}
                    sx={{
                      mt: 1,
                      mb: 2,
                      padding: "12px",
                      borderRadius: "8px",
                      background: `linear-gradient(to right, ${COLORS.primaryDark}, ${COLORS.primary})`,
                      "&:hover": {
                        background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.accent})`,
                        boxShadow: `0 4px 10px rgba(150, 203, 222, 0.3)`,
                      },
                      fontSize: "1rem",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      textTransform: "none",
                      boxShadow: `0 3px 8px rgba(0, 0, 0, 0.1)`,
                      fontFamily: TYPOGRAPHY.body.fontFamily,
                      position: "relative",
                      overflow: "hidden",
                      color: COLORS.white,
                    }}
                    startIcon={
                      !isLoading && (
                        <i className="material-icons" style={{ 
                          fontSize: "1.4rem",
                          marginRight: "8px"
                        }}>
                          fitness_center
                        </i>
                      )
                    }
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
                        <i className="material-icons" style={{ 
                          fontSize: "1.4rem",
                        }}>
                          autorenew
                        </i>
                      </motion.div>
                    ) : (
                      "Iniciar sesión"
                    )}
                  </Button>
                </motion.div>
                
                <Divider 
                  sx={{ 
                    my: 2,
                    "&::before, &::after": {
                      borderColor: "rgba(140, 156, 173, 0.2)",
                    },
                    color: COLORS.textLight,
                  }}
                >
                  <Typography variant="body2" sx={{ color: COLORS.textLight }}>
                    o
                  </Typography>
                </Divider>
                
                {/* Registration link - softer styling */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Typography 
                    variant="body2" 
                    align="center" 
                    sx={{ 
                      color: COLORS.textLight,
                      mt: 1
                    }}
                  >
                    ¿Aún no tienes cuenta?
                    <motion.span
                      component="a"
                      whileHover={{ color: COLORS.accent }}
                      style={{ 
                        color: COLORS.primary, 
                        fontWeight: 600, 
                        cursor: "pointer",
                        marginLeft: "5px"
                      }}
                    >
                      Regístrate aquí
                    </motion.span>
                  </Typography>
                </motion.div>
                
                {/* Password recovery link - softer styling */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Typography 
                    variant="body2" 
                    align="center" 
                    sx={{ 
                      color: COLORS.textLight,
                      mt: 1
                    }}
                  >
                    <motion.span
                      component="a"
                      whileHover={{ color: COLORS.accent }}
                      style={{ 
                        color: COLORS.primary, 
                        fontWeight: 600, 
                        cursor: "pointer" 
                      }}
                    >
                      ¿Olvidaste tu contraseña?
                    </motion.span>
                  </Typography>
                </motion.div>
              </Box>
            </MotionPaper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
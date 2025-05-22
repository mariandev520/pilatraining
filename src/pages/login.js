import { useState } from "react";
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
} from "@mui/material";
import 'materialize-css/dist/css/materialize.min.css'


// Componente Paper animado con framer-motion
const MotionPaper = motion(Paper);

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (
      (username === "admin" && password === "admin") ||
      (username === "user" && password === "user123")
    ) {
      localStorage.setItem("usuario", JSON.stringify({ username }));
      router.push("/Dashboard");
    } else {
      setError("Credenciales incorrectas.");
    }
  };

  return (
    <>
     

      <Container maxWidth="sm" disableGutters>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            background: "linear-gradient(135deg, #80deea 0%,rgb(84, 78, 95) 50%,rgb(25, 3, 29) 100%)",
            padding: "20px",
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          <MotionPaper
            elevation={10}
            sx={{
              p: 6,
              borderRadius: "16px",
              width: "100%",
              maxWidth: 450,
              background: "rgba(240, 244, 239, 0.95)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 8px 32px 0 rgba(10, 10, 13, 0.37)",
              fontFamily: "inherit",
            }}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <Typography 
              variant="h3"
              align="center"
              gutterBottom
              sx={{
                color: "#5e35b1",
                fontWeight: 700,
                marginBottom: "40px",
                fontFamily: "inherit",
                letterSpacing: "-0.5px",
                lineHeight: 1.2,
                fontSize: { xs: "1.8rem", sm: "2rem" },
              }}
            >
              <i className="material-icons left" style={{ 
                verticalAlign: "middle",
                fontSize: "2.2rem",
                marginRight: "12px"
              }}>
                fingerprint
              </i>
              Iniciar Sesión
            </Typography>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    fontFamily: "inherit",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                  }}
                  icon={false}
                >
                  <i className="material-icons left" style={{ fontSize: "1.4rem" }}>error</i>
                  {error}
                </Alert>
              </motion.div>
            )}

            <Box
              component="form"
              sx={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: 2.5,
                "& .MuiTextField-root": {
                  marginBottom: "24px"
                },
                fontFamily: "inherit",
              }}
            >
              <TextField
                label={
                  <span style={{ 
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: 500,
                    fontSize: "0.95rem"
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
                    <i className="material-icons" style={{ 
                      marginRight: "12px", 
                      color: "#5e35b1",
                      fontSize: "1.5rem"
                    }}>
                      person
                    </i>
                  ),
                  style: {
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: "0.95rem"
                  }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    "& fieldset": {
                      borderColor: "#b39ddb",
                    },
                    "&:hover fieldset": {
                      borderColor: "#7e57c2",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#5e35b1",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontFamily: "inherit",
                  },
                }}
              />

              <TextField
                label={
                  <span style={{ 
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: 500,
                    fontSize: "0.95rem"
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
                    <i className="material-icons" style={{ 
                      marginRight: "12px", 
                      color: "#5e35b1",
                      fontSize: "1.5rem"
                    }}>
                      lock
                    </i>
                  ),
                  style: {
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: "0.95rem"
                  }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    "& fieldset": {
                      borderColor: "#b39ddb",
                    },
                    "&:hover fieldset": {
                      borderColor: "#7e57c2",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#5e35b1",
                    },
                  },
                }}
              />

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="contained"
                  onClick={handleLogin}
                  fullWidth
                  sx={{
                    mt: 1,
                    padding: "14px",
                    borderRadius: "8px",
                    backgroundColor: "#5e35b1",
                    "&:hover": {
                      backgroundColor: "#4527a0",
                    },
                    fontSize: "1rem",
                    fontWeight: 500,
                    letterSpacing: "0.5px",
                    textTransform: "none",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                    fontFamily: "inherit",
                  }}
                  startIcon={
                    <i className="material-icons" style={{ 
                      fontSize: "1.5rem",
                      marginRight: "8px"
                    }}>
                      login
                    </i>
                  }
                >
                  Entrar al sistema
                </Button>
              </motion.div>
            </Box>
          </MotionPaper>
        </Box>
      </Container>


    </>
  );
}
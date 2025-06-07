// /pages/login/index.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  Icon, // Importamos Icon
} from "@mui/material";
import { motion } from "framer-motion";
import styles from "./Login.module.css"; // Importamos nuestro CSS Module

// Importamos los nuevos componentes
import AnimatedBackground from '../components/AnimatedBackground';
import MotivationalSection from '../components/MotivationalSection';

// Creamos motion components una sola vez
const MotionPaper = motion(Paper);

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    setIsLoading(true);
    setError("");

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

  return (
    <Container maxWidth="lg" disableGutters>
      <Box className={styles.pageWrapper}>
        <AnimatedBackground />

        <Grid container>
          <Grid item xs={12} md={6} className={styles.leftPanel}>
            <MotivationalSection />
          </Grid>

          <Grid item xs={12} md={6} className={styles.rightPanel}>
            <MotionPaper
              elevation={3}
              className={styles.loginFormPaper}
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, type: "spring" }}
            >
              <Typography variant="h4" className={styles.formTitle}>
                Bienvenido
              </Typography>
              <Typography variant="body1" className={styles.formSubtitle}>
                Accede al panel de Administrador de Evolution FYT
              </Typography>

              {error && (
                <Alert severity="error" className={styles.errorAlert}>
                  {error}
                </Alert>
              )}

              <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <TextField
                  label="Usuario"
                  variant="outlined"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  className={styles.textField}
                />
                <TextField
                  label="Contraseña"
                  variant="outlined"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  className={styles.textField}
                />
                <Button
                  variant="contained"
                  onClick={handleLogin}
                  fullWidth
                  disabled={isLoading}
                  className={styles.loginButton}
                >
                  {isLoading ? (
                    <Icon className={styles.spinningIcon}>autorenew</Icon>
                  ) : "Iniciar sesión"}
                </Button>
                 <Typography variant="body2" align="center">
                  ¿Aún no tienes cuenta? 
                  <span className={styles.formLink}>Regístrate aquí</span>
                </Typography>
              </Box>
            </MotionPaper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
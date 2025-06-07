// /pages/login/MotivationalSection.tsx
import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import styles from "./MotivationalSection.module.css";

const motivationalQuotes = [
    { text: "El entrenamiento es una inversión, nunca un gasto.", author: "Evolution FYT" },
    { text: "En 10 sesiones sentirás la diferencia, en 20 verás la diferencia, en 30 tendrás un cuerpo nuevo.", author: "Joseph Pilates" },
    { text: "La disciplina es el puente entre tus metas y tus logros.", author: "Evolution FYT" },
];

const quoteVariants = {
    enter: { x: 500, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -500, opacity: 0 },
};

const MotivationalSection = () => {
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Box className={styles.logoContainer}>
        <Typography variant="h1" component="h1" className={styles.logoText}>
          <Box component="span">TRAINING CENTER</Box>{" "}
          <Box component="span" className={styles.logoTextPrimary}>MDP</Box>
        </Typography>
        <Typography variant="subtitle1" className={styles.logoSubtitle}>
          CENTRO DE ENTRENAMIENTO
        </Typography>
        <Typography variant="caption" className={styles.logoLocation}>
          MAR DEL PLATA
        </Typography>
      </Box>

      <motion.div
        className={styles.quotesCarousel}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <motion.div
          key={currentQuote}
          variants={quoteVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 },
          }}
          style={{ position: 'absolute' }}
        >
          <Typography variant="h6" className={styles.quoteText}>
            "{motivationalQuotes[currentQuote].text}"
          </Typography>
          <Typography variant="subtitle2" className={styles.quoteAuthor}>
            — {motivationalQuotes[currentQuote].author}
          </Typography>
        </motion.div>
      </motion.div>

      <Box className={styles.indicatorsContainer}>
        {motivationalQuotes.map((_, index) => (
          <Box
            key={index}
            className={currentQuote === index ? styles.indicatorActive : styles.indicator}
          />
        ))}
      </Box>
    </>
  );
};

export default MotivationalSection;
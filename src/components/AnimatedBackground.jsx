// /pages/login/AnimatedBackground.tsx
import { Box } from "@mui/material";
import { motion } from "framer-motion";

// Los colores se pueden importar de un archivo central o pasarse como props
const COLORS = {
  primary: "#92D9B9",
  primaryDark: "#edf0bb",
  accent: "#96CBDE",
};

const AnimatedBackground = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {/* Animated bubbles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 60 + 30}px`,
            height: `${Math.random() * 60 + 30}px`,
            borderRadius: `${Math.random() * 50}%`,
            background: `radial-gradient(circle, ${COLORS.primary} 0%, ${COLORS.accent} 100%)`,
            opacity: Math.random() * 0.08 + 0.03,
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
    </Box>
  );
};

export default AnimatedBackground;
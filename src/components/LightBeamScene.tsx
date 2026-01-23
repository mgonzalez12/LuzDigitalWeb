'use client';

import { motion } from 'framer-motion';

export default function LightBeamScene() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 1. Base Glow (The foundation of the light) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/20 blur-[100px] rounded-full mix-blend-screen" />

      {/* 3. The Inner Beam Glow (Blue halo around the core) */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40px] h-[120vh] bg-gradient-to-t from-blue-400/50 via-blue-600/20 to-transparent blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 4. Wide Beam Atmosphere (The subtle column of light) */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200px] h-[100vh] bg-gradient-to-t from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      />

      {/* 5. Bottom flare/intense spot */}
      <div className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-blue-400/30 blur-[60px] rounded-full" />
      
      {/* Particles confined to the beam area */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute bottom-0 left-1/2 w-1 h-1 rounded-full bg-blue-200/60 blur-[1px]"
          style={{
            x: (Math.random() - 0.5) * 100, // Confine x-spread to 100px
          }}
          animate={{
            y: [0, -800 - Math.random() * 200],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear",
          }}
        />
      ))}

      {/* Star field effect (optional, kept for continuity) */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    </div>
  );
}

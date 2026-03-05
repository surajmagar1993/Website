/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useState } from "react";

import { motion } from "framer-motion";

// === 🪔 Diwali Animation (Diyas & Sparks) ===
export function DiwaliAnimation() {
  const [particles, setParticles] = useState<any[]>([]);
  useEffect(() => {
    setParticles([...Array(25)].map(() => ({
      left: `${Math.random() * 100}%`,
      size: Math.random() * 8 + 4,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 2,
      drift: Math.random() * 60 - 30 // Horizontal sway
    })));
  }, []);

  if (!particles.length) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute bg-[#FF8A00] rounded-full blur-[2px] opacity-80"
          initial={{
            left: p.left,
            bottom: -50,
            width: p.size,
            height: p.size,
            boxShadow: '0 0 15px 4px rgba(255, 138, 0, 0.9)',
          }}
          animate={{
            y: [-50, -1000],
            x: [0, p.drift, -p.drift, p.drift, 0], // Sine wave drift
            opacity: [0, 1, 0.4, 0.9, 0], // Flicker effect
            scale: [0.5, 1.2, 0.8, 1.5, 0.5] // Flame size change
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
            opacity: { duration: 0.8, repeat: Infinity, repeatType: "mirror" }, // Fast flicker
            scale: { duration: 1.2, repeat: Infinity, repeatType: "mirror" }
          }}
        />
      ))}
    </div>
  );
}

// === 🎨 Holi Animation (Color Splashes) ===
export function HoliAnimation() {
  const [splashes, setSplashes] = useState<any[]>([]);
  
  useEffect(() => {
    const colors = ['#FF00FF', '#00FFFF', '#FFFC00', '#FF003C', '#00FF00'];
    setSplashes([...Array(12)].map(() => ({
      color: colors[Math.floor(Math.random() * colors.length)],
      left: `${Math.random() * 80 + 10}%`,
      top: `${Math.random() * 80 + 10}%`,
      targetSize: Math.random() * 200 + 100,
      rotate: Math.random() * 360,
      duration: Math.random() * 4 + 4,
      delay: Math.random() * 3
    })));
  }, []);

  if (!splashes.length) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
      {splashes.map((s, i) => (
        <motion.svg
          key={i}
          className="absolute origin-center mix-blend-screen"
          viewBox="0 0 100 100"
          initial={{ 
            scale: 0, 
            opacity: 0, 
            rotate: s.rotate,
            left: s.left,
            top: s.top,
            fill: s.color,
            width: s.targetSize,
            height: s.targetSize
          }}
          animate={{
            scale: [0, 1.5, 1.2], // Explosive "splat"
            opacity: [0, 0.8, 0],
            y: [0, 50] // Slow drip downward
          }}
        >
          {/* A more organic, randomized splash path instead of a circle */}
          <path d="M49.5 2C35 5 15 15 5 35C-5 55 5 80 20 90C40 105 75 95 90 75C105 55 95 25 80 15C65 5 55 0 49.5 2Z" filter="blur(8px)" />
        </motion.svg>
      ))}
    </div>
  );
}

// === 🇮🇳 Independence/Republic Day Animation (Tri-color Confetti) ===
export function IndependenceAnimation() {
  const [confetti, setConfetti] = useState<any[]>([]);
  
  useEffect(() => {
    const colors = ['#FF9933', '#FFFFFF', '#138808']; // Saffron, White, Green
    setConfetti([...Array(40)].map(() => ({
      color: colors[Math.floor(Math.random() * colors.length)],
      left: `${Math.random() * 100}%`,
      duration: Math.random() * 5 + 4,
      delay: Math.random() * 5,
      rotateX: Math.random() * 720,
      rotateY: Math.random() * 720,
      rotateZ: Math.random() * 360,
      swayDirection: Math.random() > 0.5 ? 1 : -1 // Pre-calculate sway
    })));
  }, []);

  if (!confetti.length) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 perspective-[1000px]">
      {confetti.map((c, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-4 opacity-80"
          initial={{ left: c.left, top: -20, backgroundColor: c.color }}
          animate={{
            y: [0, 1000],
            rotateX: [0, c.rotateX],
            rotateY: [0, c.rotateY],
            rotateZ: [0, c.rotateZ],
            x: c.swayDirection === 1 ? [0, 50, -50, 100] : [0, -50, 50, -100] // Sway
          }}
          transition={{
            duration: c.duration,
            delay: c.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
}

// === 💃 Navratri Animation (Garba Mandalas) ===
export function NavratriAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div 
        className="absolute top-[10%] left-[5%] opacity-20"
        animate={{ rotate: 360, scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear", scale: { duration: 5, repeat: Infinity, repeatType: "mirror" } }}
      >
        <svg width="400" height="400" viewBox="0 0 100 100" className="fill-[#FBB41A]">
          {/* Complex geometric mandala representation */}
          <path d="M50 0L55 40L95 45L55 50L50 90L45 50L5 45L45 40Z" />
          <path d="M50 15L62 38L85 50L62 62L50 85L38 62L15 50L38 38Z" className="fill-[#D10034]" />
        </svg>
      </motion.div>
      <motion.div 
        className="absolute bottom-[10%] right-[10%] opacity-15"
        animate={{ rotate: -360, scale: [1, 1.2, 1], opacity: [0.1, 0.4, 0.1] }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear", scale: { duration: 7, repeat: Infinity, repeatType: "mirror" } }}
      >
        <svg width="600" height="600" viewBox="0 0 100 100" className="fill-[#D10034]">
          <path d="M50 0L55 40L95 45L55 50L50 90L45 50L5 45L45 40Z" />
          <circle cx="50" cy="50" r="15" className="fill-[#FBB41A]" />
        </svg>
      </motion.div>
    </div>
  );
}

// === 🎄 Christmas Animation (Snow) ===
export function ChristmasAnimation() {
  const [snow, setSnow] = useState<any[]>([]);
  useEffect(() => {
    setSnow([...Array(50)].map(() => ({
      left: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 5,
      drift: Math.random() * 100 - 50 // Wider organic sway
    })));
  }, []);

  if (!snow.length) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {snow.map((s, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full opacity-80"
          initial={{
            left: s.left,
            top: -10,
            width: s.size,
            height: s.size,
            filter: 'blur(1px)',
            boxShadow: '0 0 5px 1px rgba(255, 255, 255, 0.4)'
          }}
          animate={{
            y: [-10, 1000],
            x: [0, s.drift, -s.drift, 0] // Sine wave drift behavior
          }}
          transition={{
            y: { duration: s.duration, delay: s.delay, repeat: Infinity, ease: "linear" },
            x: { duration: s.duration * 0.7, delay: s.delay, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }
          }}
        />
      ))}
    </div>
  );
}

// === 🎆 New Year Animation (Fireworks / Shimmer) ===
export function NewYearAnimation() {
  const [fireworks, setFireworks] = useState<any[]>([]);
  useEffect(() => {
    setFireworks([...Array(8)].map(() => ({
      left: `${Math.random() * 80 + 10}%`,
      top: `${Math.random() * 60 + 10}%`,
      delay: Math.random() * 4,
      particles: [...Array(20)].map(() => ({
        angle: Math.random() * Math.PI * 2,
        velocity: Math.random() * 100 + 50,
        size: Math.random() * 4 + 2
      }))
    })));
  }, []);

  if (!fireworks.length) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {fireworks.map((fw, i) => (
        <motion.div key={i} className="absolute" initial={{ left: fw.left, top: fw.top }}>
          {fw.particles.map((p: any, j: number) => (
             <motion.div
               key={j}
               className="absolute bg-[#FFD700] rounded-full"
               initial={{ 
                 x: 0, 
                 y: 0, 
                 scale: 0, 
                 opacity: 0,
                 width: p.size, 
                 height: p.size, 
                 boxShadow: '0 0 8px 2px rgba(255, 215, 0, 0.8)'
               }}
               animate={{
                 x: Math.cos(p.angle) * p.velocity,
                 y: Math.sin(p.angle) * p.velocity + 20, // Gravity effect
                 scale: [0, 1, 0],
                 opacity: [0, 1, 0]
               }}
               transition={{
                 duration: 1.5,
                 delay: fw.delay,
                 repeat: Infinity,
                 repeatDelay: 3,
                 ease: "easeOut"
               }}
             />
          ))}
        </motion.div>
      ))}
    </div>
  );
}

// === 💖 Valentine Animation (Hearts) ===
export function ValentineAnimation() {
  const [hearts, setHearts] = useState<any[]>([]);
  useEffect(() => {
    setHearts([...Array(20)].map(() => ({
      left: `${Math.random() * 100}%`,
      size: Math.random() * 20 + 20,
      duration: Math.random() * 6 + 6,
      delay: Math.random() * 5,
      drift: Math.random() * 100 - 50
    })));
  }, []);

  if (!hearts.length) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {hearts.map((h, i) => (
        <motion.svg
          key={i}
          className="absolute fill-[#FA004F] opacity-60 drop-shadow-[0_0_10px_rgba(250,0,79,0.5)]"
          initial={{
            left: h.left,
            bottom: -50,
            width: h.size,
            height: h.size,
          }}
          viewBox="0 0 32 29.6"
          animate={{
            y: [-50, -1000],
            x: [0, h.drift, -h.drift, 0], // Gentle sway
            scale: [1, 1.3, 1] // Heartbeat pulse
          }}
          transition={{
            y: { duration: h.duration, delay: h.delay, repeat: Infinity, ease: "linear" },
            x: { duration: h.duration * 0.8, delay: h.delay, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" },
            scale: { duration: 1.2, delay: h.delay, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <path d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2 c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z"/>
        </motion.svg>
      ))}
    </div>
  );
}

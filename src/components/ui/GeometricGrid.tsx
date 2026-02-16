"use client";

import { useEffect, useRef } from "react";

export default function GeometricGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationFrameId: number;

    // Grid parameters
    // Grid parameters
    
    // Perspective parameters
    const horizonY = height * 0.4; // Horizon line height
    
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", resize);
    resize();

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = "rgba(5, 5, 16, 1)"; // Match background color --color-bg
      ctx.fillRect(0, 0, width, height);

      // Create gradient for fading out towards horizon
      const gradient = ctx.createLinearGradient(0, horizonY, 0, height);
      gradient.addColorStop(0, "rgba(5, 5, 16, 0)"); // Fade out at horizon
      gradient.addColorStop(0.2, "rgba(59, 130, 246, 0.1)"); // Start showing
      gradient.addColorStop(1, "rgba(249, 115, 22, 0.15)"); // Orange tint closer to viewer

      const centerX = width / 2;

      // --- SIMPLIFIED GRID RENDERER for Clean Look ---
      
      ctx.beginPath();
      // Draw reduced set of vertical lines (persistently radiating)
      for (let i = -20; i <= 20; i++) {
        ctx.strokeStyle = "rgba(59, 130, 246, 0.3)"; 
        if (i === 0) ctx.strokeStyle = "rgba(59, 130, 246, 0.8)"; // Center line brighter
        ctx.lineWidth = 2;
        
        ctx.moveTo(centerX, horizonY);
        // Fan out relative to center
        ctx.lineTo(centerX + i * width * 0.15, height); 
      }
      ctx.stroke();

      // Horizontal Lines (Moving)
      const speed = 0.002;
      const time = Date.now() * speed;
      const zStart = 1;
      const zEnd = 10;
      
      for (let z = zStart; z < zEnd; z+= 0.2) {
         // Create movement by adding time to Z, then modulo
         const wrapZ = zStart + ((z + time) % (zEnd - zStart));
         
         // Perspective projection
         // y increases as z decreases (objects get closer/lower)
         // normalizedY (0 to 1) = 1 / z
         
         const p = 1 / wrapZ; // 1 at z=1, 0.1 at z=10
         
         // Map p to screen Y
         // horizon is p=0, bottom is p=1 (roughly)
         const y = horizonY + (height - horizonY) * p;
         
         ctx.beginPath();
         // Fade out near horizon
         const alpha = Math.max(0, (p * 0.8) - 0.1); // significantly brighter
         ctx.strokeStyle = `rgba(249, 115, 22, ${alpha})`;
         ctx.lineWidth = 2;
         
         if (p > 0.8) ctx.strokeStyle = `rgba(236, 72, 153, ${alpha})`; // Pinkish overlap near bottom
         
         ctx.moveTo(0, y);
         ctx.lineTo(width, y);
         ctx.stroke();
      }

      // Add a top glow "Sun" or "Data Center" effect at the horizon
      const sunGradient = ctx.createRadialGradient(centerX, horizonY, 0, centerX, horizonY, 300);
      sunGradient.addColorStop(0, "rgba(59, 130, 246, 0.2)");
      sunGradient.addColorStop(0.5, "rgba(59, 130, 246, 0.05)");
      sunGradient.addColorStop(1, "transparent");
      
      ctx.fillStyle = sunGradient;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
    />
  );
}

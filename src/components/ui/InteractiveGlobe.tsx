"use client";

import { useEffect, useRef } from "react";

interface InteractiveGlobeProps {
  className?: string;
  particleColor?: string;
  particleSize?: number;
  radius?: number;
  rotationSpeed?: number;
}

export default function InteractiveGlobe({
  className = "",
  particleColor = "rgba(14, 165, 233, 0.8)", // sky-500
  particleSize = 1.5,
  radius = 200,
  rotationSpeed = 0.002,
}: InteractiveGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let particles: any[] = [];
    let angleX = 0;
    let angleY = 0;
    
    // Mouse interaction state
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let isMouseOver = false;

    const resizeCanvas = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      initParticles();
    };

    const createParticle = () => {
      return {
        theta: Math.random() * Math.PI * 2,
        phi: Math.acos((Math.random() * 2) - 1),
        x: 0,
        y: 0,
        z: 0,

        updatePosition: function() {
          this.x = radius * Math.sin(this.phi) * Math.cos(this.theta);
          this.y = radius * Math.sin(this.phi) * Math.sin(this.theta);
          this.z = radius * Math.cos(this.phi);
        },

        project: function(axisRotationX: number, axisRotationY: number) {
          // Rotate around Y axis
          const x1 = this.x * Math.cos(axisRotationY) - this.z * Math.sin(axisRotationY);
          const z1 = this.z * Math.cos(axisRotationY) + this.x * Math.sin(axisRotationY);

          // Rotate around X axis
          const y1 = this.y * Math.cos(axisRotationX) - z1 * Math.sin(axisRotationX);
          const z2 = z1 * Math.cos(axisRotationX) + this.y * Math.sin(axisRotationX);

          // Perspective projection
          const scale = 300 / (300 + z2);
          
          return {
            x: x1 * scale + canvas.width / 2,
            y: y1 * scale + canvas.height / 2,
            scale: scale,
            alpha: (z2 + radius) / (2 * radius) // Fade out back particles
          };
        }
      };
    };

    const initParticles = () => {
      particles = [];
      // Adjust particle count based on screen size
      const count = window.innerWidth < 768 ? 400 : 800;
      
      for (let i = 0; i < count; i++) {
        const p = createParticle();
        p.updatePosition();
        particles.push(p);
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth rotation dampening
      if (isMouseOver) {
        angleY += (targetRotationY - angleY) * 0.05;
        angleX += (targetRotationX - angleX) * 0.05;
      } else {
        angleY += rotationSpeed; // Auto rotate
        angleX += (0 - angleX) * 0.05; // Return to level
      }

      // Sort particles by depth (Z-bufferish) for correct transparency
      // We can do a simple draw pass here for performance as scaling/alpha handles depth perception reasonably well
      
      particles.forEach(p => {
        const proj = p.project(angleX, angleY);
        
        ctx.beginPath();
        ctx.fillStyle = particleColor;
        ctx.globalAlpha = Math.max(0.1, proj.alpha); // Minimum visibility
        ctx.arc(proj.x, proj.y, particleSize * proj.scale, 0, Math.PI * 2);
        ctx.fill();
      });
      
      ctx.globalAlpha = 1; // Reset alpha
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      mouseX = (x - rect.width / 2) / (rect.width / 2);
      mouseY = (y - rect.height / 2) / (rect.height / 2);
      
      targetRotationY = mouseX * 2; // Range -2 to 2 radians
      targetRotationX = -mouseY * 2; // Invert Y for natural feel
    };

    const handleMouseEnter = () => {
      isMouseOver = true;
    };

    const handleMouseLeave = () => {
      isMouseOver = false;
    };

    window.addEventListener("resize", resizeCanvas);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);
    
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleColor, particleSize, radius, rotationSpeed]);

  return (
    <div ref={containerRef} className={`absolute inset-0 z-0 ${className} flex items-center justify-center`}>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}

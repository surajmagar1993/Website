/**
 * Motion — Reusable Framer Motion animation components.
 * Exports: FadeIn, StaggerContainer, StaggerItem, TextReveal,
 * ParallaxOrb, ScaleButton, GlowCard.
 */
"use client";

import { motion, useScroll, useTransform, MotionProps, Variants } from "framer-motion";
import { cn } from "../lib/utils";

/* ═══ Fade Up / In ═══ */
type FadeInProps = MotionProps & {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  fullWidth?: boolean;
};

export function FadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
  fullWidth = false,
  ...props
}: FadeInProps) {
  const directionOffset = {
    up: { y: 24, x: 0 },
    down: { y: -24, x: 0 },
    left: { x: 24, y: 0 },
    right: { x: -24, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionOffset[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cn(fullWidth ? "w-full" : "", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* ═══ Stagger Container ═══ */
export function StaggerContainer({
  children,
  className,
  delay = 0,
  staggerDelay = 0.1,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══ Stagger Item ═══ */
export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══ Text Reveal (Char by Char) ═══ */
export function TextReveal({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: delay * i },
    }),
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.span
      className={cn("inline-block", className)}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {words.map((word, index) => (
        <motion.span variants={child} key={index} className="inline-block whitespace-pre mr-[0.25em] last:mr-0">
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ═══ Parallax Orb ═══ */
export function ParallaxOrb({
  className,
  speed = 1,
}: {
  className?: string;
  speed?: number;
}) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 200 * speed]);

  return (
    <motion.div style={{ y }} className={className} />
  );
}

/* ═══ Magnetic Button (Simple Hover) ═══ */
export function ScaleButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className={className}
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      {...props as any}
    >
      {children}
    </motion.button>
  );
}

/* ═══ Glow Card (Hover Effect) ═══ */
export function GlowCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -5,
        boxShadow: "0 20px 40px -15px rgba(20, 184, 166, 0.2)",
        borderColor: "rgba(20, 184, 166, 0.4)",
      }}
      initial={{ y: 0, borderColor: "rgba(255, 255, 255, 0.1)" }}
      transition={{ duration: 0.3 }}
      className={cn("glass", className)}
    >
      {children}
    </motion.div>
  );
}

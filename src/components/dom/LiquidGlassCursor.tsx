"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue } from "framer-motion";

export default function LiquidGlassCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch device
    if (typeof window !== 'undefined') {
      if (window.matchMedia("(pointer: coarse)").matches || 'ontouchstart' in window) {
        setIsTouchDevice(true);
        return;
      }
    }

    // Hide default cursor globally
    const style = document.createElement("style");
    style.innerHTML = `
      * { cursor: none !important; }
    `;
    document.head.appendChild(style);

    const updateMousePosition = (e: MouseEvent) => {
      // Instant update via motion values (no react state lag)
      cursorX.set(e.clientX - 20);
      cursorY.set(e.clientY - 20);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if hovering over an interactive element
      if (target && target.closest('a, button, [role="button"], .nav-dot, input, textarea, select')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Use passive listener for maximum scroll/mouse performance
    window.addEventListener("mousemove", updateMousePosition, { passive: true });
    window.addEventListener("mouseover", handleMouseOver);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [isVisible, cursorX, cursorY]);

  const variants = {
    default: {
      scale: 1,
      opacity: isVisible ? 1 : 0,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderColor: "rgba(255, 255, 255, 0.3)",
      boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.2), inset 0 0 10px rgba(255,255,255,0.2)",
    },
    hover: {
      scale: 1.5,
      opacity: isVisible ? 1 : 0,
      backgroundColor: "rgba(99, 102, 241, 0.3)", // Primary color tint
      borderColor: "rgba(99, 102, 241, 0.5)",
      boxShadow: "0 8px 32px 0 rgba(99, 102, 241, 0.4), inset 0 0 10px rgba(255,255,255,0.4)",
    }
  };

  if (isTouchDevice) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-[40px] h-[40px] rounded-full pointer-events-none z-[999999]"
      style={{
        x: cursorX,
        y: cursorY,
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        borderStyle: "solid",
        borderWidth: "1px",
        willChange: "transform",
      }}
      variants={variants}
      animate={isHovering ? "hover" : "default"}
      // We only animate the scale, colors, and opacity. X and Y move instantly.
      transition={{ duration: 0.2, ease: "easeOut" }}
    />
  );
}

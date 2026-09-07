"use client";

import React from "react";
import { motion, MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GradientTextProps
  extends Omit<React.HTMLAttributes<HTMLElement>, keyof MotionProps> {
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
  /** When true renders the animated blob version. Default: true */
  animated?: boolean;
}

/**
 * GradientText — renders text with animated IEEE-blue/cyan colour blobs that
 * float behind the text using mix-blend-overlay on a white background.
 * Falls back to a static CSS gradient when animated=false.
 */
function GradientText({
  className,
  children,
  as: Component = "span",
  animated = true,
  ...props
}: GradientTextProps) {
  if (!animated) {
    return (
      <span className={cn("gradient-text", className)} {...(props as React.HTMLAttributes<HTMLSpanElement>)}>
        {children}
      </span>
    );
  }

  const MotionTag = Component === "div" ? motion.div : motion.span;

  return (
    <MotionTag
      className={cn(
        "relative inline-flex overflow-hidden bg-white",
        className
      )}
      {...(props as any)}
    >
      {children}

      {/* Animated colour blobs — IEEE Blue / Cyan palette */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-lighten"
      >
        {/* Top-left blob */}
        <span
          className="pointer-events-none absolute -top-1/2 h-[30vw] w-[30vw] bg-[hsl(var(--color-1))] mix-blend-overlay blur-[1rem]"
          style={{
            animation:
              "gradient-border 6s ease-in-out infinite, gradient-1 12s ease-in-out infinite alternate",
          }}
        />
        {/* Top-right blob */}
        <span
          className="pointer-events-none absolute right-0 top-0 h-[30vw] w-[30vw] bg-[hsl(var(--color-2))] mix-blend-overlay blur-[1rem]"
          style={{
            animation:
              "gradient-border 6s ease-in-out infinite, gradient-2 12s ease-in-out infinite alternate",
          }}
        />
        {/* Bottom-left blob */}
        <span
          className="pointer-events-none absolute bottom-0 left-0 h-[30vw] w-[30vw] bg-[hsl(var(--color-3))] mix-blend-overlay blur-[1rem]"
          style={{
            animation:
              "gradient-border 6s ease-in-out infinite, gradient-3 12s ease-in-out infinite alternate",
          }}
        />
        {/* Bottom-right blob */}
        <span
          className="pointer-events-none absolute -bottom-1/2 right-0 h-[30vw] w-[30vw] bg-[hsl(var(--color-4))] mix-blend-overlay blur-[1rem]"
          style={{
            animation:
              "gradient-border 6s ease-in-out infinite, gradient-4 12s ease-in-out infinite alternate",
          }}
        />
      </span>
    </MotionTag>
  );
}

export { GradientText };

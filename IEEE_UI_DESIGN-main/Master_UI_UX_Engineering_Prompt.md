# MASTER UI/UX & ENGINEERING SPECIFICATION

> **Status:** Production-Grade Technical Specification  
> **Version:** 2.0  
> **Target Project:** IEEE Computational Intelligence Society CUSB (IEEE CIS CUSB)

---

## 1. Executive Summary & Design Vision

The objective of this specification is to establish a world-class, white-first, high-fidelity web experience for the **IEEE Computational Intelligence Society (CIS) CUSB Chapter**. The platform blends corporate elegance, scientific authority, and modern interactive aesthetics (glassmorphism, micro-animations, GPU-accelerated motion, and spotlight surfaces).

### Core Aesthetic Pillars
- **White-First Clean Canvas:** Dominant light surfaces (`#f8fafc` / `#ffffff`) with subtle ambient radial gradients in IEEE Blue (`#00629b`) and Cyan (`#06b6d4`).
- **Glassmorphism & Depth:** Layered translucent surfaces featuring `backdrop-filter: blur(18px)`, crisp 1px borders (`rgba(255,255,255,0.85)`), and soft multi-stage box shadows.
- **Micro-Interactions & Spotlights:** Mouse-following spotlight cards (`GlowCard`), animated gradient headers (`GradientText`), and hardware-accelerated GSAP marquees.
- **Accessibility & Performance First:** 95+ Lighthouse performance target, 60 FPS animation loop, WCAG AA compliance, and complete support for `prefers-reduced-motion`.

---

## 2. Global Design System & Tokens

### 2.1 Color Palette
| Token Name | Hex / Value | Semantic Role |
| :--- | :--- | :--- |
| `primary` | `#00629b` | Official IEEE Blue (Brand core, primary buttons, links) |
| `primary-dark` | `#00527f` | Deep navy variant for active states and rich text contrast |
| `primary-light` | `#e6f0f5` | Subtle tint for badges, subtle backgrounds, and hover fills |
| `accent` | `#06b6d4` | Computational Cyan (Glows, gradient highlights, active indicators) |
| `background` | `#f8fafc` | Clean slate canvas background |
| `surface` | `#ffffff` | Elevated card & section background |
| `surface-glass` | `rgba(255, 255, 255, 0.72)` | Translucent glass container |
| `text-primary` | `#0f172a` | Deep Slate 900 (High contrast headers & body text) |
| `text-secondary` | `#475569` | Slate 600 (Subtitles, captions, metadata) |
| `border-subtle` | `#e2e8f0` | Crisp container dividers and input borders |

### 2.2 Elevation & Shadows
- `--shadow-sm`: `0 1px 2px rgba(15, 23, 42, 0.05)`
- `--shadow-md`: `0 4px 12px rgba(15, 23, 42, 0.08)`
- `--shadow-lg`: `0 18px 40px rgba(15, 23, 42, 0.10)`
- `--shadow-glow`: `0 18px 50px rgba(0, 98, 155, 0.14)`

---

## 3. Core Component Blueprints

### 3.1 GlowCard Component (`src/components/ui/glow-card.tsx`)
A interactive spotlight card that tracks cursor coordinates and updates CSS custom properties `--spotlight-x` and `--spotlight-y` dynamically without triggering heavy React re-renders.

```tsx
"use client";

import { useCallback, useRef, useState, type CSSProperties, type HTMLAttributes, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

type GlowCardProps = HTMLAttributes<HTMLDivElement> & {
  glowColor?: string;
};

export function GlowCard({ className, glowColor = "0, 98, 155", onMouseMove, onMouseLeave, style, ...props }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: -200, y: -200, active: false });

  const handleMouseMove = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const bounds = cardRef.current?.getBoundingClientRect();
    if (bounds) {
      setPosition({ x: event.clientX - bounds.left, y: event.clientY - bounds.top, active: true });
    }
    onMouseMove?.(event);
  }, [onMouseMove]);

  const handleMouseLeave = useCallback((event: MouseEvent<HTMLDivElement>) => {
    setPosition((current) => ({ ...current, active: false }));
    onMouseLeave?.(event);
  }, [onMouseLeave]);

  return (
    <div
      ref={cardRef}
      className={cn("glow-card", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        "--spotlight-x": `${position.x}px`,
        "--spotlight-y": `${position.y}px`,
        "--spotlight-color": glowColor,
        "--spotlight-opacity": position.active ? 1 : 0,
        ...style,
      } as CSSProperties}
      {...props}
    />
  );
}
```

### 3.2 GradientText Component (`src/components/ui/gradient-text.tsx`)
```tsx
import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type GradientTextProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
};

export function GradientText({ children, className, ...props }: GradientTextProps) {
  return (
    <span className={cn("gradient-text", className)} {...props}>
      {children}
    </span>
  );
}
```

---

## 4. Page Architecture & Implementation Roadmap

### 4.1 Home Page (`/src/app/page.tsx`)
- **Hero Section:** Features liquid typography, floating status badges, dynamic CTA triggers, and ambient lighting.
- **Ongoing & Upcoming Events:** Continuous infinite-scroll scroller powered by GSAP for optimal 60fps scrolling performance.
- **Flagship Initiatives:** GlowCard spotlight grid showcasing key IEEE CIS tracks (AI, Machine Learning, Neural Networks, Robotics).
- **Featured Articles & Research:** Glassmorphic card grid with full modal details and responsive triggers.

### 4.2 Code Warriors (`/src/app/code-warriors/page.tsx`)
- High-energy coding competition showcase with interactive leaderboards, challenge archives, and registration triggers.

### 4.3 CIS Innovators Hub (`/src/app/innovators-hub/page.tsx`)
- Project showcase highlighting student research, published papers, and open-source contributions.

---

## 5. Engineering Standards & Performance Criteria

1. **Next.js 16 & React 19 Compatibility:**
   - Adhere strictly to `'use client'` placement for interactive UI sub-trees.
   - Utilize native Next.js Server Components for layout structure and data fetching.
2. **Animation Budget & GPU Acceleration:**
   - Restrict animated CSS properties to `transform` (`translate3d`) and `opacity`.
   - Implement `prefers-reduced-motion` media queries across all animated components.
3. **Typography & Assets:**
   - Use Next.js optimized fonts (`next/font`) and images (`next/image`) with correct aspect ratios and blur placeholders.

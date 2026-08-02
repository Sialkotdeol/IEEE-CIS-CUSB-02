"use client";

import { ArrowRight, Calendar, MapPin, Rocket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { useRef, useCallback } from "react";

const ONGOING_EVENTS = [
  {
    title: "C1S C0DE WARR10RS",
    date: "Ongoing Event",
    location: "Online / CU",
    description:
      "A peer-learning ecosystem focused on building consistency, mastering DSA, and cracking technical placements. Upgrade your logic, optimize your runtime.",
    link: "/code-warriors",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
    accent: "from-blue-600 to-cyan-500",
    glowHue: 205,
  },
  {
    title: "CIS Innovators Hub",
    date: "Registration Open",
    location: "Online / CU",
    description:
      "A long-term innovation ecosystem where students build impactful projects, collaborate in teams, and represent IEEE CIS in national and international hackathons.",
    link: "/innovators-hub",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop",
    accent: "from-cyan-500 to-blue-400",
    glowHue: 192,
  },
];

/** Liquid-glass button with rainbow conic-gradient border + cursor glow */
function LiquidGlassButton({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  children: React.ReactNode;
}) {
  const btnRef = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const el = btnRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--btn-x", `${((e.clientX - rect.left) / rect.width) * 100}%`);
      el.style.setProperty("--btn-y", `${((e.clientY - rect.top) / rect.height) * 100}%`);
      el.style.setProperty("--btn-glow", "1");
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    el.style.setProperty("--btn-glow", "0");
  }, []);

  return (
    <Link
      ref={btnRef}
      href={href}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="liquid-glass-btn text-sm md:text-base"
    >
      {children}
    </Link>
  );
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function OngoingEvents() {
  const router = useRouter();

  const handleNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("page-leave"));
    setTimeout(() => router.push(href), 400);
  };

  return (
    <section
      id="ongoing-events"
      data-reveal
      className="reveal-section relative w-full py-20 md:py-28 flex flex-col items-center justify-center px-6"
    >
      <div className="relative w-full max-w-7xl mx-auto flex flex-col items-center justify-center">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center w-full mb-14">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="section-eyebrow flex items-center gap-2 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold tracking-widest uppercase mb-4"
          >
            <Rocket size={14} />
            Join the Movement
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="section-heading text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight"
          >
            Ongoing Events
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-4 text-slate-500 text-base md:text-lg max-w-xl text-center"
          >
            Always-open programmes you can join right now to grow your skills and
            build with the community.
          </motion.p>
        </div>

        {/* Events Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className={`grid grid-cols-1 ${
            ONGOING_EVENTS.length > 1 ? "md:grid-cols-2" : "max-w-2xl"
          } gap-8 w-full max-w-5xl mx-auto justify-center`}
        >
          {ONGOING_EVENTS.map((event, index) => (
            <motion.div key={index} variants={cardVariants}>
              <SpotlightCard
                glowHue={event.glowHue}
                spotSize={300}
                borderSize={2}
                className="group glass-surface relative rounded-3xl border border-slate-200/80 overflow-hidden flex flex-col h-full"
              >
                {/* Image */}
                <div className="relative h-56 md:h-64 w-full overflow-hidden shrink-0">
                  <img
                    src={event.image}
                    alt={event.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent pointer-events-none" />

                  {/* Active badge */}
                  <div className="absolute top-4 left-4 inline-block px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-primary text-[10px] md:text-xs font-bold uppercase tracking-wider border border-white/80 shadow-sm">
                    🟢 Active Now
                  </div>

                  {/* Gradient accent bar */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${event.accent} opacity-80`}
                  />
                </div>

                {/* Content */}
                <div className="p-7 flex-1 flex flex-col justify-between relative z-10">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-3 text-slate-900">
                      {event.title}
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-5 text-slate-500 text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-primary" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-primary" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-8">
                      {event.description}
                    </p>
                  </div>

                  {/* Liquid Glass CTA */}
                  <LiquidGlassButton
                    href={event.link}
                    onClick={(e) => handleNavigation(e, event.link)}
                  >
                    View Details
                    <ArrowRight
                      size={17}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </LiquidGlassButton>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

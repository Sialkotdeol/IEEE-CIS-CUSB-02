"use client";

import { ArrowRight, Calendar, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { pastEvents } from "@/data/events";
import { SpotlightCard } from "@/components/ui/spotlight-card";

const FLAGSHIP_SLUGS = [
  "contribute-x",
  "intellect-a-thon",
  "ai-innovation-day-bhasha-bandhu-hackathon",
  "placement-preparation-workshop",
  "azure-ai-influencer-day"
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function FlagshipEvents() {
  const router = useRouter();

  const flagshipEvents = pastEvents.filter((event) =>
    FLAGSHIP_SLUGS.includes(event.slug)
  );

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
      id="flagship-events"
      data-reveal
      className="reveal-section light-panel relative w-full flex flex-col items-center justify-center py-16 md:py-24"
    >
      <div className="relative w-full max-w-7xl mx-auto flex flex-col items-center justify-center px-6">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center w-full mb-10">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="section-eyebrow flex items-center gap-2 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold tracking-widest uppercase mb-4"
          >
            <Star size={14} />
            Our Hall of Fame
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="section-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight"
          >
            Flagship Events
          </motion.h2>
        </div>

        {/* Events Layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="flex flex-col md:flex-row w-full max-w-7xl h-auto md:h-[480px] gap-4 mt-4"
        >
          {flagshipEvents.map((event, index) => {
            const hasMedia = event.media && event.media.length > 0;
            const rawCover = hasMedia
              ? event.media![0]
              : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2000&auto=format&fit=crop";
            let coverImage = rawCover.replace(/\.(mov|mp4)$/i, ".jpg");
            coverImage = coverImage.replace(
              "/upload/q_auto/f_auto/",
              "/upload/w_600,q_auto,f_auto/"
            );
            const targetUrl = `/past-events/${event.slug}`;

            return (
              <motion.div
                key={index}
                variants={cardVariants}
                className="relative flex-1 min-w-0"
              >
                <SpotlightCard
                  className="h-[220px] md:h-full rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-md"
                  glowHue={205}
                  spotSize={280}
                  borderSize={2}
                >
                  <Link
                    href={targetUrl}
                    onClick={(e) => handleNavigation(e, targetUrl)}
                    className="group block absolute inset-0 z-10"
                    aria-label={event.title}
                  >
                    {/* Background image */}
                    <div className="absolute inset-0 w-full h-full bg-[#111] overflow-hidden">
                      <img
                        src={coverImage}
                        alt={event.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full block object-cover transition-transform duration-700 ease-out group-hover:scale-105 will-change-transform"
                      />
                      {/* Overlay layers */}
                      <div className="absolute inset-0 bg-black/45 group-hover:bg-black/15 transition-colors duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent opacity-90" />
                    </div>

                    {/* Always-visible badge */}
                    <div className="absolute top-4 left-4 z-20 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest border border-white/25 shadow">
                      <Star size={10} className="text-yellow-300" />
                      Flagship
                    </div>

                    {/* Desktop: collapsed */}
                    <div className="hidden md:flex absolute bottom-0 left-0 p-5 lg:p-6 flex-col justify-end w-full transition-opacity duration-400 group-hover:opacity-0">
                      <h3 className="text-base lg:text-lg font-bold text-white leading-tight drop-shadow-md line-clamp-2">
                        {event.title}
                      </h3>
                    </div>

                    {/* Desktop: expanded on hover */}
                    <div className="hidden md:flex absolute bottom-0 left-0 p-5 lg:p-6 flex-col justify-end w-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
                      <h3 className="text-lg lg:text-xl font-bold text-white mb-2 leading-tight drop-shadow-md line-clamp-2">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-white/80 text-xs mb-2">
                        <Calendar size={13} className="text-cyan-400 shrink-0" />
                        <span className="truncate">{event.date}</span>
                      </div>
                      <p className="text-white/60 text-xs line-clamp-2 mb-3 leading-relaxed">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-xs">
                        View Details{" "}
                        <ArrowRight
                          size={13}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </div>
                    </div>

                    {/* Mobile content */}
                    <div className="md:hidden absolute bottom-0 left-0 w-full p-5 flex flex-col justify-end bg-gradient-to-t from-black via-black/80 to-transparent">
                      <h3 className="text-xl font-bold text-white leading-tight mb-1">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 text-white/70 text-xs">
                        <Calendar size={12} className="text-cyan-400" />
                        <span>{event.date}</span>
                      </div>
                    </div>
                  </Link>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

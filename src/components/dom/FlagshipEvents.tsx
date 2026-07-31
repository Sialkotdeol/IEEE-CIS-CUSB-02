"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Calendar, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { pastEvents } from "@/data/events";

const FLAGSHIP_SLUGS = [
  "contribute-x",
  "intellect-a-thon",
  "ai-innovation-day-bhasha-bandhu-hackathon",
  "placement-preparation-workshop",
  "azure-ai-influencer-day"
];

export default function FlagshipEvents() {
  const container = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const flagshipEvents = pastEvents.filter(event => FLAGSHIP_SLUGS.includes(event.slug));

  useGSAP(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return;
    
    // Initial setup
    gsap.set(".flagship-title", { opacity: 0, y: 30 });
    gsap.set(".flagship-card", { opacity: 0, scale: 0.95, pointerEvents: "none" });

    const handleSectionChange = (e: CustomEvent) => {
      if (e.detail === 2) { // 3rd section
        gsap.fromTo(".flagship-title", 
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: "power3.out", delay: 0.3 }
        );
        gsap.fromTo(".flagship-card", 
          { opacity: 0, scale: 0.95, pointerEvents: "none" },
          { 
            opacity: 1, scale: 1, duration: 1, stagger: 0.2, ease: "power3.out", delay: 0.5,
            onComplete: () => {
              gsap.set(".flagship-card", { clearProps: "pointerEvents" });
            }
          }
        );
      }
    };

    window.addEventListener("section-change", handleSectionChange as EventListener);

    return () => window.removeEventListener("section-change", handleSectionChange as EventListener);
  }, { scope: container });

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("page-leave"));
    setTimeout(() => {
      router.push(href);
    }, 400);
  };

  return (
    <section id="flagship-events" className="gsap-flagship-events-section relative lg:absolute lg:-inset-y-24 inset-x-0 w-full min-h-[100dvh] lg:h-[120vh] flex flex-col items-center justify-center z-20 max-lg:bg-transparent lg:bg-[#050505] lg:[clip-path:circle(0%_at_50%_50%)]">
      <div ref={container} className="relative w-full h-full max-w-7xl mx-auto flex flex-col items-center justify-center pt-16 pb-16 lg:pt-24 lg:pb-24">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center w-full mb-12">
          <div className="flagship-title flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs md:text-sm font-semibold tracking-widest uppercase mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Star size={14} />
            Our Hall of Fame
          </div>
          <h2 className="flagship-title text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 leading-tight">
            Flagship Events
          </h2>
        </div>

        {/* Events Layout */}
        <div className="flex flex-col md:flex-row w-full max-w-7xl md:h-[55vh] gap-4 mt-8 pb-10 px-2 md:px-0">
          {flagshipEvents.map((event, index) => {
            const hasMedia = event.media && event.media.length > 0;
            const rawCover = hasMedia ? event.media![0] : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2000&auto=format&fit=crop";
            // Force Cloudinary to serve an image thumbnail instead of a heavy video to fix massive GPU lag
            let coverImage = rawCover.replace(/\.(mov|mp4)$/i, '.jpg');
            // Add Cloudinary resize parameter to prevent loading 4K images during scroll
            coverImage = coverImage.replace('/upload/q_auto/f_auto/', '/upload/w_600,q_auto,f_auto/');
            const targetUrl = `/past-events/${event.slug}`;

            return (
              <Link 
                href={targetUrl}
                key={index} 
                className="flagship-card block group relative w-full md:flex-1 h-[200px] md:h-full transition-[transform,border-color,box-shadow,background-color] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-primary/20 flex-shrink-0 border border-white/5 hover:border-primary/50 bg-[#0a0a0a] will-change-transform"
              >
                {/* Absolute overlay to guarantee the entire card is clickable */}
                <div className="absolute inset-0 z-50" />

                <div className="absolute inset-0 w-full h-full bg-[#111]">
                  <img src={coverImage} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform" />
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition-colors duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90" />
                </div>

                {/* Desktop Content - Collapsed State */}
                <div className="hidden md:flex absolute bottom-0 left-0 p-5 lg:p-6 flex-col justify-end w-full transition-opacity duration-500 group-hover:opacity-0">
                  <div className="flex flex-col items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-black/80 border border-white/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                      <Star size={16} className="text-white" />
                    </div>
                    <h3 className="text-base lg:text-lg font-bold text-white leading-tight drop-shadow-md">
                      {event.title}
                    </h3>
                  </div>
                </div>

                {/* Desktop Content - Expanded State */}
                <div className="hidden md:flex absolute bottom-0 left-0 p-5 lg:p-6 flex-col justify-end w-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                  <div className="w-full">
                    <div className="inline-block px-2 py-1 rounded-full bg-primary/20 text-primary text-[9px] lg:text-[10px] font-bold uppercase tracking-wider mb-2 lg:mb-3 border border-primary/30">
                      Flagship
                    </div>
                    <h3 className="text-lg lg:text-xl font-bold text-white mb-2 whitespace-normal leading-tight drop-shadow-md line-clamp-3">{event.title}</h3>
                    <div className="flex items-center gap-1.5 text-white/80 text-xs lg:text-sm mb-3">
                      <Calendar size={14} className="text-primary shrink-0" />
                      <span className="truncate">{event.date}</span>
                    </div>
                    <p className="text-white/60 text-xs line-clamp-2 mb-4 leading-relaxed">{event.description}</p>
                    <div className="flex items-center gap-1.5 text-primary font-semibold text-xs lg:text-sm mt-auto">
                      View Details <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* Mobile Content */}
                <div className="md:hidden absolute bottom-0 left-0 w-full p-5 flex flex-col justify-end bg-gradient-to-t from-black via-black/80 to-transparent">
                  <div className="flex flex-col gap-2">
                    <div className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-semibold uppercase tracking-wider w-max border border-primary/30">
                      Flagship Initiative
                    </div>
                    <h3 className="text-xl font-bold text-white leading-tight">{event.title}</h3>
                    <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
                      <Calendar size={12} className="text-primary" />
                      <span>{event.date}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

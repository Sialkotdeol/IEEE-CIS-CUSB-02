"use client";

import Nav from "@/components/dom/Nav";
import Footer from "@/components/dom/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Calendar, MapPin, ChevronDown, Star } from "lucide-react";
import EventsScroller from "@/components/dom/EventsScroller";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { pastEvents as PAST_EVENTS } from "@/data/events";

const FLAGSHIP_SLUGS = [
  "contribute-x",
  "intellect-a-thon",
  "ai-innovation-day-bhasha-bandhu-hackathon",
  "placement-preparation-workshop",
  "azure-ai-influencer-day"
];

const FLAGSHIP_EVENTS = PAST_EVENTS.filter(event => FLAGSHIP_SLUGS.includes(event.slug));

export default function Events() {
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      gsap.set(".gsap-hero-title", { opacity: 1, scale: 1 });
      gsap.set(".gsap-hero-subtitle", { opacity: 1 });
      gsap.set(".gsap-flagship-card", { opacity: 1, scale: 1 });
      gsap.set(".gsap-past-card", { opacity: 1, scale: 1 });
      return;
    }

    // Initial setup: hide internal elements
    gsap.set(".gsap-hero-title", { opacity: 0, scale: 0.9 });
    gsap.set(".gsap-hero-subtitle", { opacity: 0 });
    gsap.set(".gsap-flagship-card", { opacity: 0, scale: 0.95, pointerEvents: "none" });
    gsap.set(".gsap-past-card", { opacity: 0, scale: 0.95 });

    const handleSectionChange = (e: CustomEvent) => {
      const index = e.detail;
      
      if (index === 0) {
        gsap.fromTo(".gsap-hero-title", 
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 1.2, stagger: 0.2, ease: "power3.out" }
        );
        gsap.fromTo(".gsap-hero-subtitle", 
          { opacity: 0 },
          { opacity: 1, duration: 1, delay: 0.4, ease: "power3.out" }
        );
      }
      
      if (index === 1) {
        gsap.fromTo(".gsap-flagship-card", 
          { opacity: 0, scale: 0.95, pointerEvents: "none" },
          { 
            opacity: 1, scale: 1, duration: 0.8, stagger: 0.15, ease: "power3.out", delay: 0.2,
            onComplete: () => {
              gsap.set(".gsap-flagship-card", { clearProps: "pointerEvents" });
            }
          }
        );
      }

      if (index === 2) {
        gsap.fromTo(".gsap-past-card", 
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.2 }
        );
      }
    };

    window.addEventListener("section-change", handleSectionChange as EventListener);

    // Initial trigger for Hero
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('section-change', { detail: 0 }));
    }, 100);

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
    <>
      <Nav />
      <div ref={container} className="block w-full">
        <EventsScroller>
          
          {/* SECTION 0: HERO */}
          <section className="gsap-events-hero relative lg:absolute lg:inset-x-0 lg:-inset-y-24 w-full min-h-[100dvh] lg:h-[120vh] flex flex-col items-center justify-center text-center px-6 z-10 bg-[#050505]" style={{ perspective: "1000px" }}>
            <div className="gsap-hero-title inline-block px-4 py-1.5 rounded-full border border-primary/40 bg-primary/20 text-primary text-xs md:text-sm font-bold tracking-widest uppercase mb-8 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
              Innovate. Collaborate.
            </div>
            <h1 className="gsap-hero-title text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-300 to-primary drop-shadow-[0_0_50px_rgba(99,102,241,0.6)]">
              Our Events
            </h1>
            <p className="gsap-hero-subtitle text-xl md:text-2xl text-white/70 font-light max-w-3xl mx-auto leading-relaxed mb-16">
              Explore our flagship programs, upcoming opportunities, and past initiatives shaping the future of AI.
            </p>
            
            <div className="gsap-hero-subtitle absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-70 animate-bounce cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent('section-change', { detail: 1 }))}>
              <span className="text-xs uppercase tracking-widest text-primary font-bold mb-2">Scroll</span>
              <ChevronDown className="w-6 h-6 text-primary" />
            </div>
          </section>

          {/* SECTION 1: FLAGSHIP EVENTS */}
          <section className="gsap-events-flagship relative lg:absolute lg:inset-x-0 lg:-inset-y-24 w-full min-h-[100dvh] py-24 lg:py-0 lg:h-[120vh] flex flex-col items-center justify-center lg:justify-start lg:pt-40 px-6 z-20 bg-[#020202] will-change-transform">
            <div className="w-full max-w-7xl mx-auto">
              <div className="flex flex-col items-center mb-8">
                <h2 className="text-4xl md:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                  Flagship Events
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-transparent mt-6 rounded-full" />
              </div>

              <div className="flex flex-col md:flex-row w-full h-auto md:h-[55vh] gap-4 mt-8 pb-10 px-2 md:px-0">
                {FLAGSHIP_EVENTS.map((event, index) => {
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
                      className="gsap-flagship-card block group relative w-full md:flex-1 h-[200px] md:h-full transition-[transform,border-color,box-shadow,background-color] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-primary/20 flex-shrink-0 border border-white/5 hover:border-primary/50 bg-[#0a0a0a] will-change-transform"
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
                      <div className="md:hidden absolute bottom-0 left-0 w-full p-4 flex flex-col justify-end">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-black/80 border border-white/20 flex items-center justify-center shrink-0">
                            <Star size={14} className="text-primary" />
                          </div>
                          <h3 className="text-lg font-bold text-white truncate w-full pr-4">{event.title}</h3>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          {/* SECTION 2: PAST EVENTS */}
          <section className="gsap-events-past relative lg:absolute lg:inset-x-0 lg:-inset-y-24 w-full min-h-[100dvh] py-24 lg:py-0 lg:h-[120vh] flex flex-col items-center justify-center px-6 z-30 bg-black/95 will-change-transform">
            <div className="w-full max-w-7xl mx-auto mt-12 md:mt-24">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 md:mb-12 gap-4 md:gap-0">
                <div className="flex flex-col items-center md:items-start w-full">
                  <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-2 md:mb-0">
                    Past Events
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-primary to-transparent mt-4 rounded-full md:hidden" />
                </div>
                <Link 
                  href="/past-events"
                  onClick={(e) => handleNavigation(e, "/past-events")}
                  className="inline-flex items-center gap-2 text-primary hover:text-white transition-colors group mt-4 md:mt-0"
                >
                  View all past events
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PAST_EVENTS.slice(0, 3).map((event, index) => {
                  const hasMedia = event.media && event.media.length > 0;
                  return (
                    <Link href={`/past-events/${event.slug}`} key={index} className="block h-full">
                      <div 
                        className={`gsap-past-card glass-panel p-8 rounded-3xl transition-colors flex flex-col h-full group/card bg-[#0a0a0a]/60 hover:border-primary/50 cursor-pointer`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl md:text-2xl font-bold leading-tight group-hover/card:text-primary transition-colors pr-4">{event.title}</h3>
                          <span className="text-2xl shrink-0">{event.type === 'hackathon' ? '🏆' : '📚'}</span>
                        </div>
                        <div className="text-primary text-sm font-semibold mb-6 flex items-center gap-2 tracking-wide">
                          <Calendar size={16} />
                          <span>{event.date}</span>
                        </div>
                        <p className="text-white/60 flex-grow leading-relaxed text-sm mb-8">
                          {event.description}
                        </p>
                        <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest pt-6 border-t border-white/10 text-primary`}>
                          {hasMedia ? `View ${event.media!.length} photos` : `View full details`}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

        </EventsScroller>
      </div>
      

      
      <Footer />
    </>
  );
}

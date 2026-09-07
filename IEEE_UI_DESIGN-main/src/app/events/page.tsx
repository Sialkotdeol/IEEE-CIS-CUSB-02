"use client";

import Nav from "@/components/dom/Nav";
import Footer from "@/components/dom/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Calendar, ChevronDown, Star, Sparkles, Rocket } from "lucide-react";
import EventsScroller from "@/components/dom/EventsScroller";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { pastEvents as PAST_EVENTS } from "@/data/events";
import { SpotlightCard } from "@/components/ui/spotlight-card";

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

    gsap.set(".gsap-hero-title", { opacity: 0, scale: 0.95 });
    gsap.set(".gsap-hero-subtitle", { opacity: 0 });
    gsap.set(".gsap-flagship-card", { opacity: 0, scale: 0.96, pointerEvents: "none" });
    gsap.set(".gsap-past-card", { opacity: 0, scale: 0.96 });

    const handleSectionChange = (e: CustomEvent) => {
      const index = e.detail;
      
      if (index === 0) {
        gsap.fromTo(".gsap-hero-title", 
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 1, stagger: 0.15, ease: "power3.out" }
        );
        gsap.fromTo(".gsap-hero-subtitle", 
          { opacity: 0 },
          { opacity: 1, duration: 0.8, delay: 0.3, ease: "power3.out" }
        );
      }
      
      if (index === 1) {
        gsap.fromTo(".gsap-flagship-card", 
          { opacity: 0, scale: 0.96, pointerEvents: "none" },
          { 
            opacity: 1, scale: 1, duration: 0.8, stagger: 0.12, ease: "power3.out", delay: 0.15,
            onComplete: () => {
              gsap.set(".gsap-flagship-card", { clearProps: "pointerEvents" });
            }
          }
        );
      }

      if (index === 2) {
        gsap.fromTo(".gsap-past-card", 
          { opacity: 0, scale: 0.96 },
          { opacity: 1, scale: 1, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.15 }
        );
      }
    };

    window.addEventListener("section-change", handleSectionChange as EventListener);

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
      <div ref={container} className="block w-full pixel-grid-bg">
        <EventsScroller>
          
          {/* SECTION 0: HERO */}
          <section className="gsap-events-hero relative lg:absolute lg:inset-x-0 lg:-inset-y-24 w-full min-h-[100dvh] lg:h-[120vh] flex flex-col items-center justify-center text-center px-6 z-10 bg-slate-50/90" style={{ perspective: "1000px" }}>
            <div className="gsap-hero-title inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary/20 bg-primary/6 text-primary text-xs md:text-sm font-bold tracking-widest uppercase mb-8 shadow-sm">
              <Sparkles size={14} className="text-primary animate-pulse" /> Innovate. Collaborate. Lead.
            </div>
            <h1 className="gsap-hero-title text-6xl md:text-8xl font-black tracking-tighter mb-8 text-slate-900 leading-tight">
              Our <span className="gaming-text-gradient">Events</span>
            </h1>
            <p className="gsap-hero-subtitle text-xl md:text-2xl text-slate-600 font-light max-w-3xl mx-auto leading-relaxed mb-16">
              Explore our flagship programs, upcoming opportunities, and past initiatives shaping the future of AI.
            </p>
            
            <div 
              className="gsap-hero-subtitle absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-80 animate-bounce cursor-pointer group" 
              onClick={() => window.dispatchEvent(new CustomEvent('section-change', { detail: 1 }))}
            >
              <span className="text-xs uppercase tracking-widest text-primary font-bold mb-1">Scroll Down</span>
              <ChevronDown className="w-6 h-6 text-primary group-hover:translate-y-1 transition-transform" />
            </div>
          </section>

          {/* SECTION 1: FLAGSHIP EVENTS */}
          <section className="gsap-events-flagship relative lg:absolute lg:inset-x-0 lg:-inset-y-24 w-full min-h-[100dvh] py-24 lg:py-0 lg:h-[120vh] flex flex-col items-center justify-center lg:justify-start lg:pt-40 px-6 z-20 bg-white/95 will-change-transform">
            <div className="w-full max-w-7xl mx-auto">
              <div className="flex flex-col items-center mb-8">
                <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-widest mb-2">
                  <Star size={14} className="text-yellow-500" /> Hall of Fame
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-center text-slate-900">
                  Flagship Events
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-cyan-400 mt-4 rounded-full" />
              </div>

              <div className="flex flex-col md:flex-row w-full h-auto md:h-[55vh] gap-4 mt-8 pb-10 px-2 md:px-0">
                {FLAGSHIP_EVENTS.map((event, index) => {
                  const hasMedia = event.media && event.media.length > 0;
                  const rawCover = hasMedia ? event.media![0] : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2000&auto=format&fit=crop";
                  let coverImage = rawCover.replace(/\.(mov|mp4)$/i, '.jpg');
                  coverImage = coverImage.replace('/upload/q_auto/f_auto/', '/upload/w_600,q_auto,f_auto/');
                  const targetUrl = `/past-events/${event.slug}`;

                  return (
                    <SpotlightCard
                      key={index}
                      glowHue={205}
                      spotSize={280}
                      borderSize={2}
                      className="gsap-flagship-card relative w-full md:flex-1 h-[220px] md:h-full rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl border border-slate-200 bg-white will-change-transform"
                    >
                      <Link 
                        href={targetUrl}
                        className="group block absolute inset-0 z-10"
                        aria-label={event.title}
                      >
                        <div className="absolute inset-0 w-full h-full bg-[#111]">
                          <img src={coverImage} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform" />
                          <div className="absolute inset-0 bg-black/45 group-hover:bg-black/20 transition-colors duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90" />
                        </div>

                        {/* Always-visible Badge */}
                        <div className="absolute top-4 left-4 z-20 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest border border-white/30 shadow">
                          <Star size={11} className="text-yellow-400" /> Flagship
                        </div>

                        {/* Desktop Collapsed */}
                        <div className="hidden md:flex absolute bottom-0 left-0 p-5 lg:p-6 flex-col justify-end w-full transition-opacity duration-500 group-hover:opacity-0">
                          <h3 className="text-base lg:text-lg font-bold text-white leading-tight drop-shadow-md line-clamp-2">
                            {event.title}
                          </h3>
                        </div>

                        {/* Desktop Expanded */}
                        <div className="hidden md:flex absolute bottom-0 left-0 p-5 lg:p-6 flex-col justify-end w-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
                          <h3 className="text-lg lg:text-xl font-bold text-white mb-2 leading-tight drop-shadow-md line-clamp-2">{event.title}</h3>
                          <div className="flex items-center gap-1.5 text-white/80 text-xs mb-2">
                            <Calendar size={13} className="text-cyan-400 shrink-0" />
                            <span className="truncate">{event.date}</span>
                          </div>
                          <p className="text-white/60 text-xs line-clamp-2 mb-3 leading-relaxed">{event.description}</p>
                          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-xs">
                            View Details <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>

                        {/* Mobile Content */}
                        <div className="md:hidden absolute bottom-0 left-0 w-full p-4 flex flex-col justify-end">
                          <h3 className="text-lg font-bold text-white leading-tight">{event.title}</h3>
                        </div>
                      </Link>
                    </SpotlightCard>
                  );
                })}
              </div>
            </div>
          </section>

          {/* SECTION 2: PAST EVENTS */}
          <section className="gsap-events-past relative lg:absolute lg:inset-x-0 lg:-inset-y-24 w-full min-h-[100dvh] py-24 lg:py-0 lg:h-[120vh] flex flex-col items-center justify-center px-6 z-30 bg-slate-50/95 will-change-transform">
            <div className="w-full max-w-7xl mx-auto mt-12 md:mt-24">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 md:mb-12 gap-4 md:gap-0">
                <div className="flex flex-col items-center md:items-start w-full">
                  <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-widest mb-1">
                    <Rocket size={14} /> Event Archives
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-2 md:mb-0">
                    Past Events
                  </h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-primary to-cyan-400 mt-4 rounded-full md:hidden" />
                </div>
                <Link 
                  href="/past-events"
                  onClick={(e) => handleNavigation(e, "/past-events")}
                  className="inline-flex items-center gap-2 text-primary hover:text-[#00527f] font-semibold text-sm transition-colors group mt-4 md:mt-0"
                >
                  View all past events
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PAST_EVENTS.slice(0, 3).map((event, index) => {
                  const hasMedia = event.media && event.media.length > 0;
                  return (
                    <SpotlightCard
                      key={index}
                      glowHue={205}
                      spotSize={240}
                      borderSize={2}
                      className="gsap-past-card rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-md group/card transition-all duration-300"
                    >
                      <Link href={`/past-events/${event.slug}`} className="p-7 flex flex-col h-full block">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold leading-tight text-slate-900 group-hover/card:text-primary transition-colors pr-3">
                            {event.title}
                          </h3>
                          <span className="text-2xl shrink-0">{event.type === 'hackathon' ? '🏆' : '📚'}</span>
                        </div>
                        <div className="text-primary text-xs font-bold mb-4 flex items-center gap-2 tracking-wide font-mono">
                          <Calendar size={14} />
                          <span>{event.date}</span>
                        </div>
                        <p className="text-slate-600 flex-grow leading-relaxed text-xs md:text-sm mb-6">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest pt-4 border-t border-slate-100 text-primary">
                          {hasMedia ? `View ${event.media!.length} photos` : `View full details`}
                          <ArrowRight size={14} className="group-hover/card:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    </SpotlightCard>
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

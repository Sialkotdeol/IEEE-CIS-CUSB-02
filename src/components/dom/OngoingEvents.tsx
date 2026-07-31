"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Calendar, MapPin, Rocket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ONGOING_EVENTS = [
  {
    title: "C1S C0DE WARR10RS",
    date: "Ongoing Event",
    location: "Online / CU",
    description: "A peer-learning ecosystem focused on building consistency, mastering DSA, and cracking technical placements. Upgrade your logic, optimize your runtime.",
    link: "/code-warriors",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop"
  },
  {
    title: "CIS Innovators Hub",
    date: "Registration Open",
    location: "Online / CU",
    description: "A long-term innovation ecosystem where students build impactful projects, collaborate in teams, and represent IEEE CIS in national and international hackathons.",
    link: "/innovators-hub",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop"
  }
];

export default function OngoingEvents() {
  const container = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useGSAP(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return;
    
    const handleSectionChange = (e: CustomEvent) => {
      if (e.detail === 4) { // 4th index (5th section)
        gsap.to(".ongoing-title", { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: "power3.out", delay: 0.3 });
        gsap.to(".ongoing-card", { opacity: 1, y: 0, scale: 1, duration: 1, stagger: 0.2, ease: "power3.out", delay: 0.5 });
      } else {
        gsap.set(".ongoing-title", { opacity: 0, y: 30 });
        gsap.set(".ongoing-card", { opacity: 0, y: 100, scale: 0.95 });
      }
    };

    window.addEventListener("section-change", handleSectionChange as EventListener);

    // Set initial states
    gsap.set(".ongoing-title", { opacity: 0, y: 30 });
    gsap.set(".ongoing-card", { opacity: 0, y: 100, scale: 0.95 });

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
    <section id="ongoing-events" className="gsap-ongoing-section relative lg:absolute lg:-inset-y-24 inset-x-0 w-full min-h-[100dvh] py-24 lg:py-0 lg:h-[120vh] flex flex-col items-center justify-center z-40 max-lg:bg-transparent lg:bg-[#050505] px-6 lg:[clip-path:circle(0%_at_50%_50%)]">
      <div ref={container} className="relative w-full h-full max-w-7xl mx-auto flex flex-col items-center justify-center pt-24 pb-24">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center w-full mb-16">
          <div className="ongoing-title flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs md:text-sm font-semibold tracking-widest uppercase mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Rocket size={14} />
            Join the Movement
          </div>
          <h2 className="ongoing-title text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 leading-tight">
            Ongoing Events
          </h2>
        </div>

        {/* Events Grid */}
        <div className={`grid grid-cols-1 ${ONGOING_EVENTS.length > 1 ? "md:grid-cols-2" : "max-w-2xl"} gap-8 w-full max-w-5xl mx-auto justify-center`}>
          {ONGOING_EVENTS.map((event, index) => (
            <div key={index} className="ongoing-card relative bg-[#0a0a0a]/95 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden group hover:border-primary/50 transition-colors flex flex-col">
              
              {/* Image */}
              <div className="relative h-56 md:h-64 w-full overflow-hidden shrink-0">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-[#0a0a0a]/40 to-transparent pointer-events-none" />
                
                {/* Badge overlay on image */}
                <div className="absolute top-4 left-4 inline-block px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] md:text-xs font-semibold uppercase tracking-wider border border-white/10">
                  Active Now
                </div>
              </div>

              {/* Content */}
              <div className="p-8 flex-1 flex flex-col justify-between relative z-10 -mt-12 bg-gradient-to-b from-transparent to-[#0a0a0a]">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white drop-shadow-md">{event.title}</h3>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-5 text-white/70 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-primary" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-primary" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm md:text-base leading-relaxed mb-8">
                    {event.description}
                  </p>
                </div>
                
                <div>
                  <Link 
                    href={event.link}
                    onClick={(e) => handleNavigation(e, event.link)}
                    className="group/btn inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-white/5 hover:bg-primary text-white font-semibold transition-all border border-white/10 hover:border-primary shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
                  >
                    View Details
                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
              
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

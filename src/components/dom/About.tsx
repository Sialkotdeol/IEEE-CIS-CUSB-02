"use client";

import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const phrases = [
  {
    text: "We are a community of innovators exploring the frontiers of intelligence.",
    className: "text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tighter text-white leading-[1.1]"
  },
  {
    text: "We organize workshops, competitions, and technical sessions bridging theory and real-world impact.",
    className: "text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight text-white/60 leading-snug mt-6"
  },
  {
    text: "Our mission is to empower students to build the future of AI and Machine Learning.",
    className: "text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-accent leading-snug mt-6"
  }
];

export default function About() {
  const [isActive, setIsActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSectionChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail === 1) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    };
    
    window.addEventListener('section-change', handleSectionChange);
    return () => window.removeEventListener('section-change', handleSectionChange);
  }, []);

  useGSAP(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return;
    const elements = containerRef.current?.querySelectorAll('.gsap-about-reveal');
    if (!elements || elements.length === 0) return;
    
    if (isActive) {
      gsap.fromTo(elements, 
        { opacity: 0, y: 30, filter: "blur(10px)" },
        { 
          opacity: 1, 
          y: 0, 
          filter: "blur(0px)", 
          duration: 1.2, 
          stagger: 0.5, 
          ease: "power2.out", 
          overwrite: true 
        }
      );
    } else {
      gsap.set(elements, { opacity: 0, y: 30, filter: "blur(10px)", overwrite: true });
    }
  }, { dependencies: [isActive], scope: containerRef });

  return (
    <section id="about" className="gsap-about-section relative lg:absolute lg:-inset-y-24 inset-x-0 w-full min-h-[100dvh] lg:h-[120vh] flex items-center justify-center z-20 max-lg:bg-transparent lg:bg-[#050505] lg:bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.15)_0%,_rgba(5,5,5,1)_50%)] overflow-hidden lg:[clip-path:circle(0%_at_50%_50%)]">
      <div ref={containerRef} className="relative w-full h-full flex flex-col items-center justify-center max-w-5xl mx-auto overflow-hidden px-6 pt-12">
        
        <div className="gsap-about-reveal mb-12">
          <div className="inline-block px-5 py-2 rounded-full border border-primary/40 bg-primary/20 text-primary text-sm md:text-base font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            About Us
          </div>
        </div>

        <div className="text-center flex flex-col items-center max-w-4xl mx-auto">
          {phrases.map((phrase, index) => (
            <h2 
              key={index}
              className={`gsap-about-reveal ${phrase.className}`}
            >
              {phrase.text}
            </h2>
          ))}
        </div>
        
      </div>
    </section>
  );
}

"use client";

import Nav from "@/components/dom/Nav";
import Footer from "@/components/dom/Footer";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { FaLinkedin } from "react-icons/fa";
import { Mail, Sparkles, Shield, UserCheck } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { motion } from "framer-motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const faculty = [
  {
    name: "Dr. Sugandha Sharma",
    role: "Branch Counsellor",
    bio: "Providing guidance, mentorship, and strategic direction to support student growth and excellence.",
    image: "/sugandha.jpg",
    linkedin: "https://www.linkedin.com/in/dr-sugandha-sharma-8a4090b7/",
    email: "sugandha.cse@cumail.in"
  },
  {
    name: "Dr. Rakesh Kumar",
    role: "Chapter Advisor",
    bio: "Mentoring leadership while ensuring alignment with academic and professional standards.",
    image: "/rakesh.jpeg",
    linkedin: "https://www.linkedin.com/in/dr-rakesh-kumar-01534834/",
    email: "rakesh.e8623@cumail.in"
  }
];

const team = [
  {
    name: "Yash Sharma",
    role: "Chair Person",
    bio: "Leading IEEE CIS CUSB with vision, vibes, and next-gen innovation—turning ideas into impact.",
    image: "/yash.jpeg",
    linkedin: "https://www.linkedin.com/in/sharmayash2805/",
    email: "yashrgp@gmail.com"
  },
  {
    name: "Nirav Seth",
    role: "Vice Chair Person",
    bio: "Supporting the vision with strong execution while fostering collaboration and growth.",
    image: "/nirav seth .jpeg",
    linkedin: "https://www.linkedin.com/in/nirav-seth-59812a303/",
    email: "sethnirav22@gmail.com",
    imagePosition: "center"
  },
  {
    name: "Laxmi Abhinaya Chunchu",
    role: "Secretary (General)",
    bio: "Ensuring smooth coordination, clear communication, and efficient execution across all responsibilities.",
    image: "/Chunchun Luxmi Abhinaya.jpeg",
    linkedin: "https://www.linkedin.com/in/laxmi-abhinaya-ch-7b1773302",
    email: "abhinayach643@gmail.com",
    imagePosition: "top"
  },
  {
    name: "Bhavya",
    role: "Joint Secretary",
    bio: "Focused on teamwork, organization, and timely execution of responsibilities.",
    image: "/bhavya.jpeg",
    linkedin: "http://linkedin.com/in/bhavya-bhugra-a84177386",
    email: "bhavyabhugra28@gmail.com",
    imagePosition: "center"
  },
  {
    name: "Angadveer Singh Deol",
    role: "Digital Lead",
    bio: "Blending vision, discipline, and creativity to create work that actually matters.",
    image: "/angad.jpeg",
    linkedin: "https://www.linkedin.com/in/angadveer-singh-deol-9b8b172b2/",
    email: "angaddeol11@gmail.com"
  },
  {
    name: "Anurag Kumar Shaw",
    role: "Treasurer",
    bio: "Dedicated to managing finances with precision, ensuring transparency, and fostering financial growth.",
    image: "/Anurah Shaw.jpeg",
    linkedin: "https://www.linkedin.com/in/anurag-shaw-420909382",
    email: "anuragshaw0057@gmail.com",
    imagePosition: "top"
  },
  {
    name: "Shivansh Pandey",
    role: "Head of Media",
    bio: "Overseeing media operations while shaping a strong and consistent visual identity.",
    image: "/shivansh2.jpeg",
    linkedin: "https://www.linkedin.com/in/shivansh-pandey-468244353",
    email: "shivansh682.pandey@gmail.com",
    imagePosition: "top"
  },
  {
    name: "Diwanshu Goyal",
    role: "Membership Executive",
    bio: "Learning, supporting, and delivering with purpose.",
    image: "/diwanshu.jpeg",
    linkedin: "https://www.linkedin.com/in/diwanshu-goyal-73b54b328",
    email: "diwanshu224@gmail.com",
    imagePosition: "0% center",
    imageZoom: 2.0
  },
  {
    name: "Sneha Sinha",
    role: "Event Coordinator",
    bio: "Skilled in planning, coordinating, and executing events with precision and attention to detail.",
    image: "/Sneha Sinha.jpeg",
    linkedin: "https://www.linkedin.com/in/sneha-sinha-8a9b51381/",
    email: "s.sinha0531@gmail.com",
    imagePosition: "center"
  },
  {
    name: "Tanishka",
    role: "PR Lead",
    bio: "Fostering meaningful connections and promoting initiatives that strengthen the chapter's reach and impact.",
    image: "/tanishka.jpeg",
    linkedin: "https://www.linkedin.com/in/tanishka-chahal-bba561375/",
    email: "tanishkachahal79@gmail.com",
    imagePosition: "center"
  },
  {
    name: "Krish",
    role: "Tech Lead",
    bio: "Driving technical excellence and innovation while building solutions that empower the chapter's growth.",
    image: "/krish-converted.jpg",
    linkedin: "https://www.linkedin.com/in/krishmunjal/",
    email: "krishmunjal126@gmail.com",
    imagePosition: "center"
  }
];

const PersonCard = ({ person, className = "" }: { person: any; className?: string }) => {
  return (
    <SpotlightCard
      glowHue={205}
      spotSize={260}
      borderSize={2}
      className={`gsap-reveal-card rounded-3xl overflow-hidden group transition-all duration-500 flex flex-col h-full bg-white border border-slate-200/90 shadow-md hover:shadow-xl ${className}`}
    >
      {/* Top Side: Photo */}
      <div className="relative h-72 w-full shrink-0 bg-slate-100 overflow-hidden">
        <img
          src={person.image}
          alt={person.name}
          style={{
            objectPosition: person.imagePosition || 'center',
            transform: person.imageZoom ? `scale(${person.imageZoom})` : undefined
          }}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108 group-hover:brightness-95"
          onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face" }}
        />
        {/* Hover overlay with social links */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
          <div className="flex gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            {person.linkedin && (
              <a 
                href={person.linkedin} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:bg-primary hover:scale-110 transition-all shadow-md"
                aria-label={`${person.name} LinkedIn`}
              >
                <FaLinkedin size={18} />
              </a>
            )}
            {person.email && (
              <a 
                href={`mailto:${person.email}`} 
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:bg-primary hover:scale-110 transition-all shadow-md"
                aria-label={`Email ${person.name}`}
              >
                <Mail size={18} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Side: Info */}
      <div className="p-6 flex flex-col flex-1 bg-white">
        <h3 className="text-xl font-bold mb-1 tracking-tight text-slate-900 group-hover:text-primary transition-colors">
          {person.name}
        </h3>
        <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3 font-mono">
          {person.role}
        </p>
        <p className="text-slate-600 text-xs md:text-sm leading-relaxed flex-1">
          {person.bio}
        </p>
      </div>
    </SpotlightCard>
  );
};

export default function People() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(".gsap-hero-title",
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }
    );
    gsap.fromTo(".gsap-hero-subtitle",
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.9, delay: 0.2, ease: "power3.out" }
    );

    const sections = gsap.utils.toArray(".gsap-section");
    sections.forEach((sec: any) => {
      const title = sec.querySelector(".gsap-section-title");
      const cards = sec.querySelectorAll(".gsap-reveal-card");

      ScrollTrigger.create({
        trigger: sec,
        start: "top 85%",
        onEnter: () => {
          if (title) {
            gsap.fromTo(title,
              { opacity: 0, y: 24 },
              { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }
            );
          }
          if (cards.length) {
            gsap.fromTo(cards,
              { opacity: 0, y: 40, scale: 0.96 },
              { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: "power2.out" }
            );
          }
        },
        once: true
      });
    });

  }, { scope: container });

  return (
    <>
      <Nav />
      <div className="block w-full min-h-screen pixel-grid-bg text-slate-900">
        <main ref={container} className="relative w-full overflow-x-hidden pt-32 pb-24">

          {/* HERO SECTION */}
          <section className="relative w-full flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto mb-24 pt-12">
            <div className="gsap-hero-title inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/6 text-primary text-xs md:text-sm font-bold tracking-widest uppercase mb-6 shadow-sm">
              <UserCheck size={14} /> The Leadership Team
            </div>
            <h1 className="gsap-hero-title text-5xl md:text-7xl font-black tracking-tighter mb-6 text-slate-900">
              Meet Our Leadership
            </h1>
            <p className="gsap-hero-subtitle text-lg md:text-xl text-slate-600 font-light max-w-2xl mx-auto">
              Passionate student leaders and faculty mentors driving innovation in AI and Machine Learning.
            </p>
          </section>

          {/* FACULTY SECTION */}
          <section className="gsap-section relative w-full max-w-7xl mx-auto px-6 mb-24">
            <div className="flex flex-col items-center mb-12">
              <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-widest mb-2">
                <Shield size={14} /> Faculty Mentors
              </div>
              <h2 className="gsap-section-title text-4xl md:text-5xl font-extrabold text-center text-slate-900">
                Faculty Leadership
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-cyan-400 mt-4 rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {faculty.map((person) => (
                <PersonCard key={person.name} person={person} />
              ))}
            </div>
          </section>

          {/* CORE TEAM SECTION */}
          <section className="gsap-section relative w-full max-w-7xl mx-auto px-6 mb-16">
            <div className="flex flex-col items-center mb-12">
              <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-widest mb-2">
                <Sparkles size={14} /> Student Executive Committee
              </div>
              <h2 className="gsap-section-title text-4xl md:text-5xl font-extrabold text-center text-slate-900">
                Core Team
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-cyan-400 mt-4 rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {team.map((person) => (
                <PersonCard key={person.name} person={person} />
              ))}
            </div>
          </section>

        </main>
      </div>
      <Footer />
    </>
  );
}

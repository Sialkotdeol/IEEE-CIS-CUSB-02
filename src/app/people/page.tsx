"use client";

import Nav from "@/components/dom/Nav";
import Footer from "@/components/dom/Footer";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { FaLinkedin } from "react-icons/fa";
import { Mail } from "lucide-react";

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
    bio: "Leading IEEE CIS CUSB with vision, vibes, and next-gen innovation—turning ideas into impact, no cap",
    image: "/yash.jpeg",
    linkedin: "https://www.linkedin.com/in/sharmayash2805/",
    email: "yashrgp@gmail.com"
  },
  {
    name: "Nirav Seth",
    role: "Vice Chair Person",
    bio: "Supporting the vision with strong execution while fostering collaboration and growth",
    image: "/nirav seth .jpeg",
    linkedin: "https://www.linkedin.com/in/nirav-seth-59812a303/",
    email: "sethnirav22@gmail.com",
    imagePosition: "center"
  },
  {
    name: "Laxmi Abhinaya Chunchu",
    role: "Secretary (General)",
    bio: "Ensuring smooth coordination, clear communication, and efficient execution across all responsibilities",
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
    bio: "Blending vision, discipline, and creativity to create work that actually matters",
    image: "/angad.jpeg",
    linkedin: "https://www.linkedin.com/in/angadveer-singh-deol-9b8b172b2/",
    email: "angaddeol11@gmail.com"
  },
  {
    name: "Anurag Kumar Shaw",
    role: "Treasurer",
    bio: "Dedicated to managing finances with precision, ensuring transparency, and fostering financial growth for impactful initiatives.",
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

const PersonCard = ({ person, className = "" }: { person: { name: string, role: string, bio: string, image: string, linkedin?: string, email?: string, imagePosition?: string, imageZoom?: number }, className?: string }) => {
  return (
    <div
      className={`gsap-reveal-card glass-panel rounded-3xl overflow-hidden group hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] flex flex-col h-full bg-[#0a0a0a]/60 ${className}`}
    >
      {/* Top Side: Photo */}
      <div className="relative h-72 w-full shrink-0 bg-white/5 overflow-hidden">
        <div className="w-full h-full transition-all duration-700 group-hover:scale-110 group-hover:brightness-75">
          <img
            src={person.image}
            alt={person.name}
            style={{
              objectPosition: person.imagePosition || 'center',
              transform: person.imageZoom ? `scale(${person.imageZoom})` : undefined
            }}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face" }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
          <div className="flex gap-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            {person.linkedin && (
              <a href={person.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary hover:scale-110 transition-all pointer-events-auto">
                <FaLinkedin size={18} />
              </a>
            )}
            {person.email && (
              <a href={`mailto:${person.email}`} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary hover:scale-110 transition-all pointer-events-auto">
                <Mail size={18} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Side: Info */}
      <div className="p-6 md:p-8 flex flex-col flex-1 bg-black/40 backdrop-blur-sm">
        <h3 className="text-2xl font-bold mb-1 tracking-tight text-white">{person.name}</h3>
        <p className="text-primary text-xs font-bold uppercase tracking-widest mb-4">{person.role}</p>
        <p className="text-white/60 text-sm leading-relaxed flex-1">{person.bio}</p>
      </div>
    </div>
  );
};

export default function People() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // ─── HERO ENTRY ANIMATIONS ───
    gsap.fromTo(".gsap-hero-title",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );
    gsap.fromTo(".gsap-hero-subtitle",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: "power3.out" }
    );

    // ─── SCROLL TRIGGER REVEALS ───
    const sections = gsap.utils.toArray(".gsap-section");

    sections.forEach((sec: any) => {
      const title = sec.querySelector(".gsap-section-title");
      const cards = sec.querySelectorAll(".gsap-reveal-card");

      ScrollTrigger.create({
        trigger: sec,
        start: "top 85%",
        onEnter: () => {
          // Reveal Title
          if (title) {
            gsap.fromTo(title,
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
            );
          }

          // Reveal Cards (Staggered Batch)
          if (cards.length) {
            gsap.fromTo(cards,
              { opacity: 0, y: 50, scale: 0.95 },
              { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }
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
      <div className="block w-full min-h-screen bg-[#050505]">
        <main ref={container} className="relative w-full overflow-x-hidden pt-32 pb-24">

          {/* HERO SECTION */}
          <section className="relative w-full flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto mb-32 pt-16">
            <div className="gsap-hero-title inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs md:text-sm font-semibold tracking-widest uppercase mb-6 shadow-[0_0_20px_rgba(99,102,241,0.2)] opacity-0">
              The Collective
            </div>
            <h1 className="gsap-hero-title text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-accent opacity-0">
              Meet Our Leadership
            </h1>
            <p className="gsap-hero-subtitle text-xl text-white/60 font-light max-w-2xl mx-auto opacity-0">
              Passionate individuals driving innovation in AI and machine learning.
            </p>
          </section>

          {/* FACULTY SECTION */}
          <section className="gsap-section relative w-full max-w-7xl mx-auto px-6 mb-32">
            <div className="flex flex-col items-center mb-16">
              <h2 className="gsap-section-title text-4xl md:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 opacity-0">
                Faculty Leadership
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-transparent mt-6 rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {faculty.map((person) => (
                <PersonCard key={person.name} person={person} className="opacity-0" />
              ))}
            </div>
          </section>

          {/* CORE TEAM SECTION */}
          <section className="gsap-section relative w-full max-w-7xl mx-auto px-6 mb-16">
            <div className="flex flex-col items-center mb-16">
              <h2 className="gsap-section-title text-4xl md:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 opacity-0">
                Core Team
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-transparent mt-6 rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {team.map((person) => (
                <PersonCard key={person.name} person={person} className="opacity-0" />
              ))}
            </div>
          </section>

        </main>
      </div>
      <Footer />
    </>
  );
}

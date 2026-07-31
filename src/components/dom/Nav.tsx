"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, section: string) => {
    if (pathname === "/") {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent(`scroll-to-${section}`));
    } else {
      handleNavigation(e, `/#${section}`);
    }
  };

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    if (pathname === href) return;

    // Trigger the loading screen to expand over the current page
    window.dispatchEvent(new CustomEvent("page-leave"));

    // Wait for the circle to fully expand (0.4s) before changing the actual page content
    setTimeout(() => {
      router.push(href);
    }, 400);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-black/50 backdrop-blur-xl border-b border-white/10 py-2" : "bg-transparent py-4"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link href="/" onClick={(e) => handleNavigation(e, "/")} className="flex items-center gap-2 sm:gap-3 z-50 shrink-0">
          <Image
            src="/CIS_Logo_removed_bg.png"
            alt="IEEE CIS Logo"
            width={80}
            height={80}
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain"
            priority
          />
          <span className="text-sm sm:text-base md:text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            IEEE CIS CUSB
          </span>
        </Link>

        {/* Responsive Nav Links */}
        <div className="flex items-center gap-3 sm:gap-5 md:gap-8">
          <Link href="/#about" onClick={(e) => handleScrollTo(e, "about")} className="text-[11px] xs:text-xs sm:text-sm md:text-base font-semibold text-white/70 hover:text-white transition-colors tracking-wide uppercase">ABOUT</Link>
          <Link href="/events" onClick={(e) => handleNavigation(e, "/events")} className="text-[11px] xs:text-xs sm:text-sm md:text-base font-semibold text-white/70 hover:text-white transition-colors tracking-wide uppercase">EVENTS</Link>
          <Link href="/people" onClick={(e) => handleNavigation(e, "/people")} className="text-[11px] xs:text-xs sm:text-sm md:text-base font-semibold text-white/70 hover:text-white transition-colors tracking-wide uppercase">TEAM</Link>
        </div>
      </div>
    </motion.nav>
  );
}

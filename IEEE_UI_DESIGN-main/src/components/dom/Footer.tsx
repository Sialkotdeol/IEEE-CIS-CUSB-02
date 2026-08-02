"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { FaLinkedin, FaInstagram } from "react-icons/fa";

export default function Footer() {



  return (
    <footer className="w-full relative z-10 bg-[#050505] border-t border-white/10 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              IEEE CIS CUSB
            </h3>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Computational Intelligence Society at Chandigarh University Student Branch. Advancing the theory and practice of computational intelligence worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-white/90">Quick Links</h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/" className="text-white/60 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-white/60 hover:text-white transition-colors text-sm">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/people" className="text-white/60 hover:text-white transition-colors text-sm">
                  Team
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-white/90">Resources</h4>
            <ul className="flex flex-col gap-2">
              <li><a href="https://standards.ieee.org/" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors text-sm">IEEE Standards</a></li>
              <li><a href="https://cis.ieee.org/" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors text-sm">IEEE CIS Global</a></li>
              <li><Link href="/faq" className="text-white/60 hover:text-white transition-colors text-sm">FAQs</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-white/90">Connect With Us</h4>
            <div className="flex gap-4">
              <a href="https://www.linkedin.com/company/ieeeciscusb/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-primary/20 hover:text-primary transition-all">
                <FaLinkedin size={18} />
              </a>
              <a href="https://www.instagram.com/ieee.cis.cusb" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-primary/20 hover:text-primary transition-all">
                <FaInstagram size={18} />
              </a>
              <a href="mailto:ieeeciscusb@gmail.com" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-primary/20 hover:text-primary transition-all">
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 text-sm text-white/40 gap-4">
          <p>© 2026 IEEE CIS CUSB. Made with ♥ for innovation.</p>
          <div className="flex gap-6">
            <a href="https://www.ieee.org/security-privacy.html" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Privacy</a>
            <a href="https://www.ieee.org/about/corporate/governance/p7-8.html" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

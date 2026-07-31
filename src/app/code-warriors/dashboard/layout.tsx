"use client";

import { useCodeWarriorsAuth } from "@/context/CodeWarriorsAuthContext";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Flame, Trophy, BarChart3, Award, Settings, LogOut, 
  Menu, X, LayoutDashboard, Crown, CalendarDays, Loader2
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useCodeWarriorsAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Guard routing
  useEffect(() => {
    if (!loading && !user) {
      router.push("/code-warriors");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#050505] text-white">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto" />
          <p className="text-white/60 font-medium">Entering the arena...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: "Overview", href: "/code-warriors/dashboard", icon: LayoutDashboard },
    { name: "Analytics", href: "/code-warriors/dashboard/analytics", icon: BarChart3 },
    { name: "Leaderboard", href: "/code-warriors/dashboard/leaderboard", icon: Trophy },
    { name: "Achievements", href: "/code-warriors/dashboard/achievements", icon: Award },
  ];

  // Add Admin item if admin
  if (user.is_admin) {
    navItems.push({ name: "Admin Dashboard", href: "/code-warriors/dashboard/admin", icon: Settings });
  }

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <div className="flex min-h-screen bg-[#050505] text-white relative">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] mix-blend-screen"></div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-white/[0.02] backdrop-blur-xl shrink-0 z-20">
        <div className="p-6 border-b border-white/5">
          <Link href="/code-warriors" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white group-hover:scale-105 transition-all">
              ⚔️
            </div>
            <div className="font-black text-lg leading-none">
              <span className="text-white">CODE</span>
              <br />
              <span className="text-indigo-400">WARRIORS</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm text-white">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold truncate leading-tight">{user.name}</p>
              <p className="text-xs text-white/50 truncate font-mono">@{user.leetcode_handle}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all font-semibold text-sm"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
              className="fixed inset-0 bg-black/60 z-30 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 bg-[#0a0a0a] border-r border-white/5 p-6 flex flex-col z-40 md:hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <Link href="/code-warriors" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">
                    ⚔️
                  </div>
                  <div className="font-black text-lg leading-none">
                    <span className="text-white">CODE</span>
                    <br />
                    <span className="text-indigo-400">WARRIORS</span>
                  </div>
                </Link>
                <button onClick={toggleMobileMenu} className="p-1 rounded-lg bg-white/5 hover:bg-white/10">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={toggleMobileMenu}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                        isActive 
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm text-white">
                    {user.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-semibold truncate">{user.name}</p>
                    <p className="text-[10px] text-white/50 truncate font-mono">@{user.leetcode_handle}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    toggleMobileMenu();
                    logout();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all font-semibold text-sm"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        {/* Mobile Header Bar */}
        <header className="flex md:hidden items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.01] backdrop-blur-md sticky top-0 z-20">
          <button onClick={toggleMobileMenu} className="p-2 -ml-2 rounded-lg hover:bg-white/5">
            <Menu className="w-6 h-6" />
          </button>
          <div className="font-bold text-center">
            <span className="text-white">CODE</span>{" "}
            <span className="text-indigo-400">WARRIORS</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs">
            {user.name.charAt(0)}
          </div>
        </header>

        {/* Global Dashboard Header (Desktop Only, fits well) */}
        <header className="hidden md:flex justify-between items-center px-10 py-6 border-b border-white/5 bg-white/[0.01]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome, {user.name.split(" ")[0]}!</h1>
            <p className="text-sm text-white/50">Ready to conquer today's coding challenge?</p>
          </div>

          {/* Mini Quick stats in header */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-2xl">
              <Flame className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
              <div>
                <p className="text-xs text-white/50 leading-none">STREAK</p>
                <p className="font-black text-lg leading-none">{user.current_streak} 🔥</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-2xl">
              <Crown className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-xs text-white/50 leading-none">RATING</p>
                <p className="font-black text-lg leading-none text-indigo-400">{user.lc_rating ?? "Unrated"}</p>
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

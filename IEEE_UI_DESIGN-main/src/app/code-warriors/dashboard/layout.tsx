"use client";

import { useCodeWarriorsAuth } from "@/context/CodeWarriorsAuthContext";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Flame, Trophy, BarChart3, Award, Settings, LogOut, 
  Menu, X, LayoutDashboard, Crown, Zap, Sparkles, Shield
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
      <div className="flex h-screen w-screen items-center justify-center gaming-bg-mesh">
        <div className="text-center space-y-5">
          {/* Pixel loading animation */}
          <div className="flex gap-2 justify-center">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-3.5 h-3.5 rounded-sm bg-primary shadow-[0_0_10px_#00629b]"
                style={{
                  animation: `pixel-pulse 0.8s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
          <p className="text-slate-600 font-mono text-sm tracking-widest uppercase font-bold">
            Entering Gaming Arena...
          </p>
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

  if (user.is_admin) {
    navItems.push({ name: "Admin Dashboard", href: "/code-warriors/dashboard/admin", icon: Settings });
  }

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  // XP estimate from streak & solves
  const totalPoints = (user.current_streak || 0) * 20 + (user.total_solved || 0) * 15;
  const level = Math.floor(totalPoints / 100) + 1;
  const xpPercent = Math.min((totalPoints % 100), 100);

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <>
      {/* Logo / Branding */}
      <div className="p-5 border-b border-slate-100/80">
        <Link
          href="/code-warriors"
          className="flex items-center gap-3 group"
          onClick={onClose}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-cyan-500 flex items-center justify-center font-bold text-white text-xl shadow-md group-hover:scale-105 transition-transform">
            ⚔️
          </div>
          <div className="leading-none">
            <p className="font-black text-base text-slate-900 tracking-tight">CODE</p>
            <p className="font-black text-base text-primary tracking-tight">WARRIORS</p>
          </div>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`dash-nav-item flex items-center gap-3 px-4 py-3 rounded-r-xl font-bold text-sm transition-all ${
                isActive
                  ? "dash-nav-active shadow-sm"
                  : "text-slate-500 hover:text-primary"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.name}
              {isActive && (
                <span className="ml-auto w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#00629b]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Card + XP Bar */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/80">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary via-cyan-500 to-indigo-600 flex items-center justify-center font-black text-sm text-white shadow-md relative">
            {user.name.charAt(0).toUpperCase()}
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-[8px] font-mono px-1 rounded text-slate-950 font-extrabold">
              L{level}
            </span>
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="font-extrabold text-sm truncate text-slate-900">{user.name}</p>
            <p className="text-[11px] text-slate-400 truncate font-mono">@{user.leetcode_handle}</p>
          </div>
          <Zap size={14} className="text-yellow-500 shrink-0 animate-pulse" />
        </div>

        {/* XP Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1 font-bold">
            <span>EXP TO LEVEL {level + 1}</span>
            <span>{Math.round(xpPercent)}%</span>
          </div>
          <div className="xp-bar-track">
            <div className="xp-bar-fill" style={{ width: `${xpPercent}%` }} />
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all font-bold text-xs text-slate-500 shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen gaming-bg-mesh text-slate-900 relative">

      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/6 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-400/8 rounded-full blur-[140px]" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-slate-200/80 bg-white/95 backdrop-blur-xl shrink-0 z-20 fixed top-0 left-0 h-screen shadow-md">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.28 }}
              className="fixed inset-y-0 left-0 w-60 bg-white border-r border-slate-200 flex flex-col z-40 md:hidden shadow-2xl"
            >
              <div className="flex justify-end p-3 border-b border-slate-100">
                <button onClick={toggleMobileMenu} className="p-1.5 rounded-lg hover:bg-slate-100">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <SidebarContent onClose={toggleMobileMenu} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 z-10 md:ml-60">

        {/* Mobile Header */}
        <header className="flex md:hidden items-center justify-between px-4 py-3.5 border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-20 shadow-sm">
          <button onClick={toggleMobileMenu} className="p-2 -ml-1 rounded-xl hover:bg-slate-100">
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <span className="font-black text-sm tracking-tight">
            <span className="text-slate-900">CODE </span>
            <span className="text-primary">WARRIORS</span>
          </span>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-cyan-400 flex items-center justify-center font-bold text-xs text-white shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex justify-between items-center px-8 py-5 border-b border-slate-200/80 bg-white/90 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-cyan-400 flex items-center justify-center font-black text-white shadow-md">
              LV{level}
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                Welcome back, <span className="gaming-text-gradient">{user.name.split(" ")[0]}</span>! ⚔️
              </h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5 font-bold">
                Ready to conquer today&apos;s coding quest?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Streak badge */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/80 px-4 py-2 rounded-2xl shadow-sm">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500 pixel-flame" />
              <div>
                <p className="text-[9px] text-orange-700 leading-none font-mono font-bold uppercase">STREAK</p>
                <p className="font-black text-base text-slate-900 leading-none mt-0.5">
                  {user.current_streak} <span className="text-orange-500">🔥</span>
                </p>
              </div>
            </div>
            {/* Rating badge */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-primary/5 to-cyan-50 border border-primary/20 px-4 py-2 rounded-2xl shadow-sm">
              <Crown className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-[9px] text-primary leading-none font-mono font-bold uppercase">RATING</p>
                <p className="font-black text-base text-primary leading-none mt-0.5">
                  {user.lc_rating ?? "Unrated"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-5 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

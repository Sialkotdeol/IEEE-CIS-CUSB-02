"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  KanbanSquare,
  Briefcase,
  CalendarDays,
  Award,
  Medal,
  MessageSquareText,
  ListTodo,
  FolderOpen,
  Table2,
  Repeat,
  Users,
  History,
  MonitorSmartphone,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon; owner?: boolean };

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: "Recruitment",
    items: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/applications", label: "Applicants", icon: KanbanSquare },
      { href: "/admin/recruitment", label: "Roles & window", icon: Briefcase },
    ],
  },
  {
    section: "Work",
    items: [
      { href: "/admin/tasks", label: "Tasks", icon: ListTodo },
      { href: "/admin/documents", label: "Event documents", icon: FolderOpen },
    ],
  },
  {
    section: "Events",
    items: [
      { href: "/admin/events", label: "Events & photos", icon: CalendarDays },
      { href: "/admin/certificates", label: "Certificates", icon: Award },
      { href: "/admin/badges", label: "Badges", icon: Medal },
      { href: "/admin/feedback", label: "Feedback forms", icon: MessageSquareText },
      { href: "/admin/registrations", label: "Registrations", icon: Table2 },
      { href: "/admin/participants", label: "Repeat participants", icon: Repeat },
    ],
  },
  {
    section: "Access",
    items: [
      { href: "/admin/team", label: "Team", icon: Users, owner: true },
      { href: "/admin/activity", label: "Activity log", icon: History, owner: true },
      { href: "/admin/sessions", label: "Sessions & account", icon: MonitorSmartphone },
    ],
  },
];

export default function AdminShell({
  email,
  name,
  role,
  children,
}: {
  email: string;
  name: string;
  role: "owner" | "reviewer";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const signOut = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  const nav = (
    <nav className="flex flex-col gap-6">
      {NAV.map((group) => {
        const items = group.items.filter((i) => !i.owner || role === "owner");
        if (!items.length) return null;
        return (
          <div key={group.section}>
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">{group.section}</p>
            <ul className="space-y-0.5">
              {items.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive(href) ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  const account = (
    <div className="border-t border-slate-200 pt-4 mt-6">
      <p className="px-3 text-sm font-bold text-slate-800 truncate">{name || email.split("@")[0]}</p>
      <p className="px-3 text-xs text-slate-500 truncate">{email}</p>
      <p className="px-3 mt-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded">{role}</span>
      </p>
      <button
        onClick={signOut}
        className="mt-3 w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <LogOut className="w-4 h-4" /> Sign out
      </button>
    </div>
  );

  return (
    <div className="lg:flex min-h-[100dvh]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-slate-200 bg-white px-3 py-5 sticky top-0 h-[100dvh] overflow-y-auto">
        <Link href="/admin" className="flex items-center gap-2 px-3 mb-8">
          <Image src="/CIS_Logo_removed_bg.png" alt="" width={36} height={36} className="w-9 h-9 object-contain" />
          <div>
            <p className="font-black text-slate-900 leading-tight">IEEE CIS CUSB</p>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Admin portal</p>
          </div>
        </Link>
        <div className="flex-1">{nav}</div>
        {account}
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/CIS_Logo_removed_bg.png" alt="" width={28} height={28} className="w-7 h-7 object-contain" />
          <span className="font-black text-slate-900">Admin</span>
        </Link>
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="p-2 rounded-lg hover:bg-slate-100">
          <Menu className="w-5 h-5" />
        </button>
      </header>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white px-3 py-5 overflow-y-auto flex flex-col">
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="self-end p-2 rounded-lg hover:bg-slate-100 mb-2">
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1">{nav}</div>
            {account}
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-6 lg:py-10">{children}</main>
    </div>
  );
}

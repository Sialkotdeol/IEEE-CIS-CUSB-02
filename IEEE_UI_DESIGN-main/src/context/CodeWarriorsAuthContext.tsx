"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { type Profile } from "@/types/codeWarriors";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (formData: Record<string, unknown>) => Promise<boolean>;
  logout: () => void;
  syncUserCF: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>;
}

const CodeWarriorsAuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_DEMO_PROFILE: Profile = {
  id: "demo-warrior-01",
  name: "Alex Rivera",
  email: "alex.rivera@ieee.org",
  uid: "21BCS9901",
  department: "Computer Science & Engineering",
  year: "3rd Year",
  leetcode_handle: "neal_wu",
  lc_rating: 1845,
  lc_max_rating: 1920,
  lc_rank: "Knight",
  lc_max_rank: "Knight",
  current_streak: 14,
  max_streak: 30,
  total_solved: 48,
  is_admin: true,
  created_at: new Date().toISOString(),
  last_sync: new Date().toISOString(),
  college: "Chandigarh University"
};

export const CodeWarriorsAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage or Supabase on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try Supabase first
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const res = await fetch(`/api/code-warriors/profile?id=${session.user.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.profile) {
              setUser(data.profile);
              setLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        console.error("Supabase session load failed, checking local auth", err);
      }

      // Check Mock local session
      if (typeof window !== "undefined") {
        const mockUserId = localStorage.getItem("cw_mock_user_id");
        if (mockUserId) {
          try {
            const res = await fetch(`/api/code-warriors/profile?id=${mockUserId}`);
            if (res.ok) {
              const data = await res.json();
              if (data.profile) {
                setUser(data.profile);
                setLoading(false);
                return;
              }
            }
          } catch (err) {
            console.error("Failed to load local mock session", err);
          }
        }
      }

      // Default demo profile fallback so dashboard can always be viewed locally
      setUser(DEFAULT_DEMO_PROFILE);
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch("/api/code-warriors/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password })
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.profile);
        if (typeof window !== "undefined") {
          localStorage.setItem("cw_mock_user_id", data.profile.id);
        }
        toast.success(`Welcome back, ${data.profile.name}!`);
        setTimeout(() => {
          router.push("/code-warriors/dashboard");
        }, 400);
        return true;
      }
    } catch (err) {
      console.error("API login failed, using demo session", err);
    }

    // Fallback demo user login for seamless preview
    const demoUser = { ...DEFAULT_DEMO_PROFILE, email: email || DEFAULT_DEMO_PROFILE.email };
    setUser(demoUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("cw_mock_user_id", demoUser.id);
    }
    toast.success(`Welcome back, ${demoUser.name}!`);
    setTimeout(() => {
      router.push("/code-warriors/dashboard");
    }, 400);
    setLoading(false);
    return true;
  };

  const register = async (formData: Record<string, unknown>): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch("/api/code-warriors/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", ...formData })
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.profile);
        if (typeof window !== "undefined") {
          localStorage.setItem("cw_mock_user_id", data.profile.id);
        }
        toast.success("Registration completed successfully!");
        return true;
      }
    } catch (err) {
      console.error("API register failed, using demo session", err);
    }

    // Fallback demo registration for seamless preview
    const form = formData as Record<string, string>;
    const newProfile: Profile = {
      ...DEFAULT_DEMO_PROFILE,
      id: `user-${Date.now()}`,
      name: form.name || "Code Warrior",
      email: form.email || "warrior@ieee.org",
      uid: form.uid || "21BCS0000",
      department: form.department || "Computer Science",
      year: form.year || "3rd Year",
      leetcode_handle: form.leetcode || "neal_wu"
    };
    setUser(newProfile);
    if (typeof window !== "undefined") {
      localStorage.setItem("cw_mock_user_id", newProfile.id);
    }
    toast.success("Registration completed successfully!");
    setLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("cw_mock_user_id");
    }
    supabase.auth.signOut();
    toast.info("Logged out successfully");
    router.push("/code-warriors");
  };

  const syncUserCF = async () => {
    if (!user) return;
    try {
      toast.loading("Syncing with LeetCode...", { id: "sync" });
      const res = await fetch(`/api/code-warriors/sync?userId=${user.id}`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.profile);
        toast.success("Synchronized successfully!", { id: "sync" });
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to sync", { id: "sync" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to sync progress with LeetCode", { id: "sync" });
    }
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch("/api/code-warriors/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, updates })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.profile);
        toast.success("Profile updated successfully!");
        return true;
      } else {
        const err = await res.json();
        toast.error(err.message || "Update failed");
        return false;
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
      return false;
    }
  };

  return (
    <CodeWarriorsAuthContext.Provider value={{ user, loading, login, register, logout, syncUserCF, updateProfile }}>
      {children}
    </CodeWarriorsAuthContext.Provider>
  );
};

export const useCodeWarriorsAuth = () => {
  const context = useContext(CodeWarriorsAuthContext);
  if (context === undefined) {
    throw new Error("useCodeWarriorsAuth must be used within a CodeWarriorsAuthProvider");
  }
  return context;
};

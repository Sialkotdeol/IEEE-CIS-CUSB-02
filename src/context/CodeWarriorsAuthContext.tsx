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
  register: (formData: any) => Promise<boolean>;
  logout: () => void;
  syncUserCF: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>;
}

const CodeWarriorsAuthContext = createContext<AuthContextType | undefined>(undefined);

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
            // Call API or directly load from codeWarriorsDb via a client fetching mechanism
            // Since we want this to be seamless, we'll fetch from local db via API or local JSON
            const res = await fetch(`/api/code-warriors/profile?id=${mockUserId}`);
            if (res.ok) {
              const data = await res.json();
              if (data.profile) {
                setUser(data.profile);
              }
            }
          } catch (err) {
            console.error("Failed to load local mock session", err);
          }
        }
      }
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
        }, 800);
        return true;
      } else {
        const err = await res.json();
        toast.error(err.message || "Login failed");
        return false;
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred during login.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData: any): Promise<boolean> => {
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
      } else {
        const err = await res.json();
        toast.error(err.message || "Registration failed");
        return false;
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred during registration.");
      return false;
    } finally {
      setLoading(false);
    }
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

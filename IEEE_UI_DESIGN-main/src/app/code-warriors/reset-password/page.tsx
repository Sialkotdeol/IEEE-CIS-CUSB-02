"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, KeyRound, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        setMessage("No reset token found in URL. The link may be broken or expired.");
        return;
      }

      try {
        const res = await fetch("/api/code-warriors/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "verify_reset_token", token })
        });
        const data = await res.json();
        
        if (data.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setMessage(data.message || "This password reset link has expired or is invalid.");
        }
      } catch (err) {
        setTokenValid(false);
        setMessage("A network error occurred while verifying the link.");
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/code-warriors/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_password_with_token",
          token,
          newPassword: password
        })
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("Your password has been reset successfully.");
        setTimeout(() => {
          router.push("/code-warriors");
        }, 2000);
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to reset password.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("A network error occurred. Please try again.");
    }
  };

  if (tokenValid === null) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-white/70">Verifying link...</p>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-6 py-6 rounded-xl flex flex-col items-center text-center gap-4">
        <AlertCircle className="w-10 h-10 shrink-0 text-red-500" />
        <p className="font-medium text-lg">{message}</p>
        <Link
          href="/code-warriors"
          className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  if (status === "success") {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold mb-3 text-white">Password Reset!</h3>
        <p className="text-white/60 mb-8 leading-relaxed">
          {message}<br />Redirecting you to the login page...
        </p>
        <Link
          href="/code-warriors"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md"
        >
          Go to Login
        </Link>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status === "error" && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{message}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">New Password <span className="text-red-500">*</span></label>
          <div className="relative">
            <input 
              required
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors pr-10"
              placeholder="Min 6 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">Confirm New Password <span className="text-red-500">*</span></label>
          <div className="relative">
            <input 
              required
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors pr-10"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 active:scale-[0.98] text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(79,70,229,0.3)]"
      >
        {status === "loading" ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5" /> Reset Password
          </div>
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white pt-32 pb-24 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none"></div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold tracking-widest uppercase mb-4">
            Security
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">Create New Password</h1>
          <p className="text-white/50 text-sm">Choose a strong password for your Code Warriors account.</p>
        </div>

        <div className="glass-panel rounded-3xl p-8 border border-white/10 bg-white/5 backdrop-blur-lg">
          <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

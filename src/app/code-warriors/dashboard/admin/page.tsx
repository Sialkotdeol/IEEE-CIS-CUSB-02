"use client";

import { useEffect, useState, Fragment } from "react";
import { useCodeWarriorsAuth } from "@/context/CodeWarriorsAuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, Settings, Users, CalendarDays, Megaphone,
  CheckCircle, PlusCircle, Trash2, ArrowRightLeft, Play, KeyRound, X, Link, Download
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user } = useCodeWarriorsAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [mentorApps, setMentorApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"potd" | "users" | "announcements" | "mentors">("potd");

  // Form States
  const [potdForm, setPotdForm] = useState({
    date: new Date().toISOString().split("T")[0], // default to today
    titleSlug: "",
    questionId: "",
    name: "",
    difficulty: "",
    tags: "",
    expectedSolveTime: "20"
  });

  const [annForm, setAnnForm] = useState({
    title: "",
    content: ""
  });

  const [triggeringSync, setTriggeringSync] = useState(false);
  const [resetTarget, setResetTarget] = useState<string | null>(null); // userId being reset
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  // LC URL Autofetch state
  const [lcUrl, setLcUrl] = useState("");
  const [fetchingUrl, setFetchingUrl] = useState(false);

  const fetchAdminData = async () => {
    try {
      const pRes = await fetch("/api/code-warriors/profile");
      if (pRes.ok) {
        const pData = await pRes.json();
        setProfiles(pData.profiles || []);
      }

      const prRes = await fetch("/api/code-warriors/problems");
      if (prRes.ok) {
        const prData = await prRes.json();
        setProblems(prData.problems || []);
      }

      const mRes = await fetch("/api/code-warriors/mentor");
      if (mRes.ok) {
        const mData = await mRes.json();
        setMentorApps(mData.applications || []);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
      toast.error("Failed to load administration controls.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.is_admin) {
      fetchAdminData();
    }
  }, [user]);

  if (!user?.is_admin) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <p className="text-red-400 font-bold text-lg">ACCESS DENIED</p>
        <p className="text-sm text-white/50 mt-1">You must be an administrator to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const handlePOTDSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!potdForm.date || !potdForm.titleSlug || !potdForm.name) {
      toast.error("Please fill in all required problem fields.");
      return;
    }

    try {
      const tagsArray = potdForm.tags ? potdForm.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
      const res = await fetch("/api/code-warriors/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: potdForm.date,
          titleSlug: potdForm.titleSlug,
          questionId: Number(potdForm.questionId) || 0,
          name: potdForm.name,
          difficulty: potdForm.difficulty || "Medium",
          tags: tagsArray,
          expectedSolveTime: Number(potdForm.expectedSolveTime) || 20
        })
      });

      if (res.ok) {
        toast.success("Daily problem scheduled successfully!");
        setPotdForm({
          date: new Date().toISOString().split("T")[0],
          titleSlug: "",
          questionId: "",
          name: "",
          difficulty: "",
          tags: "",
          expectedSolveTime: "20"
        });
        fetchAdminData();
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to schedule problem");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred scheduling the problem.");
    }
  };

  const handleUrlFetch = async () => {
    if (!lcUrl) return;
    
    // Support leetcode.com/problems/{slug} URL format
    const match = lcUrl.match(/leetcode\.com\/problems\/([a-z0-9-]+)/i);
    
    if (!match) {
      toast.error("Invalid LeetCode URL. Use a URL like: https://leetcode.com/problems/two-sum");
      return;
    }

    const titleSlug = match[1];

    setFetchingUrl(true);
    try {
      const res = await fetch(`/api/code-warriors/lc-problem?titleSlug=${titleSlug}`);
      if (!res.ok) {
        let errMsg = "API proxy request failed";
        try {
          const errData = await res.json();
          if (errData.message) errMsg = errData.message;
        } catch (e) {
          errMsg = `API proxy request failed with status ${res.status}`;
        }
        throw new Error(errMsg);
      }
      
      const data = await res.json();
      if (data.status !== "OK") throw new Error(data.message || "Failed to fetch problem");

      setPotdForm(prev => ({
        ...prev,
        titleSlug: data.result.titleSlug,
        questionId: (data.result.questionId || "").toString(),
        name: data.result.title || "",
        difficulty: data.result.difficulty || "Medium",
        tags: (data.result.tags || []).join(", ")
      }));
      toast.success("Problem details auto-filled!");
      setLcUrl("");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error fetching problem details. Please fill manually.");
    } finally {
      setFetchingUrl(false);
    }
  };

  const handleAnnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annForm.title || !annForm.content) {
      toast.error("Please fill in all announcement fields.");
      return;
    }

    try {
      const res = await fetch("/api/code-warriors/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: annForm.title,
          content: annForm.content,
          createdBy: user.name
        })
      });

      if (res.ok) {
        toast.success("Announcement broadcasted successfully!");
        setAnnForm({ title: "", content: "" });
      } else {
        const err = await res.json();
        toast.error(err.message || "Broadcast failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred broadcasting announcement.");
    }
  };

  const triggerGlobalSync = async () => {
    setTriggeringSync(true);
    toast.loading("Triggering background synchronization for all users...", { id: "global-sync" });
    try {
      const res = await fetch("/api/code-warriors/sync", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || "Sync completed successfully!", { id: "global-sync" });
        fetchAdminData();
      } else {
        toast.error("Synchronization failed.", { id: "global-sync" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error triggering sync.", { id: "global-sync" });
    } finally {
      setTriggeringSync(false);
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setResetting(true);
    try {
      const res = await fetch("/api/code-warriors/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "admin_reset_password", userId, newPassword, adminId: user.id })
      });
      if (res.ok) {
        toast.success("Password reset successfully!");
        setResetTarget(null);
        setNewPassword("");
      } else {
        const err = await res.json();
        toast.error(err.message || "Reset failed");
      }
    } catch (err) {
      toast.error("Error resetting password.");
    } finally {
      setResetting(false);
    }
  };

  // Compute stats
  const totalRegistered = profiles.length;
  const todayStr = new Date().toISOString().split("T")[0];
  const potdToday = problems.find(p => p.date === todayStr);

  const downloadCSV = () => {
    if (profiles.length === 0) {
      toast.error("No participants to download.");
      return;
    }
    
    const headers = ["Name", "Email", "Mobile", "LeetCode Handle", "UID", "Department", "Year", "College", "Section", "Referred By", "Total Solved", "LC Rating", "Current Streak"];
    
    const rows = profiles.map(p => [
      p.name || "",
      p.email || "",
      p.mobile || "",
      p.leetcode_handle || "",
      p.uid || "",
      p.department || "",
      p.year || "",
      p.college || "",
      p.section || "",
      p.referred_by || "",
      p.total_solved || 0,
      p.lc_rating || 0,
      p.current_streak || 0
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => {
        const cellString = String(cell).replace(/"/g, '""');
        return `"${cellString}"`;
      }).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "code_warriors_participants.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Download started!");
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black flex items-center gap-3">
            <Settings className="w-8 h-8 text-indigo-400" /> Admin Command Center
          </h2>
          <p className="text-sm text-white/50 mt-1">Manage problem assignments, broadcast notifications, and verify streaks</p>
        </div>

        <Button
          onClick={triggerGlobalSync}
          disabled={triggeringSync}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2"
        >
          <Play className="w-4 h-4" /> Trigger Global Sync
        </Button>
      </div>

      {/* Admin Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/[0.02] border-white/5 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-white/50 font-bold uppercase tracking-widest leading-none mb-1">Participants</p>
            <h3 className="text-2xl font-black">{totalRegistered} Users</h3>
          </div>
        </Card>

        <Card className="bg-white/[0.02] border-white/5 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-white/50 font-bold uppercase tracking-widest leading-none mb-1">POTD Status</p>
            <h3 className="text-2xl font-black truncate">{potdToday ? "POTD Active ✅" : "No Problem Today ⚠️"}</h3>
          </div>
        </Card>

        <Card className="bg-white/[0.02] border-white/5 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-white/50 font-bold uppercase tracking-widest leading-none mb-1">Active Streaks</p>
            <h3 className="text-2xl font-black">
              {profiles.filter(p => p.current_streak > 0).length} Streaks
            </h3>
          </div>
        </Card>
      </div>

      {/* Tab controls */}
      <Card className="bg-white/[0.02] border-white/5 rounded-3xl p-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-white/5 mb-8">
          <button
            onClick={() => setActiveSubTab("potd")}
            className={`pb-4 text-base font-bold transition-all relative px-4 ${
              activeSubTab === "potd" ? "text-indigo-400" : "text-white/50 hover:text-white"
            }`}
          >
            Assign POTD
          </button>
          <button
            onClick={() => setActiveSubTab("users")}
            className={`pb-4 text-base font-bold transition-all relative px-4 ${
              activeSubTab === "users" ? "text-indigo-400" : "text-white/50 hover:text-white"
            }`}
          >
            Participant Streaks
          </button>
          <button
            onClick={() => setActiveSubTab("announcements")}
            className={`pb-4 text-base font-bold transition-all relative px-4 ${
              activeSubTab === "announcements" ? "text-indigo-400" : "text-white/50 hover:text-white"
            }`}
          >
            Broadcast Announcement
          </button>
          <button
            onClick={() => setActiveSubTab("mentors")}
            className={`pb-4 text-base font-bold transition-all relative px-4 ${
              activeSubTab === "mentors" ? "text-indigo-400" : "text-white/50 hover:text-white"
            }`}
          >
            Mentor Applications
          </button>
        </div>

        {/* Tab 1: Schedule POTD */}
        {activeSubTab === "potd" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-1 space-y-6">
              <form onSubmit={handlePOTDSubmit} className="space-y-4">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-indigo-400" /> Schedule Problem
                </h3>

                {/* URL Autofetch Section */}
                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4 space-y-3 mb-4">
                  <label className="text-xs text-indigo-300 font-semibold flex items-center gap-1.5">
                    <Link className="w-3.5 h-3.5" /> Auto-fill from LeetCode URL
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://leetcode.com/problems/two-sum"
                      value={lcUrl}
                      onChange={e => setLcUrl(e.target.value)}
                      className="bg-black/20 border-white/10 rounded-xl text-sm"
                      onKeyDown={e => e.key === "Enter" && handleUrlFetch()}
                    />
                    <Button 
                      type="button"
                      onClick={handleUrlFetch}
                      disabled={fetchingUrl || !lcUrl}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl"
                    >
                      {fetchingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fetch"}
                    </Button>
                  </div>
                </div>

              
              <div className="space-y-1">
                <label className="text-xs text-white/60">Schedule Date</label>
                <Input
                  required
                  type="date"
                  value={potdForm.date}
                  onChange={e => setPotdForm({ ...potdForm, date: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-xl"
                />
              </div>
              {potdForm.titleSlug && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-indigo-300 font-semibold mb-1">Fetched Problem</p>
                      <p className="font-bold text-white text-base leading-tight">
                        {potdForm.name}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">
                      {potdForm.difficulty}
                    </span>
                  </div>
                  {potdForm.tags && (
                    <p className="text-xs text-white/50 truncate">
                      Tags: {potdForm.tags}
                    </p>
                  )}
                </div>
              )}
              <Button
                type="submit"
                disabled={!potdForm.titleSlug}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign POTD
              </Button>
            </form>
          </div>

            {/* List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-400" /> Upcoming & Past Problems
              </h3>
              
              <div className="overflow-x-auto border border-white/5 rounded-2xl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Problem</TableHead>
                      <TableHead className="text-center">Slug</TableHead>
                      <TableHead className="text-right">Difficulty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {problems.length > 0 ? (
                      problems.map((prob) => (
                        <TableRow key={prob.id} className="hover:bg-white/[0.01] border-b border-white/5">
                          <TableCell className="font-bold text-xs">{prob.date}</TableCell>
                          <TableCell className="text-sm font-semibold">{prob.name}</TableCell>
                          <TableCell className="text-center text-xs font-mono text-indigo-400">{prob.title_slug}</TableCell>
                          <TableCell className="text-right text-xs font-bold">{prob.difficulty}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-white/40 py-8">
                          No problems assigned yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "users" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" /> Participant Directory
              </h3>
              <Button
                onClick={downloadCSV}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 px-4 py-2 text-sm"
              >
                <Download className="w-4 h-4" /> Download Raw Sheet
              </Button>
            </div>

            <div className="overflow-x-auto border border-white/5 rounded-2xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>LC Handle</TableHead>
                    <TableHead className="text-center">Streak</TableHead>
                    <TableHead className="text-center">Solved</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map(p => (
                    <Fragment key={p.id}>
                      <TableRow className="hover:bg-white/[0.01] border-b border-white/5">
                        <TableCell>
                          <div>
                            <p className="font-semibold text-sm">{p.name}</p>
                            <p className="text-[11px] text-white/40">{p.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-indigo-400">@{p.leetcode_handle}</TableCell>
                        <TableCell className="text-center font-bold text-sm text-red-400">{p.current_streak} 🔥</TableCell>
                        <TableCell className="text-center font-mono text-indigo-400 text-sm">{p.total_solved}</TableCell>
                        <TableCell className="text-right font-mono text-sm font-bold">{p.lc_rating > 0 ? p.lc_rating : "Unrated"}</TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={() => {
                              if (resetTarget === p.id) {
                                setResetTarget(null);
                                setNewPassword("");
                              } else {
                                setResetTarget(p.id);
                                setNewPassword("");
                              }
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-colors"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            Reset Password
                          </button>
                        </TableCell>
                      </TableRow>

                      {/* Inline reset password form */}
                      {resetTarget === p.id && (
                        <TableRow key={`reset-${p.id}`} className="bg-amber-500/5 border-b border-amber-500/10">
                          <TableCell colSpan={6} className="py-4">
                            <div className="flex items-center gap-3 max-w-md">
                              <div className="flex-1">
                                <p className="text-xs text-amber-400 font-semibold mb-2">Set new password for {p.name}</p>
                                <input
                                  type="password"
                                  placeholder="New password (min 6 chars)"
                                  value={newPassword}
                                  onChange={e => setNewPassword(e.target.value)}
                                  onKeyDown={e => e.key === "Enter" && handleResetPassword(p.id)}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 transition-colors text-sm"
                                />
                              </div>
                              <div className="flex gap-2 mt-5">
                                <button
                                  onClick={() => handleResetPassword(p.id)}
                                  disabled={resetting}
                                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                >
                                  {resetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                                  Confirm Reset
                                </button>
                                <button
                                  onClick={() => { setResetTarget(null); setNewPassword(""); }}
                                  className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 font-bold text-xs transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Tab 3: Announcements */}
        {activeSubTab === "announcements" && (
          <form onSubmit={handleAnnSubmit} className="max-w-xl space-y-4">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-indigo-400" /> Broadcast System Announcements
            </h3>

            <div className="space-y-1">
              <label className="text-xs text-white/60">Announcement Title</label>
              <Input
                required
                value={annForm.title}
                placeholder="e.g. Contest Sync Issue Resolved!"
                onChange={e => setAnnForm({ ...annForm, title: e.target.value })}
                className="bg-white/5 border-white/10 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/60">Announcement Content</label>
              <textarea
                required
                rows={4}
                value={annForm.content}
                placeholder="Write message details for the participants ticker here..."
                onChange={e => setAnnForm({ ...annForm, content: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors text-sm"
              />
            </div>

            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl"
            >
              Broadcast Broadcast
            </Button>
          </form>
        )}

        {/* Tab 4: Mentor Applications */}
        {activeSubTab === "mentors" && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-indigo-400" /> Mentor Applications
            </h3>
            
            <div className="overflow-x-auto border border-white/5 rounded-2xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Academics</TableHead>
                    <TableHead>LC Handle</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mentorApps.length > 0 ? mentorApps.map(app => (
                    <TableRow key={app.id} className="hover:bg-white/[0.01] border-b border-white/5">
                      <TableCell>
                        <div>
                          <p className="font-semibold text-sm">{app.name}</p>
                          <p className="text-[11px] text-white/40">{app.email}</p>
                          <p className="text-[11px] text-white/40">{app.mobile}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-semibold">{app.department}</p>
                        <p className="text-xs text-white/50">{app.year}</p>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-indigo-400">@{app.leetcode_handle}</TableCell>
                      <TableCell>
                        <p className="text-xs text-white/60 max-w-xs truncate" title={app.experience}>{app.experience}</p>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {app.linkedin && (
                          <a href={app.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors">
                            LinkedIn
                          </a>
                        )}
                        <a href={app.resume_link} target="_blank" rel="noopener noreferrer" className="inline-flex text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-colors">
                          Resume &rarr;
                        </a>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-white/40 py-8">
                        No mentor applications yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

      </Card>
    </div>
  );
}

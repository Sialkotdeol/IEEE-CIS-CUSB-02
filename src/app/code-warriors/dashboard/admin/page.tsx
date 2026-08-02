"use client";

import { useEffect, useState, Fragment } from "react";
import { useCodeWarriorsAuth } from "@/context/CodeWarriorsAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, Settings, Users, CalendarDays, Megaphone,
  CheckCircle, PlusCircle, Play, KeyRound, X, Link, Download, Sparkles
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { SpotlightCard } from "@/components/ui/spotlight-card";

export default function AdminDashboard() {
  const { user } = useCodeWarriorsAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [mentorApps, setMentorApps] = useState<any[]>([]);
  const [practiceProblems, setPracticeProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"potd" | "practice" | "users" | "announcements" | "mentors">("potd");

  // Form States
  const [potdForm, setPotdForm] = useState({
    date: new Date().toISOString().split("T")[0],
    titleSlug: "",
    questionId: "",
    name: "",
    difficulty: "",
    tags: "",
    expectedSolveTime: "20"
  });

  const [practiceForm, setPracticeForm] = useState({
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
  const [resetTarget, setResetTarget] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  const [lcUrl, setLcUrl] = useState("");
  const [fetchingUrl, setFetchingUrl] = useState(false);

  const fetchAdminData = async () => {
    try {
      const pRes = await fetch("/api/code-warriors/profile", { cache: 'no-store' });
      if (pRes.ok) {
        const pData = await pRes.json();
        setProfiles(pData.profiles || []);
      }

      const prRes = await fetch("/api/code-warriors/problems");
      if (prRes.ok) {
        const prData = await prRes.json();
        setProblems(prData.problems || []);
      }

      const pracRes = await fetch("/api/code-warriors/practice-problems");
      if (pracRes.ok) {
        const pracData = await pracRes.json();
        setPracticeProblems(pracData.problems || []);
      }

      const mRes = await fetch("/api/code-warriors/mentor");
      if (mRes.ok) {
        const mData = await mRes.json();
        setMentorApps(mData.applications || []);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
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
        <p className="text-red-600 font-bold text-lg">ACCESS DENIED</p>
        <p className="text-sm text-slate-500 mt-1 font-mono">Administrator permissions required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
    const match = lcUrl.match(/leetcode\.com\/problems\/([a-z0-9-]+)/i);
    if (!match) {
      toast.error("Invalid LeetCode URL format.");
      return;
    }

    const titleSlug = match[1];
    setFetchingUrl(true);
    try {
      const res = await fetch(`/api/code-warriors/lc-problem?titleSlug=${titleSlug}`);
      if (!res.ok) throw new Error("API proxy failed");
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
      toast.error(err.message || "Error fetching problem details.");
    } finally {
      setFetchingUrl(false);
    }
  };

  const handlePracticeUrlFetch = async () => {
    if (!lcUrl) return;
    const match = lcUrl.match(/leetcode\.com\/problems\/([a-z0-9-]+)/i);
    if (!match) {
      toast.error("Invalid LeetCode URL format.");
      return;
    }

    const titleSlug = match[1];
    setFetchingUrl(true);
    try {
      const res = await fetch(`/api/code-warriors/lc-problem?titleSlug=${titleSlug}`);
      if (!res.ok) throw new Error("API proxy failed");
      const data = await res.json();
      if (data.status !== "OK") throw new Error(data.message || "Failed to fetch problem");

      setPracticeForm(prev => ({
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
      toast.error(err.message || "Error fetching problem details.");
    } finally {
      setFetchingUrl(false);
    }
  };

  const handlePracticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!practiceForm.titleSlug || !practiceForm.name) {
      toast.error("Please fill in all required problem fields.");
      return;
    }

    try {
      const tagsArray = practiceForm.tags ? practiceForm.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
      const res = await fetch("/api/code-warriors/practice-problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: {
            title_slug: practiceForm.titleSlug,
            question_id: Number(practiceForm.questionId) || 0,
            name: practiceForm.name,
            difficulty: practiceForm.difficulty || "Medium",
            tags: tagsArray,
            expected_solve_time: Number(practiceForm.expectedSolveTime) || 20
          }
        })
      });

      if (res.ok) {
        toast.success("Practice problem added successfully!");
        setPracticeForm({
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
        toast.error(err.message || "Failed to add practice problem");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred adding the problem.");
    }
  };

  const handlePracticeDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this practice problem?")) return;
    try {
      const res = await fetch(`/api/code-warriors/practice-problems?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Practice problem removed");
        fetchAdminData();
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to remove problem");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred removing the problem.");
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
    toast.loading("Triggering background synchronization...", { id: "global-sync" });
    try {
      const res = await fetch("/api/code-warriors/sync", { method: "POST" });
      if (res.ok) {
        toast.success("Sync completed successfully!", { id: "global-sync" });
        fetchAdminData();
      } else {
        toast.error("Synchronization failed.", { id: "global-sync" });
      }
    } catch (err) {
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

  const downloadCSV = () => {
    if (profiles.length === 0) return;
    const headers = ["Name", "Email", "Mobile", "LeetCode Handle", "UID", "Department", "Year", "Quests Solved", "CW Rating", "Current Streak"];
    const rows = profiles.map(p => [p.name, p.email, p.mobile, p.leetcode_handle, p.uid, p.department, p.year, p.quests_solved || 0, p.cw_rating || 0, p.current_streak || 0]);
    const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "code_warriors_participants.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Sheet downloaded!");
  };

  const totalRegistered = profiles.length;
  const todayStr = new Date().toISOString().split("T")[0];
  const potdToday = problems.find(p => p.date === todayStr);

  return (
    <div className="space-y-8 pb-16 text-slate-900">
      
      {/* Page Header */}
      <SpotlightCard glowHue={205} spotSize={300} borderSize={2} className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="quest-badge mb-2 inline-block">🛠️ ADMIN COMMAND CENTER</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              System Controls <Sparkles size={20} className="text-yellow-500 animate-pulse" />
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-mono mt-1 font-bold">
              Manage daily quest schedules, participant streaks, broadcasts, and mentor applications.
            </p>
          </div>

          <Button
            onClick={triggerGlobalSync}
            disabled={triggeringSync}
            className="bg-primary hover:bg-[#00527f] text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-md"
          >
            <Play className="w-4 h-4" /> Global Sync
          </Button>
        </div>
      </SpotlightCard>

      {/* Admin Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SpotlightCard glowHue={205} spotSize={220} borderSize={2} className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest leading-none mb-1">REGISTERED PARTICIPANTS</p>
            <h3 className="text-2xl font-black text-slate-900">{totalRegistered} Warriors</h3>
          </div>
        </SpotlightCard>

        <SpotlightCard glowHue={205} spotSize={220} borderSize={2} className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-200 flex items-center justify-center text-orange-600">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest leading-none mb-1">TODAY'S QUEST STATUS</p>
            <h3 className="text-xl font-black text-slate-900 truncate">{potdToday ? "Quest Scheduled ✅" : "No Quest Today ⚠️"}</h3>
          </div>
        </SpotlightCard>

        <SpotlightCard glowHue={205} spotSize={220} borderSize={2} className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest leading-none mb-1">ACTIVE STREAKS</p>
            <h3 className="text-2xl font-black text-slate-900">
              {profiles.filter(p => p.current_streak > 0).length} Warriors
            </h3>
          </div>
        </SpotlightCard>
      </div>

      {/* Main Admin Tab controls */}
      <SpotlightCard glowHue={205} spotSize={300} borderSize={2} className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-md">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
          {[
            { id: "potd", label: "Assign Daily Quest" },
            { id: "practice", label: "Assign Practice Quest" },
            { id: "users", label: "Participant Directory" },
            { id: "announcements", label: "Broadcast Ticker" },
            { id: "mentors", label: "Mentor Applications" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`pb-4 text-sm font-extrabold transition-all relative px-4 whitespace-nowrap ${
                activeSubTab === tab.id 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-slate-400 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Schedule POTD */}
        {activeSubTab === "potd" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <form onSubmit={handlePOTDSubmit} className="space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 mb-4 flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-primary" /> Schedule Quest
                </h3>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <label className="text-xs text-slate-600 font-mono font-bold flex items-center gap-1.5 uppercase">
                    <Link className="w-3.5 h-3.5 text-primary" /> Auto-fill from LeetCode URL
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://leetcode.com/problems/two-sum"
                      value={lcUrl}
                      onChange={e => setLcUrl(e.target.value)}
                      className="bg-white border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                    <Button 
                      type="button"
                      onClick={handleUrlFetch}
                      disabled={fetchingUrl || !lcUrl}
                      className="bg-primary hover:bg-[#00527f] text-white rounded-xl text-xs font-bold"
                    >
                      {fetchingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fetch"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-slate-500">Schedule Date</label>
                  <Input
                    required
                    type="date"
                    value={potdForm.date}
                    onChange={e => setPotdForm({ ...potdForm, date: e.target.value })}
                    className="bg-slate-50 border-slate-200 rounded-xl text-slate-900 font-mono text-sm"
                  />
                </div>

                {potdForm.titleSlug && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
                    <p className="text-[10px] text-primary font-mono font-bold uppercase">Fetched Problem</p>
                    <p className="font-bold text-slate-900 text-sm">{potdForm.name}</p>
                    <p className="text-xs text-slate-500 font-mono">Difficulty: {potdForm.difficulty}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={!potdForm.titleSlug}
                  className="w-full bg-primary hover:bg-[#00527f] text-white font-black py-3 rounded-xl mt-4 disabled:opacity-50 text-sm uppercase tracking-wider"
                >
                  Schedule Quest
                </Button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 mb-4 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" /> Quest Schedule
              </h3>
              
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <Table>
                  <TableHeader className="bg-slate-50 border-b border-slate-200">
                    <TableRow>
                      <TableHead className="font-bold text-slate-700">Date</TableHead>
                      <TableHead className="font-bold text-slate-700">Problem Name</TableHead>
                      <TableHead className="text-center font-bold text-slate-700">Slug</TableHead>
                      <TableHead className="text-right font-bold text-slate-700">Difficulty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {problems.length > 0 ? (
                      problems.map((prob) => (
                        <TableRow key={prob.id} className="hover:bg-slate-50 border-b border-slate-100">
                          <TableCell className="font-bold text-xs font-mono">{prob.date}</TableCell>
                          <TableCell className="text-xs font-extrabold text-slate-900">{prob.name}</TableCell>
                          <TableCell className="text-center text-xs font-mono text-primary">{prob.title_slug}</TableCell>
                          <TableCell className="text-right text-xs font-bold font-mono">{prob.difficulty}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-slate-400 py-8 text-xs font-mono">
                          No scheduled problems found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Practice Quests */}
        {activeSubTab === "practice" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <form onSubmit={handlePracticeSubmit} className="space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 mb-4 flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-primary" /> Assign Practice
                </h3>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <label className="text-xs text-slate-600 font-mono font-bold flex items-center gap-1.5 uppercase">
                    <Link className="w-3.5 h-3.5 text-primary" /> Auto-fill from LeetCode URL
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://leetcode.com/problems/two-sum"
                      value={lcUrl}
                      onChange={e => setLcUrl(e.target.value)}
                      className="bg-white border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                    <Button 
                      type="button"
                      onClick={handlePracticeUrlFetch}
                      disabled={fetchingUrl || !lcUrl}
                      className="bg-primary hover:bg-[#00527f] text-white rounded-xl text-xs font-bold"
                    >
                      {fetchingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fetch"}
                    </Button>
                  </div>
                </div>

                {practiceForm.titleSlug && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
                    <p className="text-[10px] text-primary font-mono font-bold uppercase">Fetched Problem</p>
                    <p className="font-bold text-slate-900 text-sm">{practiceForm.name}</p>
                    <p className="text-xs text-slate-500 font-mono">Difficulty: {practiceForm.difficulty}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={!practiceForm.titleSlug}
                  className="w-full bg-primary hover:bg-[#00527f] text-white font-black py-3 rounded-xl mt-4 disabled:opacity-50 text-sm uppercase tracking-wider"
                >
                  Add Practice Quest
                </Button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 mb-4 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" /> Recommended Practice Quests
              </h3>
              
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <Table>
                  <TableHeader className="bg-slate-50 border-b border-slate-200">
                    <TableRow>
                      <TableHead className="font-bold text-slate-700">Problem Name</TableHead>
                      <TableHead className="text-center font-bold text-slate-700">Slug</TableHead>
                      <TableHead className="text-center font-bold text-slate-700">Difficulty</TableHead>
                      <TableHead className="text-right font-bold text-slate-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {practiceProblems.length > 0 ? (
                      practiceProblems.map((prob) => (
                        <TableRow key={prob.id} className="hover:bg-slate-50 border-b border-slate-100">
                          <TableCell className="text-xs font-extrabold text-slate-900">{prob.name}</TableCell>
                          <TableCell className="text-center text-xs font-mono text-primary">{prob.title_slug}</TableCell>
                          <TableCell className="text-center text-xs font-bold font-mono">{prob.difficulty}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handlePracticeDelete(prob.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-slate-400 py-8 text-xs font-mono">
                          No practice problems found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Participant Directory */}
        {activeSubTab === "users" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Participant Directory
              </h3>
              <Button
                onClick={downloadCSV}
                className="bg-primary hover:bg-[#00527f] text-white font-bold rounded-xl flex items-center gap-2 px-4 py-2 text-xs uppercase"
              >
                <Download className="w-4 h-4" /> Export CSV Sheet
              </Button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <Table>
                <TableHeader className="bg-slate-50 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">Participant</TableHead>
                    <TableHead className="font-bold text-slate-700">LC Handle</TableHead>
                    <TableHead className="text-center font-bold text-slate-700">Streak</TableHead>
                    <TableHead className="text-center font-bold text-slate-700">Solved</TableHead>
                    <TableHead className="text-right font-bold text-slate-700">Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map(p => (
                    <TableRow key={p.id} className="hover:bg-slate-50 border-b border-slate-100">
                      <TableCell>
                        <p className="font-extrabold text-xs text-slate-900">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{p.email}</p>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold text-primary">@{p.leetcode_handle}</TableCell>
                      <TableCell className="text-center font-black text-xs text-orange-600">{p.current_streak}d 🔥</TableCell>
                      <TableCell className="text-center font-mono text-primary text-xs font-black">{p.quests_solved}</TableCell>
                      <TableCell className="text-right font-mono text-xs font-bold">{p.cw_rating > 0 ? p.cw_rating : "Unrated"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Tab 3: Broadcast Ticker */}
        {activeSubTab === "announcements" && (
          <form onSubmit={handleAnnSubmit} className="max-w-xl space-y-4 text-slate-900">
            <h3 className="font-extrabold text-base mb-4 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary" /> Broadcast Guild Ticker
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-slate-500 uppercase">Title</label>
              <Input
                required
                value={annForm.title}
                placeholder="e.g. 🚀 POTD Quest #14 is Live!"
                onChange={e => setAnnForm({ ...annForm, title: e.target.value })}
                className="bg-slate-50 border-slate-200 rounded-xl text-slate-900 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-slate-500 uppercase">Content</label>
              <textarea
                required
                rows={4}
                value={annForm.content}
                placeholder="Write guild announcement content..."
                onChange={e => setAnnForm({ ...annForm, content: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary transition-colors text-sm"
              />
            </div>

            <Button
              type="submit"
              className="bg-primary hover:bg-[#00527f] text-white font-black py-3 px-8 rounded-xl text-xs uppercase tracking-widest shadow-md"
            >
              Broadcast Ticker
            </Button>
          </form>
        )}

        {/* Tab 4: Mentors */}
        {activeSubTab === "mentors" && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-base flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" /> Mentor Applications
            </h3>
            
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <Table>
                <TableHeader className="bg-slate-50 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">Applicant</TableHead>
                    <TableHead className="font-bold text-slate-700">Academics</TableHead>
                    <TableHead className="font-bold text-slate-700">LC Handle</TableHead>
                    <TableHead className="text-right font-bold text-slate-700">Resume Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mentorApps.length > 0 ? mentorApps.map(app => (
                    <TableRow key={app.id} className="hover:bg-slate-50 border-b border-slate-100">
                      <TableCell>
                        <p className="font-bold text-xs text-slate-900">{app.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{app.email}</p>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 font-medium">{app.department} ({app.year})</TableCell>
                      <TableCell className="font-mono text-xs text-primary font-bold">@{app.leetcode_handle}</TableCell>
                      <TableCell className="text-right">
                        <a href={app.resume_link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary hover:underline">
                          View Resume &rarr;
                        </a>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-slate-400 py-8 text-xs font-mono">
                        No mentor applications submitted yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

      </SpotlightCard>
    </div>
  );
}

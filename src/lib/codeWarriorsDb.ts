import { supabase } from "./supabase";
import {
  Profile,
  DailyProblem,
  PracticeProblem,
  Submission,
  Badge,
  UserBadge,
  Announcement,
  MentorApplication
} from "@/types/codeWarriors";

export type { Profile, DailyProblem, Submission, Badge, UserBadge, Announcement, MentorApplication };

// Main Database Client (Supabase Only)
export const codeWarriorsDb = {
  // Profiles
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("code_warriors_profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) {
      if (error.code !== 'PGRST116') {
        console.error("Error getting profile:", error);
      }
      return null;
    }
    return data;
  },

  async getProfileByHandle(handle: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("code_warriors_profiles")
      .select("*")
      .eq("leetcode_handle", handle)
      .limit(1);
    if (error) {
      console.error("Error getting profile by handle:", error);
      return null;
    }
    return data && data.length > 0 ? data[0] : null;
  },

  async getProfileByEmail(email: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("code_warriors_profiles")
      .select("*")
      .ilike("email", email)
      .limit(1);
    if (error) {
      console.error("Error getting profile by email:", error);
      return null;
    }
    return data && data.length > 0 ? data[0] : null;
  },

  async saveProfile(profile: Profile): Promise<Profile> {
    const { data, error } = await supabase
      .from("code_warriors_profiles")
      .upsert(profile)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Daily Problems
  async getDailyProblem(date: string): Promise<DailyProblem | null> {
    const { data, error } = await supabase
      .from("code_warriors_daily_problems")
      .select("*")
      .eq("date", date)
      .single();
    if (error) {
      if (error.code !== 'PGRST116') {
        console.error("Error getting daily problem:", error);
      }
      return null;
    }
    return data;
  },

  async getDailyProblems(): Promise<DailyProblem[]> {
    const { data, error } = await supabase
      .from("code_warriors_daily_problems")
      .select("*")
      .order("date", { ascending: false });
    if (error) {
      console.error("Error getting daily problems:", error);
      return [];
    }
    return data;
  },

  async saveDailyProblem(problem: DailyProblem): Promise<DailyProblem> {
    const { data, error } = await supabase
      .from("code_warriors_daily_problems")
      .upsert(problem)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Practice Problems
  async getPracticeProblems(): Promise<PracticeProblem[]> {
    const { data, error } = await supabase
      .from("code_warriors_practice_problems")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error getting practice problems:", error);
      return [];
    }
    return data;
  },

  async savePracticeProblem(problem: PracticeProblem): Promise<PracticeProblem> {
    const { data, error } = await supabase
      .from("code_warriors_practice_problems")
      .upsert(problem)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deletePracticeProblem(id: string): Promise<void> {
    const { error } = await supabase
      .from("code_warriors_practice_problems")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  // Submissions
  async getSubmissions(userId: string): Promise<Submission[]> {
    const { data, error } = await supabase
      .from("code_warriors_submissions")
      .select("*")
      .eq("user_id", userId)
      .order("creation_time", { ascending: false });
    if (error) {
      console.error("Error getting submissions:", error);
      return [];
    }
    return data;
  },

  async getRecentGuildActivity(): Promise<any[]> {
    const { data, error } = await supabase
      .from("code_warriors_submissions")
      .select("*, profile:user_id(name, leetcode_handle)")
      .eq("is_potd", true)
      .order("creation_time", { ascending: false })
      .limit(15);
    if (error) {
      console.error("Error getting guild activity:", error);
      return [];
    }
    return data;
  },

  async saveSubmissions(submissions: Submission[]): Promise<void> {
    if (!submissions || submissions.length === 0) return;
    const { error } = await supabase.from("code_warriors_submissions").upsert(submissions);
    if (error) throw error;
  },

  // Badges & User Badges
  async getBadges(): Promise<Badge[]> {
    const { data, error } = await supabase.from("code_warriors_badges").select("*");
    if (error) {
      console.error("Error getting badges:", error);
      return [];
    }
    return data;
  },

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    const { data, error } = await supabase
      .from("code_warriors_user_badges")
      .select("*")
      .eq("user_id", userId);
    if (error) {
      console.error("Error getting user badges:", error);
      return [];
    }
    return data;
  },

  async unlockBadge(userId: string, badgeId: string): Promise<void> {
    const { error } = await supabase.from("code_warriors_user_badges").insert({
      user_id: userId,
      badge_id: badgeId,
      unlocked_at: new Date().toISOString()
    });
    if (error) {
      if (error.code !== '23505') { // 23505 is unique violation, ignore if already unlocked
        console.error("Error unlocking badge:", error);
      }
    }
  },

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabase
      .from("code_warriors_announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error getting announcements:", error);
      return [];
    }
    return data;
  },

  async saveAnnouncement(announcement: Announcement): Promise<Announcement> {
    const { data, error } = await supabase
      .from("code_warriors_announcements")
      .upsert(announcement)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // General list of all profiles (for leaderboard/admin)
  async getProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase.from("code_warriors_profiles").select("*");
    if (error) {
      console.error("Error getting profiles:", error);
      return [];
    }
    return data;
  },

  // Mentor Applications
  async getMentorApplications(): Promise<MentorApplication[]> {
    const { data, error } = await supabase
      .from("code_warriors_mentor_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error getting mentor applications:", error);
      return [];
    }
    return data;
  },

  async saveMentorApplication(application: MentorApplication): Promise<MentorApplication> {
    const { data, error } = await supabase
      .from("code_warriors_mentor_applications")
      .upsert(application)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

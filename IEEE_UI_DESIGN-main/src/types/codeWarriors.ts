export interface Profile {
  id: string;
  name: string;
  email: string;
  uid: string;
  department: string;
  year: string;
  leetcode_handle: string;
  linkedin_profile?: string;
  avatar_url?: string;
  lc_rating: number;
  lc_max_rating: number;
  lc_rank: string;
  lc_max_rank: string;
  current_streak: number;
  max_streak: number;
  total_solved: number;
  last_sync?: string;
  is_admin: boolean;
  created_at: string;
  college?: string;
  section?: string;
  referred_by?: string;
  mobile?: string;
  password_hash?: string; // stored server-side only, never sent to client
}

export interface DailyProblem {
  id: string;
  date: string; // YYYY-MM-DD
  title_slug: string;
  question_id: number;
  name: string;
  difficulty: string; // "Easy" | "Medium" | "Hard"
  tags: string[];
  points?: number;
  expected_solve_time?: number;
  created_at: string;
}

export interface Submission {
  id: string;
  user_id: string;
  lc_submission_id: number;
  title_slug: string;
  problem_name: string;
  difficulty: string; // "Easy" | "Medium" | "Hard"
  creation_time: string;
  verdict: string;
  programming_language: string;
  is_potd: boolean;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: "streak" | "solves" | "rating";
  requirement_value: number;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  unlocked_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
}

export interface MentorApplication {
  id: string;
  name: string;
  email: string;
  uid: string;
  department: string;
  year: string;
  mobile: string;
  resume_link: string;
  experience: string;
  linkedin: string;
  leetcode_handle: string;
  created_at: string;
}

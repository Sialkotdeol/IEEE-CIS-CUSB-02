// Call for Positions — fallback data.
// Roles, open/close and the deadline are managed from the admin portal (/admin/recruitment),
// which stores them in Supabase. This file is only used until supabase/admin_portal.sql
// has been run, and as the seed for the `positions` table.

export type PositionCategory = "Executive" | "Technical" | "Creative" | "Operations";

export interface Position {
  id: string;
  title: string;
  category: PositionCategory;
  openings: number;
  summary: string;
  responsibilities: string[];
  eligibility: string;
}

// Set to false to close the form without taking the page down.
export const APPLICATIONS_OPEN = true;

// ISO timestamp (e.g. "2026-10-15T23:59:00+05:30") or null to hide the deadline.
// Once the deadline passes, the form closes automatically.
export const APPLICATION_DEADLINE: string | null = null;

export const TENURE = "2026–27";

export const POSITIONS: Position[] = [
  {
    id: "chairperson",
    title: "Chairperson",
    category: "Executive",
    openings: 1,
    summary: "Lead the chapter, set the yearly vision, and represent IEEE CIS CUSB at branch and section level.",
    responsibilities: [
      "Plan the annual roadmap of events and initiatives",
      "Coordinate all team leads and run core meetings",
      "Liaise with faculty advisors and the IEEE CUSB branch",
    ],
    eligibility: "3rd/4th year, active IEEE CIS member with prior chapter experience",
  },
  {
    id: "vice-chairperson",
    title: "Vice Chairperson",
    category: "Executive",
    openings: 1,
    summary: "Support the Chair in running the chapter and take ownership of cross-team execution.",
    responsibilities: [
      "Track progress of events and team deliverables",
      "Step in for the Chair when required",
      "Mentor junior members and coordinators",
    ],
    eligibility: "2nd year and above, IEEE member preferred",
  },
  {
    id: "general-secretary",
    title: "General Secretary",
    category: "Executive",
    openings: 1,
    summary: "Own documentation, reporting, and official communication for the chapter.",
    responsibilities: [
      "Maintain meeting minutes and event reports",
      "Submit activity reports to IEEE (vTools)",
      "Draft official letters and permissions",
    ],
    eligibility: "2nd year and above, strong written communication",
  },
  {
    id: "treasurer",
    title: "Treasurer",
    category: "Executive",
    openings: 1,
    summary: "Manage the chapter budget, sponsorships, and financial records.",
    responsibilities: [
      "Prepare event budgets and track expenses",
      "Maintain transparent financial records",
      "Coordinate with sponsors on funding",
    ],
    eligibility: "2nd year and above, detail-oriented",
  },
  {
    id: "technical-lead",
    title: "Technical Lead",
    category: "Technical",
    openings: 2,
    summary: "Drive technical workshops, hackathons, and CI/ML projects run by the chapter.",
    responsibilities: [
      "Design and deliver workshops on AI, ML, and CI topics",
      "Mentor project teams in the Innovators Hub",
      "Set problem statements for technical events",
    ],
    eligibility: "Solid grasp of ML/DL or software development; portfolio or GitHub required",
  },
  {
    id: "webmaster",
    title: "Webmaster",
    category: "Technical",
    openings: 1,
    summary: "Maintain and extend the chapter website and internal tools like Code Warriors.",
    responsibilities: [
      "Ship features and fixes on the Next.js site",
      "Manage Supabase data and deployments",
      "Keep event pages and registrations up to date",
    ],
    eligibility: "Experience with React/Next.js; GitHub profile required",
  },
  {
    id: "design-lead",
    title: "Design Lead",
    category: "Creative",
    openings: 1,
    summary: "Own the chapter's visual identity across posters, social, and the website.",
    responsibilities: [
      "Design event posters, certificates, and banners",
      "Maintain brand consistency across platforms",
      "Guide and review work from design volunteers",
    ],
    eligibility: "Portfolio (Figma, Canva, Illustrator or similar) required",
  },
  {
    id: "content-lead",
    title: "Content & Editorial Lead",
    category: "Creative",
    openings: 1,
    summary: "Write captions, newsletters, blogs, and event write-ups that tell the chapter's story.",
    responsibilities: [
      "Write social captions and event announcements",
      "Edit the chapter newsletter and blog posts",
      "Proofread official communication",
    ],
    eligibility: "Writing samples preferred",
  },
  {
    id: "social-media-lead",
    title: "Social Media Lead",
    category: "Creative",
    openings: 1,
    summary: "Grow the chapter's presence on Instagram and LinkedIn.",
    responsibilities: [
      "Plan and schedule the content calendar",
      "Cover events live with stories and reels",
      "Track engagement and suggest improvements",
    ],
    eligibility: "Comfortable with Instagram/LinkedIn content creation",
  },
  {
    id: "pr-outreach-lead",
    title: "PR & Outreach Lead",
    category: "Operations",
    openings: 1,
    summary: "Build partnerships with other chapters, communities, speakers, and sponsors.",
    responsibilities: [
      "Reach out to speakers and industry partners",
      "Coordinate collaborations with other IEEE chapters",
      "Promote events across campus",
    ],
    eligibility: "Strong communication and networking skills",
  },
  {
    id: "event-management-lead",
    title: "Event Management Lead",
    category: "Operations",
    openings: 2,
    summary: "Plan and run the logistics behind every chapter event.",
    responsibilities: [
      "Book venues and handle permissions",
      "Coordinate volunteers on event day",
      "Manage registrations, attendance, and feedback",
    ],
    eligibility: "Prior event volunteering experience preferred",
  },
  {
    id: "membership-coordinator",
    title: "Membership Development Coordinator",
    category: "Operations",
    openings: 1,
    summary: "Grow IEEE and CIS membership and help new members get the most out of it.",
    responsibilities: [
      "Run membership drives and help desks",
      "Guide students through the IEEE joining process",
      "Track and report membership numbers",
    ],
    eligibility: "IEEE member preferred",
  },
];

export const POSITION_CATEGORIES: PositionCategory[] = ["Executive", "Technical", "Creative", "Operations"];

export interface RecruitmentSettings {
  open: boolean;
  deadline: string | null;
  tenure: string;
}

export const DEFAULT_RECRUITMENT: RecruitmentSettings = {
  open: APPLICATIONS_OPEN,
  deadline: APPLICATION_DEADLINE,
  tenure: TENURE,
};

export function isApplicationWindowOpen(settings: RecruitmentSettings = DEFAULT_RECRUITMENT, now: Date = new Date()): boolean {
  if (!settings.open) return false;
  if (!settings.deadline) return true;
  return now.getTime() <= new Date(settings.deadline).getTime();
}

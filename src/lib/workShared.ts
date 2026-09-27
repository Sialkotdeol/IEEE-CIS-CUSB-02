// Task and event-document constants shared by the portal UI and API.

export const DOC_TYPES = {
  report: "Event report",
  m2m: "Minutes of meeting (M2M)",
  attendance: "Attendance sheet",
  budget: "Budget & bills",
  permission: "Permission letter",
  media: "Photos & media",
  other: "Other",
} as const;
export type DocType = keyof typeof DOC_TYPES;
export const DOC_TYPE_KEYS = Object.keys(DOC_TYPES) as [DocType, ...DocType[]];

/** Documents every event is expected to have; missing ones show up in the collection tracker. */
export const REQUIRED_DOCS: DocType[] = ["report", "m2m", "attendance"];

export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];
export const STATUS_LABELS: Record<TaskStatus, string> = { todo: "To do", in_progress: "In progress", done: "Done" };

export const PRIORITIES = ["low", "normal", "high"] as const;
export type Priority = (typeof PRIORITIES)[number];

/** "general" stands for documents/tasks not tied to one event. */
export const GENERAL = "general";

export const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "csv", "ppt", "pptx", "txt", "png", "jpg", "jpeg", "zip"];
export const MAX_DOC_BYTES = 25 * 1024 * 1024;

export interface Task {
  id: string;
  title: string;
  description: string;
  event_slug: string | null;
  assignee_email: string | null;
  due_date: string | null;
  status: TaskStatus;
  priority: Priority;
  deliverable: DocType | null;
  created_by: string;
  created_at: string;
  completed_at: string | null;
}

export interface EventDocument {
  id: string;
  event_slug: string | null;
  doc_type: DocType;
  title: string;
  notes: string;
  file_path: string | null;
  file_name: string | null;
  file_size: number | null;
  link_url: string | null;
  uploaded_by: string;
  created_at: string;
}

/** Due-date helpers (dates are plain YYYY-MM-DD in India time). */
export function todayIST() {
  return new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}
export function isOverdue(t: Pick<Task, "due_date" | "status">) {
  return Boolean(t.due_date && t.status !== "done" && t.due_date < todayIST());
}

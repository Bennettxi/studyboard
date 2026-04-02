export type Priority = "low" | "medium" | "high" | "urgent";
export type AssignmentStatus = "todo" | "in_progress" | "done";

export type ThemeName = "default" | "ocean" | "forest" | "sunset" | "rose" | "lavender" | "midnight";

export interface ThemeOption {
  name: ThemeName;
  label: string;
  color: string;
  description: string;
}

export const THEMES: ThemeOption[] = [
  { name: "default", label: "Indigo", color: "#6366f1", description: "Classic indigo blue" },
  { name: "ocean", label: "Ocean", color: "#0ea5e9", description: "Cool ocean blue" },
  { name: "forest", label: "Forest", color: "#16a34a", description: "Natural green" },
  { name: "sunset", label: "Sunset", color: "#f97316", description: "Warm orange" },
  { name: "rose", label: "Rose", color: "#e11d48", description: "Bold pink-red" },
  { name: "lavender", label: "Lavender", color: "#8b5cf6", description: "Soft purple" },
  { name: "midnight", label: "Midnight", color: "#818cf8", description: "Deep dark mode" },
];

export interface Course {
  id: string;
  name: string;
  color: string;
  teacher?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  courseId?: string; // optionally tied to a course
}

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  folderId?: string;
  dueDate: string; // ISO date string
  priority: Priority;
  status: AssignmentStatus;
  subtasks: Subtask[];
  tags: string[];
  grade?: number;
  gradeMax?: number;
  recurring?: "weekly" | "biweekly" | "monthly" | null;
  attachments?: AttachmentFile[];
  createdAt: string;
  updatedAt: string;
}

export interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string; // base64 data URL for local storage
}

export interface PomodoroSession {
  assignmentId: string | null;
  duration: number; // minutes
  startedAt: string;
  completedAt?: string;
}

export const COURSE_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#ef4444", // red
  "#f59e0b", // amber
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#f97316", // orange
  "#84cc16", // lime
];

export const FOLDER_COLORS = [
  "#6366f1", "#3b82f6", "#06b6d4", "#10b981", "#84cc16",
  "#f59e0b", "#f97316", "#ef4444", "#ec4899", "#8b5cf6",
];

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bgColor: string }> = {
  low: { label: "Low", color: "#10b981", bgColor: "#d1fae5" },
  medium: { label: "Medium", color: "#f59e0b", bgColor: "#fef3c7" },
  high: { label: "High", color: "#ef4444", bgColor: "#fee2e2" },
  urgent: { label: "Urgent", color: "#7c3aed", bgColor: "#ede9fe" },
};

export const STATUS_CONFIG: Record<AssignmentStatus, { label: string }> = {
  todo: { label: "To Do" },
  in_progress: { label: "In Progress" },
  done: { label: "Done" },
};

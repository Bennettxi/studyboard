export type Priority = "low" | "medium" | "high" | "urgent";
export type AssignmentStatus = "todo" | "in_progress" | "done";

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

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  dueDate: string; // ISO date string
  priority: Priority;
  status: AssignmentStatus;
  subtasks: Subtask[];
  tags: string[];
  grade?: number;
  gradeMax?: number;
  recurring?: "weekly" | "biweekly" | "monthly" | null;
  createdAt: string;
  updatedAt: string;
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

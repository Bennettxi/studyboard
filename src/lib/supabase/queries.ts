import type { SupabaseClient } from "@supabase/supabase-js";
import type { Course, Folder, Assignment, PomodoroSession, ThemeName } from "@/types";

// ── Courses ──

export async function fetchCourses(supabase: SupabaseClient): Promise<Course[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("id, name, color, teacher")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function upsertCourse(supabase: SupabaseClient, userId: string, course: Omit<Course, "id"> & { id?: string }) {
  const { data, error } = await supabase
    .from("courses")
    .upsert({ ...course, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function insertCourse(supabase: SupabaseClient, userId: string, course: Omit<Course, "id">) {
  const { data, error } = await supabase
    .from("courses")
    .insert({ ...course, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, name: data.name, color: data.color, teacher: data.teacher } as Course;
}

export async function updateCourseDB(supabase: SupabaseClient, id: string, updates: Partial<Course>) {
  const { error } = await supabase.from("courses").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteCourseDB(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw error;
}

// ── Folders ──

export async function fetchFolders(supabase: SupabaseClient): Promise<Folder[]> {
  const { data, error } = await supabase
    .from("folders")
    .select("id, name, color, course_id")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((f) => ({
    id: f.id,
    name: f.name,
    color: f.color,
    courseId: f.course_id,
  }));
}

export async function insertFolder(supabase: SupabaseClient, userId: string, folder: Omit<Folder, "id">) {
  const { data, error } = await supabase
    .from("folders")
    .insert({ name: folder.name, color: folder.color, course_id: folder.courseId, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, name: data.name, color: data.color, courseId: data.course_id } as Folder;
}

export async function updateFolderDB(supabase: SupabaseClient, id: string, updates: Partial<Folder>) {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.color !== undefined) dbUpdates.color = updates.color;
  if (updates.courseId !== undefined) dbUpdates.course_id = updates.courseId;
  const { error } = await supabase.from("folders").update(dbUpdates).eq("id", id);
  if (error) throw error;
}

export async function deleteFolderDB(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("folders").delete().eq("id", id);
  if (error) throw error;
}

// ── Assignments ──

interface AssignmentRow {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  folder_id: string | null;
  due_date: string;
  priority: string;
  status: string;
  tags: string[];
  grade: number | null;
  grade_max: number | null;
  recurring: string | null;
  created_at: string;
  updated_at: string;
  subtasks: { id: string; title: string; completed: boolean; sort_order: number }[];
}

function rowToAssignment(row: AssignmentRow): Assignment {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    courseId: row.course_id,
    folderId: row.folder_id ?? undefined,
    dueDate: row.due_date,
    priority: row.priority as Assignment["priority"],
    status: row.status as Assignment["status"],
    tags: row.tags ?? [],
    grade: row.grade ?? undefined,
    gradeMax: row.grade_max ?? undefined,
    recurring: (row.recurring as Assignment["recurring"]) ?? null,
    subtasks: (row.subtasks ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((s) => ({ id: s.id, title: s.title, completed: s.completed })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchAssignments(supabase: SupabaseClient): Promise<Assignment[]> {
  const { data, error } = await supabase
    .from("assignments")
    .select("*, subtasks(*)")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToAssignment);
}

export async function insertAssignment(
  supabase: SupabaseClient,
  userId: string,
  assignment: Omit<Assignment, "id" | "createdAt" | "updatedAt">
) {
  const { subtasks, ...rest } = assignment;
  const { data, error } = await supabase
    .from("assignments")
    .insert({
      user_id: userId,
      title: rest.title,
      description: rest.description,
      course_id: rest.courseId,
      folder_id: rest.folderId,
      due_date: rest.dueDate,
      priority: rest.priority,
      status: rest.status,
      tags: rest.tags,
      grade: rest.grade,
      grade_max: rest.gradeMax,
      recurring: rest.recurring,
    })
    .select("*, subtasks(*)")
    .single();
  if (error) throw error;

  // Insert subtasks if any
  if (subtasks && subtasks.length > 0) {
    const { error: stError } = await supabase.from("subtasks").insert(
      subtasks.map((s, i) => ({
        assignment_id: data.id,
        user_id: userId,
        title: s.title,
        completed: s.completed,
        sort_order: i,
      }))
    );
    if (stError) throw stError;
  }

  return rowToAssignment(data);
}

export async function updateAssignmentDB(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<Assignment>
) {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.courseId !== undefined) dbUpdates.course_id = updates.courseId;
  if (updates.folderId !== undefined) dbUpdates.folder_id = updates.folderId;
  if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
  if (updates.grade !== undefined) dbUpdates.grade = updates.grade;
  if (updates.gradeMax !== undefined) dbUpdates.grade_max = updates.gradeMax;
  if (updates.recurring !== undefined) dbUpdates.recurring = updates.recurring;

  if (Object.keys(dbUpdates).length > 0) {
    const { error } = await supabase.from("assignments").update(dbUpdates).eq("id", id);
    if (error) throw error;
  }
}

export async function deleteAssignmentDB(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("assignments").delete().eq("id", id);
  if (error) throw error;
}

// ── Pomodoro Sessions ──

export async function fetchPomodoroSessions(supabase: SupabaseClient): Promise<PomodoroSession[]> {
  const { data, error } = await supabase
    .from("pomodoro_sessions")
    .select("*")
    .order("started_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((s) => ({
    assignmentId: s.assignment_id,
    duration: s.duration,
    startedAt: s.started_at,
    completedAt: s.completed_at ?? undefined,
  }));
}

export async function insertPomodoroSession(supabase: SupabaseClient, userId: string, session: PomodoroSession) {
  const { error } = await supabase.from("pomodoro_sessions").insert({
    user_id: userId,
    assignment_id: session.assignmentId,
    duration: session.duration,
    started_at: session.startedAt,
    completed_at: session.completedAt,
  });
  if (error) throw error;
}

// ── User Preferences ──

export async function fetchPreferences(supabase: SupabaseClient): Promise<{ darkMode: boolean; theme: ThemeName } | null> {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("dark_mode, theme")
    .single();
  if (error) return null;
  return { darkMode: data.dark_mode, theme: data.theme as ThemeName };
}

export async function updatePreferences(supabase: SupabaseClient, userId: string, prefs: { darkMode?: boolean; theme?: ThemeName }) {
  const dbUpdates: Record<string, unknown> = {};
  if (prefs.darkMode !== undefined) dbUpdates.dark_mode = prefs.darkMode;
  if (prefs.theme !== undefined) dbUpdates.theme = prefs.theme;
  const { error } = await supabase
    .from("user_preferences")
    .upsert({ user_id: userId, ...dbUpdates });
  if (error) throw error;
}

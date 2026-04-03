"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import type { Assignment, Course, PomodoroSession, Folder, ThemeName } from "@/types";
import { generateId } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import * as queries from "@/lib/supabase/queries";

interface AppState {
  courses: Course[];
  assignments: Assignment[];
  pomodoroSessions: PomodoroSession[];
  folders: Folder[];
  darkMode: boolean;
  theme: ThemeName;
}

interface AppContextType extends AppState {
  // Courses
  addCourse: (course: Omit<Course, "id">) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  getCourse: (id: string) => Course | undefined;
  // Assignments
  addAssignment: (assignment: Omit<Assignment, "id" | "createdAt" | "updatedAt">) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  // Folders
  addFolder: (folder: Omit<Folder, "id">) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  getFolder: (id: string) => Folder | undefined;
  // Pomodoro
  addPomodoroSession: (session: PomodoroSession) => void;
  // Theme
  toggleDarkMode: () => void;
  setTheme: (theme: ThemeName) => void;
  // Auth-aware
  isCloudSync: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = "studyboard-data";

const defaultState: AppState = {
  courses: [],
  assignments: [],
  pomodoroSessions: [],
  folders: [],
  darkMode: false,
  theme: "default",
};

function loadLocalState(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultState, ...parsed };
    }
  } catch {}
  return defaultState;
}

function saveLocalState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function applyThemeToDOM(theme: ThemeName, darkMode: boolean) {
  const el = document.documentElement;
  el.classList.remove("dark", "theme-ocean", "theme-forest", "theme-sunset", "theme-rose", "theme-lavender", "theme-midnight");

  if (theme === "midnight") {
    el.classList.add("theme-midnight");
  } else {
    if (theme !== "default") {
      el.classList.add(`theme-${theme}`);
    }
    if (darkMode) {
      el.classList.add("dark");
    }
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<AppState>(defaultState);
  const [loaded, setLoaded] = useState(false);
  const supabaseRef = useRef(createClient());
  const isCloud = !!user;

  // Load data on mount / auth change
  useEffect(() => {
    if (user) {
      // Fetch from Supabase
      const supabase = supabaseRef.current;
      Promise.all([
        queries.fetchCourses(supabase),
        queries.fetchAssignments(supabase),
        queries.fetchFolders(supabase),
        queries.fetchPomodoroSessions(supabase),
        queries.fetchPreferences(supabase),
      ]).then(([courses, assignments, folders, pomodoroSessions, prefs]) => {
        const newState: AppState = {
          courses,
          assignments,
          folders,
          pomodoroSessions,
          darkMode: prefs?.darkMode ?? false,
          theme: prefs?.theme ?? "default",
        };
        setState(newState);
        saveLocalState(newState); // cache locally too
        setLoaded(true);
      }).catch(() => {
        // Fallback to localStorage on error
        setState(loadLocalState());
        setLoaded(true);
      });
    } else {
      setState(loadLocalState());
      setLoaded(true);
    }
  }, [user]);

  // Save to localStorage + apply theme whenever state changes
  useEffect(() => {
    if (loaded) {
      saveLocalState(state);
      applyThemeToDOM(state.theme, state.darkMode);
    }
  }, [state, loaded]);

  // ── Courses ──

  const addCourse = useCallback((course: Omit<Course, "id">) => {
    if (isCloud) {
      const supabase = supabaseRef.current;
      // Optimistic: add with temp ID, then replace with real ID from DB
      const tempId = generateId();
      setState((prev) => ({
        ...prev,
        courses: [...prev.courses, { ...course, id: tempId }],
      }));
      queries.insertCourse(supabase, user!.id, course).then((dbCourse) => {
        setState((prev) => ({
          ...prev,
          courses: prev.courses.map((c) => (c.id === tempId ? dbCourse : c)),
        }));
      }).catch(() => {
        // Revert on failure
        setState((prev) => ({
          ...prev,
          courses: prev.courses.filter((c) => c.id !== tempId),
        }));
      });
    } else {
      setState((prev) => ({
        ...prev,
        courses: [...prev.courses, { ...course, id: generateId() }],
      }));
    }
  }, [isCloud, user]);

  const updateCourse = useCallback((id: string, updates: Partial<Course>) => {
    setState((prev) => ({
      ...prev,
      courses: prev.courses.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
    if (isCloud) {
      queries.updateCourseDB(supabaseRef.current, id, updates).catch(() => {});
    }
  }, [isCloud]);

  const deleteCourse = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      courses: prev.courses.filter((c) => c.id !== id),
      assignments: prev.assignments.filter((a) => a.courseId !== id),
    }));
    if (isCloud) {
      queries.deleteCourseDB(supabaseRef.current, id).catch(() => {});
    }
  }, [isCloud]);

  const getCourse = useCallback(
    (id: string) => state.courses.find((c) => c.id === id),
    [state.courses]
  );

  // ── Assignments ──

  const addAssignment = useCallback(
    (assignment: Omit<Assignment, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      if (isCloud) {
        const tempId = generateId();
        const tempAssignment = { ...assignment, id: tempId, createdAt: now, updatedAt: now };
        setState((prev) => ({
          ...prev,
          assignments: [...prev.assignments, tempAssignment],
        }));
        queries.insertAssignment(supabaseRef.current, user!.id, assignment).then((dbAssignment) => {
          setState((prev) => ({
            ...prev,
            assignments: prev.assignments.map((a) => (a.id === tempId ? dbAssignment : a)),
          }));
        }).catch(() => {
          setState((prev) => ({
            ...prev,
            assignments: prev.assignments.filter((a) => a.id !== tempId),
          }));
        });
      } else {
        setState((prev) => ({
          ...prev,
          assignments: [
            ...prev.assignments,
            { ...assignment, id: generateId(), createdAt: now, updatedAt: now },
          ],
        }));
      }
    },
    [isCloud, user]
  );

  const updateAssignment = useCallback((id: string, updates: Partial<Assignment>) => {
    setState((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a) =>
        a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
      ),
    }));
    if (isCloud) {
      queries.updateAssignmentDB(supabaseRef.current, id, updates).catch(() => {});
    }
  }, [isCloud]);

  const deleteAssignment = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      assignments: prev.assignments.filter((a) => a.id !== id),
    }));
    if (isCloud) {
      queries.deleteAssignmentDB(supabaseRef.current, id).catch(() => {});
    }
  }, [isCloud]);

  // ── Folders ──

  const addFolder = useCallback((folder: Omit<Folder, "id">) => {
    if (isCloud) {
      const tempId = generateId();
      setState((prev) => ({
        ...prev,
        folders: [...prev.folders, { ...folder, id: tempId }],
      }));
      queries.insertFolder(supabaseRef.current, user!.id, folder).then((dbFolder) => {
        setState((prev) => ({
          ...prev,
          folders: prev.folders.map((f) => (f.id === tempId ? dbFolder : f)),
        }));
      }).catch(() => {
        setState((prev) => ({
          ...prev,
          folders: prev.folders.filter((f) => f.id !== tempId),
        }));
      });
    } else {
      setState((prev) => ({
        ...prev,
        folders: [...prev.folders, { ...folder, id: generateId() }],
      }));
    }
  }, [isCloud, user]);

  const updateFolder = useCallback((id: string, updates: Partial<Folder>) => {
    setState((prev) => ({
      ...prev,
      folders: prev.folders.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
    if (isCloud) {
      queries.updateFolderDB(supabaseRef.current, id, updates).catch(() => {});
    }
  }, [isCloud]);

  const deleteFolder = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      folders: prev.folders.filter((f) => f.id !== id),
      assignments: prev.assignments.map((a) =>
        a.folderId === id ? { ...a, folderId: undefined } : a
      ),
    }));
    if (isCloud) {
      queries.deleteFolderDB(supabaseRef.current, id).catch(() => {});
    }
  }, [isCloud]);

  const getFolder = useCallback(
    (id: string) => state.folders.find((f) => f.id === id),
    [state.folders]
  );

  // ── Pomodoro ──

  const addPomodoroSession = useCallback((session: PomodoroSession) => {
    setState((prev) => ({
      ...prev,
      pomodoroSessions: [...prev.pomodoroSessions, session],
    }));
    if (isCloud) {
      queries.insertPomodoroSession(supabaseRef.current, user!.id, session).catch(() => {});
    }
  }, [isCloud, user]);

  // ── Theme ──

  const toggleDarkMode = useCallback(() => {
    setState((prev) => {
      const newDarkMode = !prev.darkMode;
      if (isCloud) {
        queries.updatePreferences(supabaseRef.current, user!.id, { darkMode: newDarkMode }).catch(() => {});
      }
      return { ...prev, darkMode: newDarkMode };
    });
  }, [isCloud, user]);

  const setTheme = useCallback((theme: ThemeName) => {
    setState((prev) => {
      if (isCloud) {
        queries.updatePreferences(supabaseRef.current, user!.id, { theme }).catch(() => {});
      }
      return { ...prev, theme };
    });
  }, [isCloud, user]);

  if (!loaded) return null;

  return (
    <AppContext.Provider
      value={{
        ...state,
        addCourse,
        updateCourse,
        deleteCourse,
        getCourse,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        addFolder,
        updateFolder,
        deleteFolder,
        getFolder,
        addPomodoroSession,
        toggleDarkMode,
        setTheme,
        isCloudSync: isCloud,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}

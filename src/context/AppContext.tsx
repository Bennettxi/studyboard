"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Assignment, Course, PomodoroSession, Folder, ThemeName } from "@/types";
import { generateId } from "@/lib/utils";

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

function loadState(): AppState {
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

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function applyThemeToDOM(theme: ThemeName, darkMode: boolean) {
  const el = document.documentElement;
  // Remove all theme classes
  el.classList.remove("dark", "theme-ocean", "theme-forest", "theme-sunset", "theme-rose", "theme-lavender", "theme-midnight");

  if (theme === "midnight") {
    // Midnight is always dark-feeling, no need for .dark
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
  const [state, setState] = useState<AppState>(defaultState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setState(loadState());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      saveState(state);
      applyThemeToDOM(state.theme, state.darkMode);
    }
  }, [state, loaded]);

  const addCourse = useCallback((course: Omit<Course, "id">) => {
    setState((prev) => ({
      ...prev,
      courses: [...prev.courses, { ...course, id: generateId() }],
    }));
  }, []);

  const updateCourse = useCallback((id: string, updates: Partial<Course>) => {
    setState((prev) => ({
      ...prev,
      courses: prev.courses.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }, []);

  const deleteCourse = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      courses: prev.courses.filter((c) => c.id !== id),
      assignments: prev.assignments.filter((a) => a.courseId !== id),
    }));
  }, []);

  const getCourse = useCallback(
    (id: string) => state.courses.find((c) => c.id === id),
    [state.courses]
  );

  const addAssignment = useCallback(
    (assignment: Omit<Assignment, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      setState((prev) => ({
        ...prev,
        assignments: [
          ...prev.assignments,
          { ...assignment, id: generateId(), createdAt: now, updatedAt: now },
        ],
      }));
    },
    []
  );

  const updateAssignment = useCallback((id: string, updates: Partial<Assignment>) => {
    setState((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a) =>
        a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
      ),
    }));
  }, []);

  const deleteAssignment = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      assignments: prev.assignments.filter((a) => a.id !== id),
    }));
  }, []);

  // Folders
  const addFolder = useCallback((folder: Omit<Folder, "id">) => {
    setState((prev) => ({
      ...prev,
      folders: [...prev.folders, { ...folder, id: generateId() }],
    }));
  }, []);

  const updateFolder = useCallback((id: string, updates: Partial<Folder>) => {
    setState((prev) => ({
      ...prev,
      folders: prev.folders.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      folders: prev.folders.filter((f) => f.id !== id),
      assignments: prev.assignments.map((a) =>
        a.folderId === id ? { ...a, folderId: undefined } : a
      ),
    }));
  }, []);

  const getFolder = useCallback(
    (id: string) => state.folders.find((f) => f.id === id),
    [state.folders]
  );

  const addPomodoroSession = useCallback((session: PomodoroSession) => {
    setState((prev) => ({
      ...prev,
      pomodoroSessions: [...prev.pomodoroSessions, session],
    }));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setState((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  }, []);

  const setTheme = useCallback((theme: ThemeName) => {
    setState((prev) => ({ ...prev, theme }));
  }, []);

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

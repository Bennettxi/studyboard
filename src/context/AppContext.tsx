"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Assignment, Course, PomodoroSession } from "@/types";
import { generateId } from "@/lib/utils";

interface AppState {
  courses: Course[];
  assignments: Assignment[];
  pomodoroSessions: PomodoroSession[];
  darkMode: boolean;
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
  // Pomodoro
  addPomodoroSession: (session: PomodoroSession) => void;
  // Theme
  toggleDarkMode: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = "studyboard-data";

function loadState(): AppState {
  if (typeof window === "undefined") {
    return { courses: [], assignments: [], pomodoroSessions: [], darkMode: false };
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { courses: [], assignments: [], pomodoroSessions: [], darkMode: false };
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({ courses: [], assignments: [], pomodoroSessions: [], darkMode: false });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setState(loadState());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      saveState(state);
      if (state.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
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

  const addPomodoroSession = useCallback((session: PomodoroSession) => {
    setState((prev) => ({
      ...prev,
      pomodoroSessions: [...prev.pomodoroSessions, session],
    }));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setState((prev) => ({ ...prev, darkMode: !prev.darkMode }));
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
        addPomodoroSession,
        toggleDarkMode,
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

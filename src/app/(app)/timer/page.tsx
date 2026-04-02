"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";

type TimerMode = "focus" | "short_break" | "long_break";

const MODE_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

const MODE_LABELS: Record<TimerMode, string> = {
  focus: "Focus",
  short_break: "Short Break",
  long_break: "Long Break",
};

export default function TimerPage() {
  const { assignments, courses, addPomodoroSession } = useApp();
  const [mode, setMode] = useState<TimerMode>("focus");
  const [seconds, setSeconds] = useState(MODE_DURATIONS.focus);
  const [running, setRunning] = useState(false);
  const [linkedAssignment, setLinkedAssignment] = useState("");
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeAssignments = assignments.filter((a) => a.status !== "done");

  const reset = useCallback((newMode?: TimerMode) => {
    const m = newMode ?? mode;
    setRunning(false);
    setSeconds(MODE_DURATIONS[m]);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [mode]);

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    reset(newMode);
  };

  useEffect(() => {
    if (!running) return;

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setRunning(false);
          if (mode === "focus") {
            setCompletedSessions((s) => s + 1);
            addPomodoroSession({
              assignmentId: linkedAssignment || null,
              duration: MODE_DURATIONS.focus / 60,
              startedAt: new Date(Date.now() - MODE_DURATIONS.focus * 1000).toISOString(),
              completedAt: new Date().toISOString(),
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, mode, linkedAssignment, addPomodoroSession]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = 1 - seconds / MODE_DURATIONS[mode];
  const circumference = 2 * Math.PI * 120;

  const getCourse = (courseId: string) => courses.find((c) => c.id === courseId);

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Study Timer</h1>

      {/* Mode Tabs */}
      <div className="flex gap-1 bg-surface-hover rounded-lg p-1 mb-8">
        {(Object.keys(MODE_LABELS) as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              mode === m ? "bg-primary text-white" : "text-muted hover:text-foreground"
            }`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="flex justify-center mb-8">
        <div className="relative w-64 h-64">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 256 256">
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="var(--border-color)"
              strokeWidth="8"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke={mode === "focus" ? "var(--color-primary)" : "var(--color-success)"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold tabular-nums">
              {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </span>
            <span className="text-sm text-muted mt-1">{MODE_LABELS[mode]}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3 mb-8">
        {seconds === 0 ? (
          <Button onClick={() => reset()}>Reset</Button>
        ) : (
          <>
            <Button onClick={() => setRunning(!running)}>
              {running ? "Pause" : "Start"}
            </Button>
            {(running || seconds !== MODE_DURATIONS[mode]) && (
              <Button variant="secondary" onClick={() => reset()}>
                Reset
              </Button>
            )}
          </>
        )}
      </div>

      {/* Link to Assignment */}
      {mode === "focus" && (
        <div className="mb-8">
          <Select
            label="Working on"
            id="linked-assignment"
            value={linkedAssignment}
            onChange={(e) => setLinkedAssignment(e.target.value)}
            options={[
              { value: "", label: "No specific assignment" },
              ...activeAssignments.map((a) => ({
                value: a.id,
                label: `${a.title} (${getCourse(a.courseId)?.name ?? "Unknown"})`,
              })),
            ]}
          />
        </div>
      )}

      {/* Session Count */}
      <div className="text-center bg-surface border border-border rounded-xl p-5">
        <p className="text-sm text-muted mb-1">Sessions completed today</p>
        <p className="text-3xl font-bold text-primary">{completedSessions}</p>
        <p className="text-xs text-muted mt-1">
          {completedSessions * 25} minutes of focused study
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { PRIORITY_CONFIG } from "@/types";

export default function CalendarPage() {
  const { assignments, courses } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const assignmentsByDate = useMemo(() => {
    const map: Record<string, typeof assignments> = {};
    for (const a of assignments) {
      const dateKey = a.dueDate;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(a);
    }
    return map;
  }, [assignments]);

  const getCourse = (id: string) => courses.find((c) => c.id === id);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={prevMonth}>
            &larr;
          </Button>
          <span className="font-semibold min-w-[180px] text-center">{monthName}</span>
          <Button variant="secondary" size="sm" onClick={nextMonth}>
            &rarr;
          </Button>
          <Button variant="ghost" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-3 text-center text-xs font-semibold text-muted uppercase">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-border bg-surface-hover/30" />;
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayAssignments = assignmentsByDate[dateStr] ?? [];
            const isToday = dateStr === todayStr;

            return (
              <div
                key={dateStr}
                className="min-h-[100px] border-b border-r border-border p-1.5 hover:bg-surface-hover/50 transition-colors"
              >
                <div className="flex justify-end mb-1">
                  <span
                    className={`text-sm w-7 h-7 flex items-center justify-center rounded-full ${
                      isToday ? "bg-primary text-white font-bold" : "text-foreground"
                    }`}
                  >
                    {day}
                  </span>
                </div>
                <div className="space-y-1">
                  {dayAssignments.slice(0, 3).map((a) => {
                    const course = getCourse(a.courseId);
                    return (
                      <div
                        key={a.id}
                        className="text-xs rounded px-1.5 py-0.5 truncate"
                        style={{
                          backgroundColor: course?.color + "20",
                          color: course?.color,
                          borderLeft: `2px solid ${course?.color}`,
                        }}
                        title={`${a.title} (${PRIORITY_CONFIG[a.priority].label})`}
                      >
                        {a.status === "done" && <span className="line-through">{a.title}</span>}
                        {a.status !== "done" && a.title}
                      </div>
                    );
                  })}
                  {dayAssignments.length > 3 && (
                    <span className="text-xs text-muted pl-1">
                      +{dayAssignments.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 flex-wrap">
        {courses.map((c) => (
          <div key={c.id} className="flex items-center gap-1.5 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
            <span className="text-muted">{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

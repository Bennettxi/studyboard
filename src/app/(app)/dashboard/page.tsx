"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { PRIORITY_CONFIG } from "@/types";
import { isOverdue, isDueToday, isDueThisWeek, formatDateShort, getDaysUntilDue } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

export default function DashboardPage() {
  const { assignments, courses } = useApp();

  const stats = useMemo(() => {
    const active = assignments.filter((a) => a.status !== "done");
    const done = assignments.filter((a) => a.status === "done");
    const overdue = active.filter((a) => isOverdue(a.dueDate));
    const dueToday = active.filter((a) => isDueToday(a.dueDate));
    const dueThisWeek = active.filter((a) => isDueThisWeek(a.dueDate));

    return { total: assignments.length, active: active.length, done: done.length, overdue: overdue.length, dueToday: dueToday.length, dueThisWeek: dueThisWeek.length };
  }, [assignments]);

  const upcoming = useMemo(() => {
    return assignments
      .filter((a) => a.status !== "done")
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 8);
  }, [assignments]);

  const courseStats = useMemo(() => {
    return courses.map((c) => {
      const courseAssignments = assignments.filter((a) => a.courseId === c.id);
      const done = courseAssignments.filter((a) => a.status === "done").length;
      return { ...c, total: courseAssignments.length, done };
    });
  }, [courses, assignments]);

  const getCourse = (id: string) => courses.find((c) => c.id === id);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active", value: stats.active, color: "text-primary" },
          { label: "Completed", value: stats.done, color: "text-success" },
          { label: "Overdue", value: stats.overdue, color: "text-danger" },
          { label: "Due This Week", value: stats.dueThisWeek, color: "text-warning" },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface border border-border rounded-xl p-5">
            <p className="text-sm text-muted mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Deadlines */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upcoming Deadlines</h2>
            <Link href="/assignments" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-8 text-center">
              <p className="text-muted">No upcoming assignments. Add some to get started!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map((a) => {
                const course = getCourse(a.courseId);
                const days = getDaysUntilDue(a.dueDate);
                const overdue = isOverdue(a.dueDate);
                const priorityCfg = PRIORITY_CONFIG[a.priority];

                return (
                  <div
                    key={a.id}
                    className="bg-surface border border-border rounded-lg p-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
                  >
                    <div
                      className="w-1 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: course?.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{a.title}</p>
                      <p className="text-xs text-muted">{course?.name}</p>
                    </div>
                    <Badge color={priorityCfg.color} bgColor={priorityCfg.bgColor}>
                      {priorityCfg.label}
                    </Badge>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-medium ${overdue ? "text-danger" : days <= 1 ? "text-warning" : ""}`}>
                        {formatDateShort(a.dueDate)}
                      </p>
                      <p className={`text-xs ${overdue ? "text-danger" : "text-muted"}`}>
                        {overdue ? "Overdue" : days === 0 ? "Today" : `${days}d left`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Class Progress */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Class Progress</h2>
            <Link href="/classes" className="text-sm text-primary hover:underline">
              Manage
            </Link>
          </div>

          {courseStats.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-8 text-center">
              <p className="text-muted text-sm">
                <Link href="/classes" className="text-primary hover:underline">
                  Add a class
                </Link>{" "}
                to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {courseStats.map((c) => (
                <div key={c.id} className="bg-surface border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-sm font-medium">{c.name}</span>
                    </div>
                    <span className="text-xs text-muted">
                      {c.done}/{c.total}
                    </span>
                  </div>
                  {c.total > 0 && (
                    <div className="w-full bg-border rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${(c.done / c.total) * 100}%`,
                          backgroundColor: c.color,
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

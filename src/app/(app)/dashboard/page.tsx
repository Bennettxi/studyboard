"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { PRIORITY_CONFIG } from "@/types";
import { isOverdue, isDueToday, isDueThisWeek, formatDateShort, getDaysUntilDue } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

export default function DashboardPage() {
  const { assignments, courses, folders } = useApp();

  const stats = useMemo(() => {
    const active = assignments.filter((a) => a.status !== "done");
    const done = assignments.filter((a) => a.status === "done");
    const overdue = active.filter((a) => isOverdue(a.dueDate));
    const dueThisWeek = active.filter((a) => isDueThisWeek(a.dueDate));

    return { total: assignments.length, active: active.length, done: done.length, overdue: overdue.length, dueThisWeek: dueThisWeek.length };
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
  const getFolder = (id?: string) => id ? folders.find((f) => f.id === id) : undefined;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-sm text-muted">Welcome back! Here&apos;s your assignment overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active", value: stats.active, color: "text-primary", icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" },
          { label: "Completed", value: stats.done, color: "text-success", icon: "m4.5 12.75 6 6 9-13.5" },
          { label: "Overdue", value: stats.overdue, color: "text-danger", icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" },
          { label: "Due This Week", value: stats.dueThisWeek, color: "text-warning", icon: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted font-medium">{stat.label}</p>
              <div className="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center">
                <svg className={`w-4.5 h-4.5 ${stat.color}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                </svg>
              </div>
            </div>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Deadlines */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upcoming Deadlines</h2>
            <Link href="/assignments" className="text-sm text-primary hover:underline font-medium">
              View all
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <div className="w-12 h-12 rounded-xl bg-surface-hover flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <p className="text-muted font-medium">All caught up!</p>
              <p className="text-sm text-muted mt-1">No upcoming assignments.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map((a) => {
                const course = getCourse(a.courseId);
                const folder = getFolder(a.folderId);
                const days = getDaysUntilDue(a.dueDate);
                const overdue = isOverdue(a.dueDate);
                const priorityCfg = PRIORITY_CONFIG[a.priority];

                return (
                  <div
                    key={a.id}
                    className="glass-card p-4 flex items-center gap-4 hover:translate-x-0.5 transition-transform"
                  >
                    <div
                      className="w-1 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: course?.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{a.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-muted">{course?.name}</p>
                        {folder && (
                          <>
                            <span className="text-xs text-muted">·</span>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded" style={{ backgroundColor: folder.color }} />
                              <span className="text-xs text-muted">{folder.name}</span>
                            </div>
                          </>
                        )}
                      </div>
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

        {/* Right column */}
        <div className="space-y-6">
          {/* Class Progress */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Class Progress</h2>
              <Link href="/classes" className="text-sm text-primary hover:underline font-medium">
                Manage
              </Link>
            </div>

            {courseStats.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-muted text-sm">
                  <Link href="/classes" className="text-primary hover:underline font-medium">
                    Add a class
                  </Link>{" "}
                  to get started
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {courseStats.map((c) => (
                  <div key={c.id} className="glass-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-sm font-medium">{c.name}</span>
                      </div>
                      <span className="text-xs text-muted font-medium">
                        {c.done}/{c.total}
                      </span>
                    </div>
                    {c.total > 0 && (
                      <div className="w-full bg-border rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
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

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/assignments" className="glass-card p-3 flex items-center gap-3 hover:translate-x-0.5 transition-transform">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <span className="text-sm font-medium">New Assignment</span>
              </Link>
              <Link href="/upload" className="glass-card p-3 flex items-center gap-3 hover:translate-x-0.5 transition-transform">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Upload & Scan</span>
              </Link>
              <Link href="/settings" className="glass-card p-3 flex items-center gap-3 hover:translate-x-0.5 transition-transform">
                <div className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center">
                  <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

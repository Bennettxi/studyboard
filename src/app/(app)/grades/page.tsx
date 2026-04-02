"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

export default function GradesPage() {
  const { assignments, courses, updateAssignment } = useApp();
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [grade, setGrade] = useState("");
  const [gradeMax, setGradeMax] = useState("100");

  const gradedAssignments = useMemo(() => {
    return assignments
      .filter((a) => a.status === "done" && a.grade !== undefined)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [assignments]);

  const ungradedDone = useMemo(() => {
    return assignments.filter((a) => a.status === "done" && a.grade === undefined);
  }, [assignments]);

  const courseAverages = useMemo(() => {
    return courses.map((c) => {
      const graded = assignments.filter(
        (a) => a.courseId === c.id && a.grade !== undefined && a.gradeMax !== undefined
      );
      if (graded.length === 0) return { ...c, average: null, count: 0 };
      const totalPercent = graded.reduce((sum, a) => sum + (a.grade! / a.gradeMax!) * 100, 0);
      return { ...c, average: totalPercent / graded.length, count: graded.length };
    });
  }, [courses, assignments]);

  const getCourse = (id: string) => courses.find((c) => c.id === id);

  const openGrading = (id: string) => {
    const a = assignments.find((a) => a.id === id);
    setGradingId(id);
    setGrade(a?.grade?.toString() ?? "");
    setGradeMax(a?.gradeMax?.toString() ?? "100");
  };

  const saveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingId || !grade) return;
    updateAssignment(gradingId, {
      grade: parseFloat(grade),
      gradeMax: parseFloat(gradeMax) || 100,
    });
    setGradingId(null);
  };

  function getLetterGrade(pct: number): string {
    if (pct >= 93) return "A";
    if (pct >= 90) return "A-";
    if (pct >= 87) return "B+";
    if (pct >= 83) return "B";
    if (pct >= 80) return "B-";
    if (pct >= 77) return "C+";
    if (pct >= 73) return "C";
    if (pct >= 70) return "C-";
    if (pct >= 67) return "D+";
    if (pct >= 60) return "D";
    return "F";
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Grades</h1>

      {/* Course Averages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {courseAverages.map((c) => (
          <div key={c.id} className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="font-semibold">{c.name}</span>
            </div>
            {c.average !== null ? (
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold">{c.average.toFixed(1)}%</span>
                <span className="text-lg font-medium text-muted mb-1">
                  {getLetterGrade(c.average)}
                </span>
              </div>
            ) : (
              <p className="text-muted text-sm">No grades yet</p>
            )}
            <p className="text-xs text-muted mt-1">{c.count} graded assignment{c.count !== 1 ? "s" : ""}</p>
          </div>
        ))}
      </div>

      {/* Ungraded Completed */}
      {ungradedDone.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Needs Grading</h2>
          <div className="space-y-2">
            {ungradedDone.map((a) => {
              const course = getCourse(a.courseId);
              return (
                <div
                  key={a.id}
                  className="bg-surface border border-border rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: course?.color }} />
                    <div>
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted">{course?.name}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => openGrading(a.id)}>
                    Add Grade
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Graded Assignments */}
      <h2 className="text-lg font-semibold mb-3">Graded Assignments</h2>
      {gradedAssignments.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <p className="text-muted">No graded assignments yet. Complete assignments and add grades to track them here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {gradedAssignments.map((a) => {
            const course = getCourse(a.courseId);
            const pct = ((a.grade! / a.gradeMax!) * 100);
            return (
              <div
                key={a.id}
                className="bg-surface border border-border rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: course?.color }} />
                  <div>
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted">{course?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">
                    {a.grade}/{a.gradeMax}
                  </span>
                  <span className={`text-sm font-medium ${pct >= 70 ? "text-success" : "text-danger"}`}>
                    {pct.toFixed(0)}% {getLetterGrade(pct)}
                  </span>
                  <button
                    className="text-xs text-muted hover:text-foreground cursor-pointer"
                    onClick={() => openGrading(a.id)}
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={gradingId !== null}
        onClose={() => setGradingId(null)}
        title="Enter Grade"
      >
        <form onSubmit={saveGrade} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Score"
              id="grade"
              type="number"
              step="0.1"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              required
            />
            <Input
              label="Out of"
              id="gradeMax"
              type="number"
              step="0.1"
              value={gradeMax}
              onChange={(e) => setGradeMax(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setGradingId(null)}>
              Cancel
            </Button>
            <Button type="submit">Save Grade</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

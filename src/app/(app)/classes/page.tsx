"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { COURSE_COLORS } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

export default function ClassesPage() {
  const { courses, assignments, addCourse, updateCourse, deleteCourse } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [teacher, setTeacher] = useState("");
  const [color, setColor] = useState(COURSE_COLORS[0]);

  const openAdd = () => {
    setEditingId(null);
    setName("");
    setTeacher("");
    setColor(COURSE_COLORS[courses.length % COURSE_COLORS.length]);
    setShowModal(true);
  };

  const openEdit = (id: string) => {
    const c = courses.find((c) => c.id === id);
    if (!c) return;
    setEditingId(id);
    setName(c.name);
    setTeacher(c.teacher ?? "");
    setColor(c.color);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (editingId) {
      updateCourse(editingId, { name: name.trim(), teacher: teacher.trim() || undefined, color });
    } else {
      addCourse({ name: name.trim(), teacher: teacher.trim() || undefined, color });
    }
    setShowModal(false);
  };

  const getAssignmentCount = (courseId: string) =>
    assignments.filter((a) => a.courseId === courseId).length;

  const getCompletedCount = (courseId: string) =>
    assignments.filter((a) => a.courseId === courseId && a.status === "done").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Classes</h1>
          <p className="text-muted text-sm mt-1">Manage your courses and see assignment counts</p>
        </div>
        <Button onClick={openAdd}>+ Add Class</Button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted text-lg mb-4">No classes yet</p>
          <Button onClick={openAdd}>Add Your First Class</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => {
            const total = getAssignmentCount(course.id);
            const done = getCompletedCount(course.id);
            return (
              <div
                key={course.id}
                className="bg-surface border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: course.color }}
                    />
                    <h3 className="font-semibold text-lg">{course.name}</h3>
                  </div>
                </div>
                {course.teacher && (
                  <p className="text-sm text-muted mb-3">{course.teacher}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted mb-4">
                  <span>{total} assignment{total !== 1 ? "s" : ""}</span>
                  <span>{done} completed</span>
                </div>
                {total > 0 && (
                  <div className="w-full bg-border rounded-full h-2 mb-4">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(done / total) * 100}%`,
                        backgroundColor: course.color,
                      }}
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(course.id)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-danger"
                    onClick={() => {
                      if (confirm(`Delete "${course.name}" and all its assignments?`)) {
                        deleteCourse(course.id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Edit Class" : "Add Class"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Class Name"
            id="className"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., AP English Literature"
            required
          />
          <Input
            label="Teacher (optional)"
            id="teacher"
            value={teacher}
            onChange={(e) => setTeacher(e.target.value)}
            placeholder="e.g., Mr. Smith"
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COURSE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="w-8 h-8 rounded-full border-2 transition-transform cursor-pointer"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? "var(--foreground)" : "transparent",
                    transform: color === c ? "scale(1.15)" : "scale(1)",
                  }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingId ? "Save" : "Add Class"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import type { Assignment, AssignmentStatus } from "@/types";
import { PRIORITY_CONFIG, STATUS_CONFIG } from "@/types";
import { getUrgencyLabel, formatDateShort } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import AssignmentForm from "@/components/assignments/AssignmentForm";

const COLUMNS: AssignmentStatus[] = ["todo", "in_progress", "done"];

export default function AssignmentsPage() {
  const { assignments, courses, updateAssignment, deleteAssignment } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | undefined>();
  const [defaultStatus, setDefaultStatus] = useState<AssignmentStatus>("todo");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      if (searchQuery && !a.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterCourse && a.courseId !== filterCourse) return false;
      if (filterPriority && a.priority !== filterPriority) return false;
      return true;
    });
  }, [assignments, searchQuery, filterCourse, filterPriority]);

  const grouped = useMemo(() => {
    const map: Record<AssignmentStatus, Assignment[]> = { todo: [], in_progress: [], done: [] };
    for (const a of filteredAssignments) {
      map[a.status].push(a);
    }
    // Sort by due date within each column
    for (const key of COLUMNS) {
      map[key].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }
    return map;
  }, [filteredAssignments]);

  const getCourse = (id: string) => courses.find((c) => c.id === id);

  const openAdd = (status: AssignmentStatus = "todo") => {
    setEditingAssignment(undefined);
    setDefaultStatus(status);
    setShowForm(true);
  };

  const openEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setShowForm(true);
  };

  const handleDrop = (status: AssignmentStatus) => {
    if (draggedId) {
      updateAssignment(draggedId, { status });
      setDraggedId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-muted text-sm mt-1">Drag cards between columns to update status</p>
        </div>
        <Button onClick={() => openAdd()}>+ New Assignment</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <Input
          placeholder="Search assignments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64"
        />
        <Select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          options={[
            { value: "", label: "All Classes" },
            ...courses.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <Select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          options={[
            { value: "", label: "All Priorities" },
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
            { value: "urgent", label: "Urgent" },
          ]}
        />
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => (
          <div
            key={col}
            className="bg-surface-hover/50 rounded-xl p-4 min-h-[400px]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col)}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm uppercase tracking-wider text-muted">
                {STATUS_CONFIG[col].label}
                <span className="ml-2 text-xs bg-border rounded-full px-2 py-0.5">
                  {grouped[col].length}
                </span>
              </h2>
              {col === "todo" && (
                <button
                  className="text-primary text-sm font-medium hover:underline cursor-pointer"
                  onClick={() => openAdd(col)}
                >
                  + Add
                </button>
              )}
            </div>

            <div className="space-y-3">
              {grouped[col].map((assignment) => {
                const course = getCourse(assignment.courseId);
                const urgency = getUrgencyLabel(assignment.dueDate, assignment.status);
                const priorityCfg = PRIORITY_CONFIG[assignment.priority];

                return (
                  <div
                    key={assignment.id}
                    draggable
                    onDragStart={() => setDraggedId(assignment.id)}
                    onDragEnd={() => setDraggedId(null)}
                    className="bg-surface border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow animate-scale-in"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-medium text-sm leading-snug">{assignment.title}</h3>
                      <button
                        onClick={() => openEdit(assignment)}
                        className="text-muted hover:text-foreground text-xs shrink-0 cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>

                    {course && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: course.color }}
                        />
                        <span className="text-xs text-muted">{course.name}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge color={priorityCfg.color} bgColor={priorityCfg.bgColor}>
                        {priorityCfg.label}
                      </Badge>
                      <span className="text-xs text-muted">{formatDateShort(assignment.dueDate)}</span>
                      {urgency && (
                        <Badge
                          color={urgency === "Overdue" ? "#ef4444" : "#f59e0b"}
                          bgColor={urgency === "Overdue" ? "#fee2e2" : "#fef3c7"}
                        >
                          {urgency}
                        </Badge>
                      )}
                    </div>

                    {assignment.subtasks.length > 0 && (
                      <div className="mt-2 text-xs text-muted">
                        {assignment.subtasks.filter((s) => s.completed).length}/{assignment.subtasks.length} subtasks
                      </div>
                    )}

                    {assignment.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {assignment.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-border rounded-full px-2 py-0.5 text-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {col === "done" && (
                      <button
                        className="text-xs text-danger hover:underline mt-2 cursor-pointer"
                        onClick={() => {
                          if (confirm("Delete this assignment?")) deleteAssignment(assignment.id);
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editingAssignment ? "Edit Assignment" : "New Assignment"}
      >
        <AssignmentForm
          assignment={editingAssignment}
          defaultStatus={defaultStatus}
          onSave={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}

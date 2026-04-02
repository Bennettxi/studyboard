"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import type { Assignment, AssignmentStatus, Priority } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

interface AssignmentFormProps {
  assignment?: Assignment;
  onSave: () => void;
  onCancel: () => void;
  defaultStatus?: AssignmentStatus;
}

export default function AssignmentForm({
  assignment,
  onSave,
  onCancel,
  defaultStatus = "todo",
}: AssignmentFormProps) {
  const { courses, folders, addAssignment, updateAssignment } = useApp();

  const [title, setTitle] = useState(assignment?.title ?? "");
  const [description, setDescription] = useState(assignment?.description ?? "");
  const [courseId, setCourseId] = useState(assignment?.courseId ?? courses[0]?.id ?? "");
  const [folderId, setFolderId] = useState(assignment?.folderId ?? "");
  const [dueDate, setDueDate] = useState(assignment?.dueDate ?? new Date().toISOString().split("T")[0]);
  const [priority, setPriority] = useState<Priority>(assignment?.priority ?? "medium");
  const [status, setStatus] = useState<AssignmentStatus>(assignment?.status ?? defaultStatus);
  const [tags, setTags] = useState(assignment?.tags.join(", ") ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseId) return;

    const data = {
      title: title.trim(),
      description: description.trim() || undefined,
      courseId,
      folderId: folderId || undefined,
      dueDate,
      priority,
      status,
      subtasks: assignment?.subtasks ?? [],
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      recurring: assignment?.recurring ?? null,
    };

    if (assignment) {
      updateAssignment(assignment.id, data);
    } else {
      addAssignment(data);
    }
    onSave();
  };

  if (courses.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted mb-3">You need to create a class first before adding assignments.</p>
        <Button variant="secondary" onClick={onCancel}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g., Chapter 5 Reading"
        required
      />
      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          id="description"
          className="px-3 py-2 rounded-lg border border-border bg-surface text-foreground placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Class"
          id="courseId"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          options={courses.map((c) => ({ value: c.id, label: c.name }))}
        />
        <Select
          label="Folder"
          id="folderId"
          value={folderId}
          onChange={(e) => setFolderId(e.target.value)}
          options={[
            { value: "", label: "No folder" },
            ...folders.map((f) => ({ value: f.id, label: f.name })),
          ]}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Due Date"
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
        <Select
          label="Priority"
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          options={[
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
            { value: "urgent", label: "Urgent" },
          ]}
        />
      </div>
      <Select
        label="Status"
        id="status"
        value={status}
        onChange={(e) => setStatus(e.target.value as AssignmentStatus)}
        options={[
          { value: "todo", label: "To Do" },
          { value: "in_progress", label: "In Progress" },
          { value: "done", label: "Done" },
        ]}
      />
      <Input
        label="Tags (comma separated)"
        id="tags"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="e.g., essay, group project"
      />
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{assignment ? "Save Changes" : "Add Assignment"}</Button>
      </div>
    </form>
  );
}

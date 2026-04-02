"use client";

import { useState, useRef, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import type { Priority } from "@/types";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";

interface ScannedAssignment {
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
  tags: string[];
  suggestedCourse: string;
  suggestedFolder: string;
}

function parseAssignmentFromText(text: string, courses: { id: string; name: string }[], folders: { id: string; name: string }[]): ScannedAssignment {
  const lines = text.split("\n").filter((l) => l.trim());

  // Try to extract a title (first meaningful line or after "Assignment:" etc.)
  let title = "Untitled Assignment";
  for (const line of lines) {
    const cleaned = line.replace(/^(assignment|title|name|subject|hw|homework)\s*[:;-]\s*/i, "").trim();
    if (cleaned.length > 3 && cleaned.length < 120) {
      title = cleaned;
      break;
    }
  }

  // Try to find a due date
  let dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7); // default 1 week
  const datePatterns = [
    /(?:due|deadline|by|submit|before)\s*[:;-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    /(?:due|deadline|by)\s*[:;-]?\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2}(?:\s*,?\s*\d{4})?)/i,
    /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2}(?:\s*,?\s*\d{4})?)/i,
  ];
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      const parsed = new Date(match[1]);
      if (!isNaN(parsed.getTime()) && parsed.getTime() > Date.now() - 86400000) {
        dueDate = parsed;
        break;
      }
    }
  }

  // Detect priority
  let priority: Priority = "medium";
  const lowerText = text.toLowerCase();
  if (lowerText.includes("urgent") || lowerText.includes("asap") || lowerText.includes("immediately")) {
    priority = "urgent";
  } else if (lowerText.includes("important") || lowerText.includes("major") || lowerText.includes("exam") || lowerText.includes("final")) {
    priority = "high";
  } else if (lowerText.includes("optional") || lowerText.includes("extra credit") || lowerText.includes("bonus")) {
    priority = "low";
  }

  // Extract tags
  const tags: string[] = [];
  const tagKeywords = ["essay", "quiz", "test", "exam", "homework", "project", "lab", "reading", "presentation", "report", "research", "group", "final", "midterm"];
  for (const kw of tagKeywords) {
    if (lowerText.includes(kw)) tags.push(kw);
  }

  // Try to match a course
  let suggestedCourse = "";
  for (const course of courses) {
    if (lowerText.includes(course.name.toLowerCase())) {
      suggestedCourse = course.id;
      break;
    }
  }

  // Try to match a folder
  let suggestedFolder = "";
  for (const folder of folders) {
    if (lowerText.includes(folder.name.toLowerCase())) {
      suggestedFolder = folder.id;
      break;
    }
  }
  // Auto-suggest folder by tag
  if (!suggestedFolder && folders.length > 0) {
    if (tags.includes("exam") || tags.includes("test") || tags.includes("quiz") || tags.includes("midterm") || tags.includes("final")) {
      const examFolder = folders.find((f) => /exam|test|quiz/i.test(f.name));
      if (examFolder) suggestedFolder = examFolder.id;
    } else if (tags.includes("homework") || tags.includes("reading")) {
      const hwFolder = folders.find((f) => /homework|hw|assignment/i.test(f.name));
      if (hwFolder) suggestedFolder = hwFolder.id;
    } else if (tags.includes("project") || tags.includes("research")) {
      const projFolder = folders.find((f) => /project|research/i.test(f.name));
      if (projFolder) suggestedFolder = projFolder.id;
    }
  }

  // Build description from remaining text
  const description = lines.slice(1, 6).join("\n").trim();

  return {
    title,
    description: description.slice(0, 500),
    dueDate: dueDate.toISOString().split("T")[0],
    priority,
    tags: tags.slice(0, 5),
    suggestedCourse,
    suggestedFolder,
  };
}

async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string || "");
    reader.onerror = () => resolve("");
    reader.readAsText(file);
  });
}

export default function UploadPage() {
  const { courses, folders, addAssignment } = useApp();
  const [dragActive, setDragActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<ScannedAssignment | null>(null);
  const [fileName, setFileName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editPriority, setEditPriority] = useState<Priority>("medium");
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setScanning(true);
    setSaved(false);
    setFileName(file.name);

    let text = "";
    if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".csv")) {
      text = await readFileAsText(file);
    } else if (file.type === "application/pdf") {
      // For PDF, we extract what we can from the filename and basic info
      text = `Assignment: ${file.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " ")}\nFile type: PDF document\nSize: ${(file.size / 1024).toFixed(1)} KB`;
    } else if (file.type.includes("word") || file.name.endsWith(".doc") || file.name.endsWith(".docx")) {
      text = `Assignment: ${file.name.replace(/\.(docx?|doc)$/i, "").replace(/[-_]/g, " ")}\nFile type: Word document\nSize: ${(file.size / 1024).toFixed(1)} KB`;
    } else if (file.type.startsWith("image/")) {
      text = `Assignment: ${file.name.replace(/\.\w+$/i, "").replace(/[-_]/g, " ")}\nFile type: Image (${file.type})\nSize: ${(file.size / 1024).toFixed(1)} KB`;
    } else {
      text = `Assignment: ${file.name.replace(/\.\w+$/i, "").replace(/[-_]/g, " ")}\nFile: ${file.name}`;
    }

    // Simulate AI processing delay
    await new Promise((r) => setTimeout(r, 800));

    const result = parseAssignmentFromText(text, courses, folders);
    setScannedResult(result);
    setEditTitle(result.title);
    setEditDueDate(result.dueDate);
    setEditPriority(result.priority);
    setSelectedCourse(result.suggestedCourse || courses[0]?.id || "");
    setSelectedFolder(result.suggestedFolder);
    setScanning(false);
  }, [courses, folders]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleSave = () => {
    if (!editTitle.trim() || !selectedCourse) return;
    addAssignment({
      title: editTitle.trim(),
      description: scannedResult?.description,
      courseId: selectedCourse,
      folderId: selectedFolder || undefined,
      dueDate: editDueDate,
      priority: editPriority,
      status: "todo",
      subtasks: [],
      tags: scannedResult?.tags || [],
    });
    setSaved(true);
  };

  const reset = () => {
    setScannedResult(null);
    setFileName("");
    setSaved(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-2">AI Assignment Scanner</h1>
      <p className="text-muted text-sm mb-6">
        Upload an assignment file and we&apos;ll automatically extract the details and organize it into the right folder.
      </p>

      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`glass-card border-2 border-dashed p-10 text-center transition-all cursor-pointer ${
          dragActive ? "drop-zone-active" : "border-border hover:border-muted"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".txt,.md,.pdf,.doc,.docx,.png,.jpg,.jpeg,.csv"
          onChange={handleFileInput}
        />
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <p className="font-medium mb-1">Drop your assignment file here</p>
        <p className="text-sm text-muted mb-3">or click to browse</p>
        <p className="text-xs text-muted">Supports .txt, .md, .pdf, .doc, .docx, .csv, and images</p>
      </div>

      {/* Scanning Indicator */}
      {scanning && (
        <div className="glass-card p-6 mt-6 text-center animate-scale-in">
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-medium">Scanning {fileName}...</p>
          </div>
          <p className="text-sm text-muted mt-2">Extracting assignment details with AI</p>
        </div>
      )}

      {/* Scanned Result */}
      {scannedResult && !scanning && !saved && (
        <div className="glass-card p-6 mt-6 animate-slide-up-fade">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            <h3 className="font-semibold">Scan Complete</h3>
            <span className="text-xs text-muted ml-auto">{fileName}</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Title</label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>

            {scannedResult.description && (
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Description</label>
                <p className="text-sm text-muted bg-surface-hover rounded-lg p-3">{scannedResult.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Class"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                options={[
                  { value: "", label: "Select class..." },
                  ...courses.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
              <Select
                label="Folder"
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                options={[
                  { value: "", label: "No folder" },
                  ...folders.map((f) => ({ value: f.id, label: f.name })),
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Due Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                />
              </div>
              <Select
                label="Priority"
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as Priority)}
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                  { value: "urgent", label: "Urgent" },
                ]}
              />
            </div>

            {scannedResult.tags.length > 0 && (
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Detected Tags</label>
                <div className="flex gap-1.5 flex-wrap">
                  {scannedResult.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-primary/10 text-primary rounded-full px-2.5 py-1 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="secondary" onClick={reset}>Cancel</Button>
              <Button onClick={handleSave} disabled={!selectedCourse}>Add Assignment</Button>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {saved && (
        <div className="glass-card p-8 mt-6 text-center animate-scale-in">
          <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h3 className="font-semibold text-lg mb-1">Assignment Added!</h3>
          <p className="text-sm text-muted mb-4">
            &quot;{editTitle}&quot; has been added to your assignments.
          </p>
          <Button onClick={reset}>Upload Another</Button>
        </div>
      )}

      {/* Tips */}
      {!scannedResult && !scanning && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z", title: "Text Files", desc: "Best results with .txt and .md files" },
            { icon: "M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z", title: "Auto-Tags", desc: "Detects essay, exam, homework, etc." },
            { icon: "M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z", title: "Smart Folders", desc: "Auto-sorts into the right folder" },
          ].map((tip) => (
            <div key={tip.title} className="glass-card p-4 text-center">
              <svg className="w-6 h-6 text-primary mx-auto mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={tip.icon} />
              </svg>
              <p className="text-sm font-medium mb-0.5">{tip.title}</p>
              <p className="text-xs text-muted">{tip.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

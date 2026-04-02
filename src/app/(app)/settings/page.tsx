"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { THEMES, FOLDER_COLORS } from "@/types";
import type { ThemeName } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

export default function SettingsPage() {
  const { theme, setTheme, darkMode, toggleDarkMode, folders, addFolder, updateFolder, deleteFolder } = useApp();
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [folderName, setFolderName] = useState("");
  const [folderColor, setFolderColor] = useState(FOLDER_COLORS[0]);

  const handleThemeChange = (name: ThemeName) => {
    setTheme(name);
  };

  const openAddFolder = () => {
    setEditingFolder(null);
    setFolderName("");
    setFolderColor(FOLDER_COLORS[0]);
    setShowFolderForm(true);
  };

  const openEditFolder = (id: string) => {
    const f = folders.find((f) => f.id === id);
    if (!f) return;
    setEditingFolder(id);
    setFolderName(f.name);
    setFolderColor(f.color);
    setShowFolderForm(true);
  };

  const saveFolder = () => {
    if (!folderName.trim()) return;
    if (editingFolder) {
      updateFolder(editingFolder, { name: folderName.trim(), color: folderColor });
    } else {
      addFolder({ name: folderName.trim(), color: folderColor });
    }
    setShowFolderForm(false);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <p className="text-muted text-sm mb-8">Customize your StudyBoard experience</p>

      {/* Theme Section */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-1">Theme</h2>
        <p className="text-sm text-muted mb-4">Choose a color theme for the app</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {THEMES.map((t) => {
            const isActive = theme === t.name;
            return (
              <button
                key={t.name}
                onClick={() => handleThemeChange(t.name)}
                className={`glass-card p-4 text-left cursor-pointer transition-all duration-150 ${
                  isActive
                    ? "ring-2 ring-offset-2 ring-offset-background"
                    : "hover:scale-[1.02]"
                }`}
                style={isActive ? { ringColor: t.color } as React.CSSProperties : undefined}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-8 h-8 rounded-lg shadow-sm"
                    style={{ backgroundColor: t.color }}
                  />
                  <div>
                    <p className="font-medium text-sm">{t.label}</p>
                    <p className="text-xs text-muted">{t.description}</p>
                  </div>
                </div>
                {/* Preview bar */}
                <div className="flex gap-1 mt-2">
                  <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: t.color }} />
                  <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: t.color, opacity: 0.5 }} />
                  <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: t.color, opacity: 0.25 }} />
                </div>
                {isActive && (
                  <div className="flex items-center gap-1 mt-2">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke={t.color}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span className="text-xs font-medium" style={{ color: t.color }}>Active</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Dark Mode Toggle */}
      {theme !== "midnight" && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-1">Appearance</h2>
          <p className="text-sm text-muted mb-4">Toggle between light and dark mode</p>

          <div className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-hover flex items-center justify-center">
                {darkMode ? (
                  <svg className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-medium text-sm">Dark Mode</p>
                <p className="text-xs text-muted">{darkMode ? "Currently using dark theme" : "Currently using light theme"}</p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                darkMode ? "bg-primary" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  darkMode ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </section>
      )}

      {/* Folders Section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold">Folders</h2>
          <Button size="sm" onClick={openAddFolder}>+ New Folder</Button>
        </div>
        <p className="text-sm text-muted mb-4">Organize your assignments into folders</p>

        {folders.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-surface-hover flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
              </svg>
            </div>
            <p className="text-muted text-sm">No folders yet. Create one to organize your assignments.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {folders.map((f) => (
              <div key={f.id} className="glass-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: f.color }} />
                  <span className="font-medium text-sm">{f.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditFolder(f.id)}
                    className="text-xs text-muted hover:text-foreground cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { if (confirm(`Delete folder "${f.name}"?`)) deleteFolder(f.id); }}
                    className="text-xs text-danger hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* About */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-1">About</h2>
        <div className="glass-card p-4">
          <p className="text-sm text-muted">StudyBoard v1.0 — Your personal assignment organizer. All data is stored locally in your browser.</p>
        </div>
      </section>

      {/* Folder Form Modal */}
      <Modal open={showFolderForm} onClose={() => setShowFolderForm(false)} title={editingFolder ? "Edit Folder" : "New Folder"}>
        <div className="space-y-4">
          <Input
            label="Folder Name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="e.g., Homework, Projects, Exams"
          />
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setFolderColor(c)}
                  className={`w-8 h-8 rounded-lg cursor-pointer transition-transform ${
                    folderColor === c ? "ring-2 ring-offset-2 ring-offset-surface scale-110" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c, ringColor: folderColor === c ? c : undefined } as React.CSSProperties}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setShowFolderForm(false)}>Cancel</Button>
            <Button onClick={saveFolder}>{editingFolder ? "Save" : "Create"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

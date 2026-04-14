import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import Topbar from "./components/Topbar";
import VersionHistory from "./components/VersionHistory";
import { useNotes } from "./hooks/useNotes";
import { notesApi } from "./services/api";
import "./styles/globals.css";
import "./App.css";

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [showVersions, setShowVersions] = useState(false);

  const {
    notes, activeNote, loading, saving, error,
    searchQuery, setSearchQuery,
    activeTag, setActiveTag,
    tags,
    fetchNotes, fetchTags, selectNote, createNote,
    saveNote, scheduleSave, flushSave, deleteNote,
    clearError,
  } = useNotes();

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Initial load
  useEffect(() => {
    fetchNotes();
    fetchTags();
  }, []);

  // Keyboard shortcut: Ctrl+N
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        handleCreateNote();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleCreateNote = async () => {
    const note = await createNote();
    if (note) fetchNotes({ search: searchQuery, tag: activeTag });
  };

  const handleSelectNote = async (id) => {
    await selectNote(id);
  };

  const handleDeleteNote = async (id) => {
    await deleteNote(id);
    fetchNotes({ search: searchQuery, tag: activeTag });
    fetchTags();
  };

  const handleSaveNote = async (id, data) => {
    await flushSave(id, data);
    fetchNotes({ search: searchQuery, tag: activeTag });
    fetchTags();
  };

  const handleScheduleSave = (id, data) => {
    scheduleSave(id, data);
    // Optimistic update in list
  };

  const handleRestoreVersion = async (noteId, versionId) => {
    const res = await notesApi.restoreVersion(noteId, versionId);
    if (res.data) {
      await selectNote(noteId);
      fetchNotes({ search: searchQuery, tag: activeTag });
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        notes={notes}
        activeNote={activeNote}
        loading={loading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTag={activeTag}
        setActiveTag={setActiveTag}
        tags={tags}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
        onFetchNotes={fetchNotes}
      />

      <div className="app-main">
        <Topbar
          activeNote={activeNote}
          saving={saving}
          theme={theme}
          onToggleTheme={() => setTheme(t => t === "dark" ? "light" : "dark")}
          onShowVersions={() => setShowVersions(true)}
        />

        {error && (
          <div className="app-error" onClick={clearError}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
            <button className="app-error__dismiss" aria-label="Dismiss error">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}

        <Editor
          note={activeNote}
          saving={saving}
          onSave={handleSaveNote}
          onScheduleSave={handleScheduleSave}
        />
      </div>

      {showVersions && activeNote && (
        <VersionHistory
          note={activeNote}
          onRestore={handleRestoreVersion}
          onClose={() => setShowVersions(false)}
        />
      )}
    </div>
  );
}

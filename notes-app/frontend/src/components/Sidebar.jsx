import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import "./Sidebar.css";

function NoteItem({ note, isActive, onClick, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete(note.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 2500);
    }
  };

  const preview = (note.content || "").replace(/[#*`_~\[\]]/g, "").trim().slice(0, 80);
  const date = note.updated_at
    ? formatDistanceToNow(new Date(note.updated_at.replace(" ", "T") + "Z"), { addSuffix: true })
    : "";

  return (
    <div
      className={`note-item${isActive ? " note-item--active" : ""}`}
      onClick={onClick}
    >
      <div className="note-item__body">
        <div className="note-item__title">{note.title || "Untitled"}</div>
        <div className="note-item__preview">{preview || "Empty note"}</div>
        <div className="note-item__meta">
          <span className="note-item__date">{date}</span>
          {note.tags && (
            <span className="note-item__tags">
              {note.tags.split(",").filter(Boolean).slice(0, 2).map((t) => (
                <span key={t} className="note-item__tag">{t.trim()}</span>
              ))}
            </span>
          )}
        </div>
      </div>
      <button
        className={`note-item__delete${confirmDelete ? " note-item__delete--confirm" : ""}`}
        onClick={handleDelete}
        title={confirmDelete ? "Click again to confirm delete" : "Delete note"}
        aria-label="Delete note"
      >
        {confirmDelete ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        )}
      </button>
    </div>
  );
}

export default function Sidebar({
  notes, activeNote, loading,
  searchQuery, setSearchQuery,
  activeTag, setActiveTag,
  tags,
  onSelectNote, onCreateNote, onDeleteNote,
  onFetchNotes,
}) {
  useEffect(() => {
    onFetchNotes({ search: searchQuery, tag: activeTag });
  }, [searchQuery, activeTag]);

  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <div className="sidebar__brand">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
          <span className="sidebar__brand-name">Notecraft</span>
        </div>
        <button className="sidebar__new-btn" onClick={onCreateNote} title="New note (Ctrl+N)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      <div className="sidebar__search">
        <svg className="sidebar__search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sidebar__search-input"
          aria-label="Search notes"
        />
        {searchQuery && (
          <button className="sidebar__search-clear" onClick={() => setSearchQuery("")} aria-label="Clear search">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {tags.length > 0 && (
        <div className="sidebar__tags">
          <button
            className={`sidebar__tag-pill${!activeTag ? " sidebar__tag-pill--active" : ""}`}
            onClick={() => setActiveTag("")}
          >All</button>
          {tags.map((t) => (
            <button
              key={t}
              className={`sidebar__tag-pill${activeTag === t ? " sidebar__tag-pill--active" : ""}`}
              onClick={() => setActiveTag(activeTag === t ? "" : t)}
            >{t}</button>
          ))}
        </div>
      )}

      <div className="sidebar__list">
        {loading && (
          <div className="sidebar__state">
            {[1,2,3].map(i => <div key={i} className="note-skeleton" />)}
          </div>
        )}
        {!loading && notes.length === 0 && (
          <div className="sidebar__empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
            <p>{searchQuery ? "No notes found" : "No notes yet"}</p>
            {!searchQuery && (
              <button className="sidebar__empty-btn" onClick={onCreateNote}>Create your first note</button>
            )}
          </div>
        )}
        {!loading && notes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            isActive={activeNote?.id === note.id}
            onClick={() => onSelectNote(note.id)}
            onDelete={onDeleteNote}
          />
        ))}
      </div>
    </aside>
  );
}

import React from "react";
import "./Topbar.css";

export default function Topbar({ activeNote, saving, theme, onToggleTheme, onShowVersions }) {
  return (
    <div className="topbar">
      <div className="topbar__left">
        {activeNote && (
          <span className="topbar__note-name">{activeNote.title || "Untitled"}</span>
        )}
      </div>
      <div className="topbar__right">
        {saving && (
          <span className="topbar__saving">
            <span className="topbar__saving-dot" />
            Auto-saving
          </span>
        )}
        {activeNote && (
          <button
            className="topbar__action-btn"
            onClick={onShowVersions}
            title="Version history"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            History
          </button>
        )}
        <button
          className="topbar__icon-btn"
          onClick={onToggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { notesApi } from "../services/api";
import "./VersionHistory.css";

export default function VersionHistory({ note, onRestore, onClose }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(null);

  useEffect(() => {
    if (!note) return;
    setLoading(true);
    notesApi.getVersions(note.id).then((res) => {
      setVersions(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [note?.id]);

  const handleRestore = async (versionId) => {
    setRestoring(versionId);
    try {
      await onRestore(note.id, versionId);
      onClose();
    } finally {
      setRestoring(null);
    }
  };

  return (
    <div className="vh-overlay" onClick={onClose}>
      <div className="vh-panel fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="vh-header">
          <div>
            <div className="vh-title">Version History</div>
            <div className="vh-subtitle">{note?.title}</div>
          </div>
          <button className="vh-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="vh-body">
          {loading && (
            <div className="vh-loading">
              {[1,2,3].map(i => <div key={i} className="vh-skeleton" />)}
            </div>
          )}
          {!loading && versions.length === 0 && (
            <div className="vh-empty">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
              </svg>
              <p>No version history yet</p>
              <span>Versions are saved each time you edit a note.</span>
            </div>
          )}
          {!loading && versions.map((v) => {
            const date = v.saved_at
              ? formatDistanceToNow(new Date(v.saved_at.replace(" ", "T") + "Z"), { addSuffix: true })
              : "";
            return (
              <div key={v.id} className="vh-item">
                <div className="vh-item__info">
                  <div className="vh-item__title">{v.title}</div>
                  <div className="vh-item__date">{date}</div>
                  <div className="vh-item__excerpt">{v.excerpt}</div>
                </div>
                <button
                  className="vh-item__restore"
                  onClick={() => handleRestore(v.id)}
                  disabled={restoring === v.id}
                >
                  {restoring === v.id ? "Restoring..." : "Restore"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

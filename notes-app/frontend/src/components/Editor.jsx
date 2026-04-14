import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import "./Editor.css";

// Custom image component to ensure images render properly
const ImageComponent = ({ src, alt }) => (
  <img
    src={src}
    alt={alt}
    style={{
      maxWidth: "100%",
      maxHeight: "300px",
      height: "auto",
      objectFit: "contain",
    }}
    onError={(e) => {
      e.target.style.border = "2px dashed #ff6b6b";
      e.target.alt = `Failed to load: ${alt}`;
    }}
  />
);

function insertAround(textarea, before, after = before) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end) || "text";
  const newVal =
    textarea.value.slice(0, start) +
    before +
    selected +
    after +
    textarea.value.slice(end);
  return {
    value: newVal,
    selStart: start + before.length,
    selEnd: start + before.length + selected.length,
  };
}

function insertLinePrefix(textarea, prefix) {
  const start = textarea.selectionStart;
  const lineStart = textarea.value.lastIndexOf("\n", start - 1) + 1;
  const newVal =
    textarea.value.slice(0, lineStart) +
    prefix +
    textarea.value.slice(lineStart);
  return { value: newVal, cursor: start + prefix.length };
}

const TOOLBAR_GROUPS = [
  [
    {
      icon: "B",
      title: "Bold",
      fn: (ta) => insertAround(ta, "**"),
      bold: true,
    },
    {
      icon: "I",
      title: "Italic",
      fn: (ta) => insertAround(ta, "*"),
      italic: true,
    },
    {
      icon: "S",
      title: "Strikethrough",
      fn: (ta) => insertAround(ta, "~~"),
      strike: true,
    },
    {
      icon: "U",
      title: "Underline",
      fn: (ta) => insertAround(ta, "<u>", "</u>"),
      mono: true,
    },
  ],
  [
    {
      icon: "H1",
      title: "Heading 1",
      fn: (ta) => insertLinePrefix(ta, "# "),
      mono: true,
    },
    {
      icon: "H2",
      title: "Heading 2",
      fn: (ta) => insertLinePrefix(ta, "## "),
      mono: true,
    },
    {
      icon: "H3",
      title: "Heading 3",
      fn: (ta) => insertLinePrefix(ta, "### "),
      mono: true,
    },
  ],
  [
    {
      icon: "UL",
      title: "Bullet list",
      fn: (ta) => insertLinePrefix(ta, "- "),
      mono: true,
    },
    {
      icon: "OL",
      title: "Numbered list",
      fn: (ta) => insertLinePrefix(ta, "1. "),
      mono: true,
    },
    {
      icon: "☐",
      title: "Task list",
      fn: (ta) => insertLinePrefix(ta, "- [ ] "),
      mono: true,
    },
    {
      icon: ">",
      title: "Blockquote",
      fn: (ta) => insertLinePrefix(ta, "> "),
      mono: true,
    },
  ],
  [
    {
      icon: "`",
      title: "Inline code",
      fn: (ta) => insertAround(ta, "`"),
      mono: true,
    },
    {
      icon: "```",
      title: "Code block",
      fn: (ta) => insertAround(ta, "```\n", "\n```"),
      mono: true,
    },
    {
      icon: "link",
      title: "Hyperlink",
      svg: true,
      fn: (ta) => {
        const sel =
          ta.value.slice(ta.selectionStart, ta.selectionEnd) || "text";
        const ins = `[${sel}](url)`;
        const v =
          ta.value.slice(0, ta.selectionStart) +
          ins +
          ta.value.slice(ta.selectionEnd);
        return { value: v, cursor: ta.selectionStart + ins.length };
      },
    },
    {
      icon: "Pic",
      title: "Image",
      fn: (ta) => {
        const ins = `![Add a descriptive caption here](https://via.placeholder.com/600x400?text=Your+Image)`;
        const v =
          ta.value.slice(0, ta.selectionStart) +
          "\n" +
          ins +
          "\n" +
          ta.value.slice(ta.selectionEnd);
        return { value: v, cursor: ta.selectionStart + 1 };
      },
      mono: true,
    },
  ],
  [
    {
      icon: "—",
      title: "Horizontal rule",
      fn: (ta) => {
        const start = ta.selectionStart;
        const lineStart = ta.value.lastIndexOf("\n", start - 1) + 1;
        const newVal =
          ta.value.slice(0, lineStart) + "\n---\n" + ta.value.slice(lineStart);
        return { value: newVal, cursor: start + 5 };
      },
      mono: true,
    },
    {
      icon: "Tbl",
      title: "Table",
      fn: (ta) => {
        const table = `| Feature | Description | Status |
|---------|-------------|--------|
| Item 1  | Description | ✅     |
| Item 2  | Description | ⏳     |
| Item 3  | Description | ❌     |
`;
        const v =
          ta.value.slice(0, ta.selectionStart) +
          "\n" +
          table +
          ta.value.slice(ta.selectionEnd);
        return { value: v, cursor: ta.selectionStart + 1 };
      },
      mono: true,
    },
  ],
];

export default function Editor({ note, saving, onSave, onScheduleSave }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [view, setView] = useState("split");
  const [saved, setSaved] = useState(false);
  const taRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    if (!note) return;
    setTitle(note.title ?? "");
    setContent(note.content ?? "");
    setTags(note.tags ?? "");
    setSaved(false);
  }, [note?.id]);

  const handleContent = (e) => {
    setContent(e.target.value);
    setSaved(false);
    if (note) onScheduleSave(note.id, { title, content: e.target.value, tags });
  };

  const handleTitle = (e) => {
    setTitle(e.target.value);
    setSaved(false);
    if (note) onScheduleSave(note.id, { title: e.target.value, content, tags });
  };

  const handleTags = (e) => {
    setTags(e.target.value);
    setSaved(false);
    if (note) onScheduleSave(note.id, { title, content, tags: e.target.value });
  };

  const handleSave = useCallback(async () => {
    if (!note) return;
    await onSave(note.id, { title, content, tags });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [note, title, content, tags, onSave]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = taRef.current;
      const s = ta.selectionStart;
      const newVal =
        content.slice(0, s) + "  " + content.slice(ta.selectionEnd);
      setContent(newVal);
      requestAnimationFrame(() => ta.setSelectionRange(s + 2, s + 2));
    }
  };

  const handleScroll = (e) => {
    if (view === "split" && previewRef.current) {
      const scrollPercentage =
        e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight);
      const previewMaxScroll =
        previewRef.current.scrollHeight - previewRef.current.clientHeight;
      previewRef.current.scrollTop = scrollPercentage * previewMaxScroll;
    }
  };

  const applyAction = (fn) => {
    const ta = taRef.current;
    if (!ta) return;
    const result = fn(ta);
    if (!result) return;
    setContent(result.value);
    setSaved(false);
    if (note) onScheduleSave(note.id, { title, content: result.value, tags });
    requestAnimationFrame(() => {
      ta.focus();
      if (result.selStart != null)
        ta.setSelectionRange(result.selStart, result.selEnd);
      else ta.setSelectionRange(result.cursor, result.cursor);
    });
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  if (!note) {
    return (
      <div className="ed-empty">
        <div className="ed-empty__icon">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10,9 9,9 8,9" />
          </svg>
        </div>
        <p className="ed-empty__title">No note selected</p>
        <p className="ed-empty__hint">
          Pick a note from the list or press <kbd>Ctrl N</kbd> to create one.
        </p>
      </div>
    );
  }

  return (
    <div className="ed">
      <div className="ed-header">
        <input
          className="ed-title"
          value={title}
          onChange={handleTitle}
          placeholder="Note title"
          aria-label="Note title"
          spellCheck
        />
        <div className="ed-tags-row">
          <svg
            className="ed-tags-icon"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          <input
            className="ed-tags"
            value={tags}
            onChange={handleTags}
            placeholder="add tags, separated by commas"
            aria-label="Tags"
          />
        </div>
      </div>

      <div
        className="ed-toolbar"
        role="toolbar"
        aria-label="Markdown formatting"
      >
        <div className="ed-toolbar__groups">
          {TOOLBAR_GROUPS.map((group, gi) => (
            <React.Fragment key={gi}>
              {gi > 0 && <div className="ed-toolbar__sep" aria-hidden="true" />}
              <div className="ed-toolbar__group">
                {group.map((btn) => (
                  <button
                    key={btn.title}
                    className="ed-toolbar__btn"
                    title={btn.title}
                    aria-label={btn.title}
                    onClick={() => applyAction(btn.fn)}
                    style={{
                      fontWeight: btn.bold ? 700 : undefined,
                      fontStyle: btn.italic ? "italic" : undefined,
                      textDecoration: btn.strike ? "line-through" : undefined,
                      fontFamily: btn.mono ? "var(--font-mono)" : undefined,
                      fontSize: btn.mono ? "0.72rem" : undefined,
                    }}
                  >
                    {btn.svg ? (
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                      </svg>
                    ) : (
                      btn.icon
                    )}
                  </button>
                ))}
              </div>
            </React.Fragment>
          ))}
        </div>

        <div className="ed-toolbar__right">
          <div className="ed-view-toggle" role="group" aria-label="View mode">
            {["write", "split", "preview"].map((id) => (
              <button
                key={id}
                className={`ed-view-btn${view === id ? " ed-view-btn--on" : ""}`}
                onClick={() => setView(id)}
                aria-pressed={view === id}
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>

          <button
            className={`ed-save${saved ? " ed-save--ok" : ""}`}
            onClick={handleSave}
            disabled={saving}
            aria-label="Save note"
          >
            {saving ? (
              <span className="ed-save__spinner" />
            ) : saved ? (
              <>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                Saved
              </>
            ) : (
              <>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                  <polyline points="17,21 17,13 7,13 7,21" />
                  <polyline points="7,3 7,8 15,8" />
                </svg>
                Save
              </>
            )}
          </button>
        </div>
      </div>

      <div className={`ed-panels ed-panels--${view}`}>
        {view !== "preview" && (
          <div className="ed-panel ed-panel--write">
            {view === "split" && (
              <div className="ed-panel__label">Markdown</div>
            )}
            <textarea
              ref={taRef}
              className="ed-textarea"
              value={content}
              onChange={handleContent}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              placeholder={
                "# Start writing...\n\nUse **bold**, *italic*, `code`, and more."
              }
              spellCheck
              aria-label="Note content"
            />
          </div>
        )}

        {view === "split" && <div className="ed-divider" aria-hidden="true" />}

        {view !== "write" && (
          <div className="ed-panel ed-panel--preview">
            {view === "split" && <div className="ed-panel__label">Preview</div>}
            <div ref={previewRef} className="ed-preview">
              {content.trim() ? (
                <ReactMarkdown
                  remarkPlugins={[remarkBreaks, remarkGfm]}
                  components={{
                    img: ({ node, ...props }) => <ImageComponent {...props} />,
                  }}
                >
                  {content}
                </ReactMarkdown>
              ) : (
                <p className="ed-preview__empty">Nothing to preview yet.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="ed-status" aria-live="polite">
        <span>
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
        <span>{charCount} chars</span>
        <span className="ed-status__spacer" />
        <span className="ed-status__hint">
          Ctrl+S to save &nbsp;&middot;&nbsp; Tab to indent
        </span>
        {saving && <span className="ed-status__saving">saving&hellip;</span>}
      </div>
    </div>
  );
}

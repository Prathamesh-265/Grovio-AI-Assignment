const db = require("../db/database");

const MAX_VERSIONS = 20;

function listNotes(req, res) {
  try {
    const { search, tag, limit = 50, offset = 0 } = req.query;
    let sql = `SELECT id, title, content, tags, created_at, updated_at FROM notes`;
    const params = [];
    const where = [];
    if (search && search.trim()) {
      where.push(`(title LIKE ? OR content LIKE ?)`);
      const t = `%${search.trim()}%`;
      params.push(t, t);
    }
    if (tag && tag.trim()) {
      where.push(`(',' || tags || ',' LIKE ?)`);
      params.push(`%,${tag.trim()},%`);
    }
    if (where.length) sql += ` WHERE ` + where.join(" AND ");
    const total = db.all(sql, params).length;
    sql += ` ORDER BY updated_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));
    const notes = db.all(sql, params);
    res.json({ success: true, data: notes, meta: { total, limit: Number(limit), offset: Number(offset) } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}

function getNote(req, res) {
  try {
    const note = db.get(`SELECT * FROM notes WHERE id = ?`, [req.params.id]);
    if (!note) return res.status(404).json({ success: false, error: "Note not found" });
    res.json({ success: true, data: note });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}

function createNote(req, res) {
  try {
    const { title = "Untitled", content = "", tags = "" } = req.body;
    db.run(
      `INSERT INTO notes (title, content, tags, created_at, updated_at) VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
      [title.trim(), content, tags.trim()]
    );
    const id = db.getLastInsertId();
    const note = db.get(`SELECT * FROM notes WHERE id = ?`, [id]);
    res.status(201).json({ success: true, data: note });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}

function updateNote(req, res) {
  try {
    const { id } = req.params;
    const existing = db.get(`SELECT * FROM notes WHERE id = ?`, [id]);
    if (!existing) return res.status(404).json({ success: false, error: "Note not found" });

    // Save version
    db.run(
      `INSERT INTO note_versions (note_id, title, content, saved_at) VALUES (?, ?, ?, datetime('now'))`,
      [existing.id, existing.title, existing.content]
    );
    // Prune versions
    const versions = db.all(`SELECT id FROM note_versions WHERE note_id = ? ORDER BY saved_at ASC`, [id]);
    if (versions.length > MAX_VERSIONS) {
      const toDelete = versions.slice(0, versions.length - MAX_VERSIONS).map(v => v.id);
      toDelete.forEach(vid => db.run(`DELETE FROM note_versions WHERE id = ?`, [vid]));
    }

    const { title, content, tags } = req.body;
    const fields = [];
    const params = [];
    if (title !== undefined) { fields.push("title = ?"); params.push(title.trim()); }
    if (content !== undefined) { fields.push("content = ?"); params.push(content); }
    if (tags !== undefined) { fields.push("tags = ?"); params.push(tags.trim()); }
    fields.push("updated_at = datetime('now')");
    params.push(id);
    db.run(`UPDATE notes SET ${fields.join(", ")} WHERE id = ?`, params);

    const updated = db.get(`SELECT * FROM notes WHERE id = ?`, [id]);
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}

function deleteNote(req, res) {
  try {
    const { id } = req.params;
    const note = db.get(`SELECT id FROM notes WHERE id = ?`, [id]);
    if (!note) return res.status(404).json({ success: false, error: "Note not found" });
    db.run(`DELETE FROM note_versions WHERE note_id = ?`, [id]);
    db.run(`DELETE FROM notes WHERE id = ?`, [id]);
    res.json({ success: true, message: "Note deleted" });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}

function getNoteVersions(req, res) {
  try {
    const { id } = req.params;
    const note = db.get(`SELECT id FROM notes WHERE id = ?`, [id]);
    if (!note) return res.status(404).json({ success: false, error: "Note not found" });
    const versions = db.all(
      `SELECT id, note_id, title, SUBSTR(content, 1, 200) AS excerpt, saved_at FROM note_versions WHERE note_id = ? ORDER BY saved_at DESC LIMIT 20`,
      [id]
    );
    res.json({ success: true, data: versions });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}

function restoreVersion(req, res) {
  try {
    const { id, versionId } = req.params;
    const version = db.get(`SELECT * FROM note_versions WHERE id = ? AND note_id = ?`, [versionId, id]);
    if (!version) return res.status(404).json({ success: false, error: "Version not found" });
    const existing = db.get(`SELECT * FROM notes WHERE id = ?`, [id]);
    if (!existing) return res.status(404).json({ success: false, error: "Note not found" });
    db.run(`INSERT INTO note_versions (note_id, title, content, saved_at) VALUES (?, ?, ?, datetime('now'))`, [existing.id, existing.title, existing.content]);
    db.run(`UPDATE notes SET title = ?, content = ?, updated_at = datetime('now') WHERE id = ?`, [version.title, version.content, id]);
    const restored = db.get(`SELECT * FROM notes WHERE id = ?`, [id]);
    res.json({ success: true, data: restored });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}

function getAllTags(req, res) {
  try {
    const rows = db.all(`SELECT tags FROM notes WHERE tags != ''`);
    const tagSet = new Set();
    rows.forEach(({ tags }) => tags.split(",").map(t => t.trim()).filter(Boolean).forEach(t => tagSet.add(t)));
    res.json({ success: true, data: Array.from(tagSet).sort() });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}

module.exports = { listNotes, getNote, createNote, updateNote, deleteNote, getNoteVersions, restoreVersion, getAllTags };

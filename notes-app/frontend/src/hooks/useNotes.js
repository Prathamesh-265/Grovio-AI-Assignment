import { useState, useCallback, useRef } from "react";
import { notesApi } from "../services/api";

export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [tags, setTags] = useState([]);
  const saveTimerRef = useRef(null);

  const clearError = () => setError(null);

  const fetchNotes = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await notesApi.list(params);
      setNotes(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTags = useCallback(async () => {
    try {
      const res = await notesApi.getTags();
      setTags(res.data);
    } catch {}
  }, []);

  const selectNote = useCallback(async (id) => {
    setError(null);
    try {
      const res = await notesApi.get(id);
      setActiveNote(res.data);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const createNote = useCallback(async () => {
    setError(null);
    try {
      const res = await notesApi.create({
        title: "Untitled",
        content: "# Untitled\n\nStart writing here...",
        tags: "",
      });
      setNotes((prev) => [res.data, ...prev]);
      setActiveNote(res.data);
      return res.data;
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const saveNote = useCallback(async (id, data) => {
    setSaving(true);
    setError(null);
    try {
      const res = await notesApi.update(id, data);
      setActiveNote(res.data);
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...res.data } : n))
      );
      await fetchTags();
      return res.data;
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }, [fetchTags]);

  const scheduleSave = useCallback((id, data, delay = 1200) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveNote(id, data), delay);
  }, [saveNote]);

  const flushSave = useCallback((id, data) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    return saveNote(id, data);
  }, [saveNote]);

  const deleteNote = useCallback(async (id) => {
    setError(null);
    try {
      await notesApi.delete(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (activeNote?.id === id) setActiveNote(null);
    } catch (e) {
      setError(e.message);
    }
  }, [activeNote]);

  return {
    notes, activeNote, loading, saving, error,
    searchQuery, setSearchQuery,
    activeTag, setActiveTag,
    tags,
    fetchNotes, fetchTags, selectNote, createNote,
    saveNote, scheduleSave, flushSave, deleteNote,
    setActiveNote, clearError,
  };
}

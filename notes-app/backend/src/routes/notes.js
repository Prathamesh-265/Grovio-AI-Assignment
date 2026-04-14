const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/notesController");

// Notes CRUD
router.get("/", ctrl.listNotes);
router.get("/tags", ctrl.getAllTags);
router.get("/:id", ctrl.getNote);
router.post("/", ctrl.createNote);
router.put("/:id", ctrl.updateNote);
router.delete("/:id", ctrl.deleteNote);

// Version history
router.get("/:id/versions", ctrl.getNoteVersions);
router.post("/:id/versions/:versionId/restore", ctrl.restoreVersion);

module.exports = router;

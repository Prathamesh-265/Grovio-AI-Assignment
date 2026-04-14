const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { initDb } = require("./db/database");
const notesRouter = require("./routes/notes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));
app.use("/api/notes", notesRouter);
app.use(notFound);
app.use(errorHandler);

initDb().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}).catch(err => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});

module.exports = app;

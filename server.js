// ============================================================
//  Taskr — Express Server
//  REST API: GET / POST / PATCH / DELETE /api/todos
// ============================================================

const express = require("express");
const path    = require("path");
const db      = require("./db");

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}]  ${req.method.padEnd(7)} ${req.path}`);
  next();
});

// ── Helpers ──────────────────────────────────────────────────
const ok   = (res, data, status = 200) => res.status(status).json({ ok: true,  data });
const fail = (res, msg,  status = 400) => res.status(status).json({ ok: false, error: msg });

// ── Routes ───────────────────────────────────────────────────

// GET /api/todos  — list all todos (optional ?filter=all|active|done)
app.get("/api/todos", (req, res) => {
  const { filter = "all" } = req.query;
  let list = db.getAll();
  if (filter === "active") list = list.filter((t) => !t.done);
  if (filter === "done")   list = list.filter((t) =>  t.done);
  ok(res, list);
});

// GET /api/todos/stats  — live counters
app.get("/api/todos/stats", (_req, res) => {
  ok(res, db.stats());
});

// GET /api/todos/:id  — single todo
app.get("/api/todos/:id", (req, res) => {
  const id   = parseInt(req.params.id, 10);
  const todo = db.getById(id);
  if (!todo) return fail(res, "Todo not found.", 404);
  ok(res, todo);
});

// POST /api/todos  — create
app.post("/api/todos", (req, res) => {
  try {
    const todo = db.create(req.body);
    ok(res, todo, 201);
  } catch (e) {
    fail(res, e.message);
  }
});

// PATCH /api/todos/:id  — update (text | priority | done)
app.patch("/api/todos/:id", (req, res) => {
  const id   = parseInt(req.params.id, 10);
  const todo = db.update(id, req.body);
  if (!todo) return fail(res, "Todo not found.", 404);
  ok(res, todo);
});

// DELETE /api/todos/:id  — delete
app.delete("/api/todos/:id", (req, res) => {
  const id      = parseInt(req.params.id, 10);
  const deleted = db.remove(id);
  if (!deleted) return fail(res, "Todo not found.", 404);
  ok(res, { id });
});

// ── Catch-all ────────────────────────────────────────────────
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ╔══════════════════════════════╗`);
  console.log(`  ║   TASKR  running on :${PORT}    ║`);
  console.log(`  ╚══════════════════════════════╝\n`);
});

module.exports = app;

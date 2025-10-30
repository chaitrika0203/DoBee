import React, { useEffect, useState, useRef } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

export default function DoBeeApp() {
  const [tasks, setTasks] = useState([]);
  const [queryText, setQueryText] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | completed
  const inputRef = useRef(null);

  const tasksRef = collection(db, "tasks");

  // ✅ Real-time sync from Firestore
  useEffect(() => {
    const q = query(tasksRef, orderBy("created", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // ✅ Add a new task
  async function addTask(title) {
    const trimmed = title.trim();
    if (!trimmed) return;
    await addDoc(tasksRef, {
      title: trimmed,
      done: false,
      created: Date.now(),
    });
  }

  // ✅ Toggle done
  async function toggleDone(id, done) {
    const ref = doc(db, "tasks", id);
    await updateDoc(ref, { done: !done });
  }

  // ✅ Edit task
  async function editTask(id, title) {
    const ref = doc(db, "tasks", id);
    await updateDoc(ref, { title });
  }

  // ✅ Remove task
  async function removeTask(id) {
    const ref = doc(db, "tasks", id);
    await deleteDoc(ref);
  }

  // ✅ Filter + search
  const visible = tasks
    .filter((t) => {
      if (filter === "active") return !t.done;
      if (filter === "completed") return t.done;
      return true;
    })
    .filter((t) => t.title.toLowerCase().includes(queryText.toLowerCase()));

  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="container flex-grow-1 d-flex flex-column py-4">
        {/* Header */}
        <header className="d-flex align-items-center mb-4">
          <div className="me-3 bee-avatar" title="DoBee">
            🐝
          </div>
          <div>
            <h1 className="h3 mb-0">DoBee</h1>
            <div className="text-muted small">
              A simple task manager to get things done 🐝
            </div>
          </div>
        </header>

        {/* Full-height task card */}
        <div className="card shadow-sm flex-grow-1 d-flex flex-column">
          <div className="card-body d-flex flex-column overflow-hidden">
            <AddTask onAdd={addTask} inputRef={inputRef} />

            <div className="row g-2 align-items-center mt-3">
              <div className="col-sm-6">
                <input
                  className="form-control"
                  placeholder="Search tasks..."
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                />
              </div>
              <div className="col-sm-6 text-sm-end">
                <div className="btn-group">
                  <button
                    className={`btn ${
                      filter === "all"
                        ? "btn-warning"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => setFilter("all")}
                  >
                    All
                  </button>
                  <button
                    className={`btn ${
                      filter === "active"
                        ? "btn-warning"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => setFilter("active")}
                  >
                    Active
                  </button>
                  <button
                    className={`btn ${
                      filter === "completed"
                        ? "btn-warning"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => setFilter("completed")}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>

            <hr />

            {/* Scrollable task area */}
            <div className="flex-grow-1 overflow-auto">
              <TaskList
                tasks={visible}
                onToggle={toggleDone}
                onRemove={removeTask}
                onEdit={editTask}
              />
            </div>

            <footer className="mt-3 small text-muted">
              {tasks.filter((t) => !t.done).length} items left
            </footer>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center mt-auto py-3 small bg-dark text-white">
        Made with love for productive bees 🐝
      </footer>
    </div>
  );
}

/* ------------------------- Subcomponents ------------------------- */

function AddTask({ onAdd, inputRef }) {
  const [val, setVal] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!val.trim()) return;
    await onAdd(val);
    setVal("");
  }

  return (
    <form onSubmit={submit} className="d-flex gap-2">
      <input
        ref={inputRef}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="form-control form-control-lg"
        placeholder="Add a task — what would DoBee do?"
      />
      <button className="btn btn-primary btn-lg" type="submit">
        Add
      </button>
    </form>
  );
}

function TaskList({ tasks, onToggle, onRemove, onEdit }) {
  if (tasks.length === 0)
    return (
      <div className="text-center text-muted py-5">
        No tasks — add one to get started 🐝
      </div>
    );

  return (
    <ul className="list-group">
      {tasks.map((t) => (
        <li
          key={t.id}
          className={`list-group-item d-flex align-items-center justify-content-between ${
            t.done ? "list-group-item-success" : ""
          }`}
        >
          <div className="d-flex gap-2 align-items-center flex-grow-1">
            <input
              className="form-check-input me-2"
              type="checkbox"
              checked={t.done}
              onChange={() => onToggle(t.id, t.done)}
            />
            <EditableTitle
              title={t.title}
              done={t.done}
              onSave={(newTitle) => onEdit(t.id, newTitle)}
            />
          </div>

          <button
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={() => onRemove(t.id)}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}

function EditableTitle({ title: initial, onSave, done }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(initial);
  const ref = useRef(null);

  useEffect(() => setVal(initial), [initial]);
  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  function commit() {
    const trimmed = val.trim();
    if (!trimmed) {
      setVal(initial);
    } else {
      onSave(trimmed);
    }
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={ref}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setVal(initial);
            setEditing(false);
          }
        }}
        className="form-control"
      />
    );
  }

  return (
    <div className="d-flex gap-2 align-items-center">
      <span
        onDoubleClick={() => setEditing(true)}
        style={{
          textDecoration: done ? "line-through" : "none",
          cursor: "text",
        }}
      >
        {initial}
      </span>
      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={() => setEditing(true)}
      >
        Edit
      </button>
    </div>
  );
}

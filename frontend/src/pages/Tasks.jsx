import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import StatCard from "../components/StatCard";
import {
  FaPlus,
  FaTrash,
  FaListUl,
  FaCheckCircle,
  FaHourglassHalf,
  FaExclamationCircle,
} from "react-icons/fa";
import {
  getTasks,
  createTask,
  deleteTask as deleteTaskApi,
  toggleTaskComplete,
} from "../api/tasks";

const PRIORITY_STYLES = {
  High: "bg-rose-100 text-rose-600",
  Medium: "bg-amber-100 text-amber-600",
  Low: "bg-emerald-100 text-emerald-600",
};

function TaskForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        due_date: dueDate || null,
        priority,
        category: category.trim(),
      });
      setTitle("");
      setDueDate("");
      setPriority("Medium");
      setCategory("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-8"
    >
      <input
        className="md:col-span-2 p-3 rounded-xl border focus:outline-none focus:ring-2 ring-accent"
        placeholder="What needs doing? ✨"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="date"
        className="p-3 rounded-xl border focus:outline-none focus:ring-2 ring-accent"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <select
        className="p-3 rounded-xl border focus:outline-none focus:ring-2 ring-accent"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>

      <div className="flex gap-2">
        <input
          className="flex-1 p-3 rounded-xl border focus:outline-none focus:ring-2 ring-accent"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="shrink-0 bg-accent bg-accent-hover disabled:opacity-50 text-white rounded-xl px-4 flex items-center justify-center transition"
        >
          <FaPlus />
        </button>
      </div>
    </form>
  );
}

function TaskRow({ task, onToggle, onDelete }) {
  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-2xl border transition ${
        task.completed ? "bg-gray-50 border-gray-100" : "bg-white border-accent"
      }`}
    >
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task)}
        className="w-5 h-5 accent-fill shrink-0"
      />

      <div className="flex-1 min-w-0">
        <p
          className={`font-medium truncate ${
            task.completed ? "line-through text-gray-400" : "text-gray-800"
          }`}
        >
          {task.title}
        </p>

        <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
          {task.due_date && <span>📅 {task.due_date}</span>}
          {task.category && <span>🏷 {task.category}</span>}
        </div>
      </div>

      <span
        className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${
          PRIORITY_STYLES[task.priority] || "bg-gray-100 text-gray-500"
        }`}
      >
        {task.priority}
      </span>

      <button
        onClick={() => onDelete(task.id)}
        className="text-gray-300 hover:text-rose-500 transition shrink-0"
        aria-label="Delete task"
      >
        <FaTrash />
      </button>
    </div>
  );
}

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError("Couldn't reach the server. Is the Django backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreate = async (task) => {
    const created = await createTask(task);
    setTasks((prev) => [created, ...prev]);
  };

  const handleToggle = async (task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t))
    );
    try {
      await toggleTaskComplete(task.id);
    } catch {
      loadTasks();
    }
  };

  const handleDelete = async (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTaskApi(id);
    } catch {
      loadTasks();
    }
  };

  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  const remaining = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.length - remaining;
  const highPriorityCount = tasks.filter((t) => t.priority === "High" && !t.completed).length;

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl text-accent font-bold">📝 Tasks</h1>
      </div>

      {!loading && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <StatCard
            icon={FaListUl}
            iconBg="bg-accent-100"
            iconColor="text-accent-600"
            label="Total tasks"
            value={tasks.length}
          />
          <StatCard
            icon={FaCheckCircle}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-500"
            label="Completed"
            value={completedCount}
          />
          <StatCard
            icon={FaHourglassHalf}
            iconBg="bg-sky-100"
            iconColor="text-sky-500"
            label="Remaining"
            value={remaining}
          />
          <StatCard
            icon={FaExclamationCircle}
            iconBg="bg-rose-100"
            iconColor="text-rose-500"
            label="High priority"
            value={highPriorityCount}
          />
        </div>
      )}

      <div className="bg-white p-8 rounded-3xl shadow-lg">
        <TaskForm onCreate={handleCreate} />

        <input
          className="w-full p-4 rounded-xl border focus:outline-none focus:ring-2 ring-accent mb-6"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading && <p className="text-gray-400 text-center py-8">Loading tasks…</p>}

        {error && <p className="text-rose-500 text-center py-8">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-gray-400 text-center py-8">
            {tasks.length === 0
              ? "No tasks yet — add your first one above ✨"
              : "No tasks match your search."}
          </p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Tasks;

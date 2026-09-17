import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import StatCard from "../components/StatCard";
import {
  FaPlus,
  FaTrash,
  FaBullseye,
  FaCheckCircle,
  FaChartLine,
  FaExclamationTriangle,
} from "react-icons/fa";
import { getGoals, createGoal, deleteGoal, setGoalProgress } from "../api/goals";
import { useToast } from "../context/ToastContext";

const CATEGORIES = ["Personal", "Health", "Career", "Finance", "Other"];

const CATEGORY_STYLES = {
  Personal: "bg-pink-100 text-pink-600",
  Health: "bg-emerald-100 text-emerald-600",
  Career: "bg-sky-100 text-sky-600",
  Finance: "bg-amber-100 text-amber-600",
  Other: "bg-gray-100 text-gray-600",
};

function GoalForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Personal");
  const [targetDate, setTargetDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        category,
        target_date: targetDate || null,
        progress: 0,
      });
      setTitle("");
      setCategory("Personal");
      setTargetDate("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
      <input
        className="md:col-span-2 p-3 rounded-xl border focus:outline-none focus:ring-2 ring-accent"
        placeholder="What's the goal? 🎯"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <select
        className="p-3 rounded-xl border focus:outline-none focus:ring-2 ring-accent"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <div className="flex gap-2">
        <input
          type="date"
          className="flex-1 p-3 rounded-xl border focus:outline-none focus:ring-2 ring-accent"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
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

function GoalCard({ goal, onSetProgress, onDelete }) {
  const daysLeft = goal.target_date
    ? Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className={`bg-white rounded-3xl shadow-lg p-6 ${goal.completed ? "opacity-70" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p
            className={`font-semibold text-gray-800 ${
              goal.completed ? "line-through text-gray-400" : ""
            }`}
          >
            {goal.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                CATEGORY_STYLES[goal.category] || CATEGORY_STYLES.Other
              }`}
            >
              {goal.category}
            </span>
            {goal.target_date && (
              <span className="text-xs text-gray-400">
                {goal.completed
                  ? "Completed"
                  : daysLeft >= 0
                  ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`
                  : "Overdue"}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onDelete(goal.id)}
          className="text-gray-300 hover:text-rose-500 transition shrink-0"
          aria-label="Delete goal"
        >
          <FaTrash />
        </button>
      </div>

      <div className="w-full h-3 bg-accent-50 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-accent transition-all"
          style={{ width: `${goal.progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{goal.progress}% complete</span>
        <div className="flex gap-2">
          <button
            onClick={() => onSetProgress(goal, Math.max(0, goal.progress - 10))}
            className="px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
          >
            −10%
          </button>
          <button
            onClick={() => onSetProgress(goal, Math.min(100, goal.progress + 10))}
            className="px-3 py-1 text-sm rounded-full bg-accent-100 hover:bg-accent-200 text-accent-600 transition"
          >
            +10%
          </button>
        </div>
      </div>
    </div>
  );
}

function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setGoals(await getGoals());
    } catch {
      setError("Couldn't reach the server. Is the Django backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (goal) => {
    try {
      const created = await createGoal(goal);
      setGoals((prev) => [created, ...prev]);
      showToast("Goal added! 🎯");
    } catch {
      showToast("Couldn't add that goal.", "error");
    }
  };

  const handleSetProgress = async (goal, progress) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === goal.id ? { ...g, progress, completed: progress >= 100 } : g))
    );
    try {
      const updated = await setGoalProgress(goal.id, progress);
      setGoals((prev) => prev.map((g) => (g.id === goal.id ? updated : g)));
      if (updated.completed && !goal.completed) {
        showToast(`🎉 "${updated.title}" complete!`);
      }
    } catch {
      load();
    }
  };

  const handleDelete = async (id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    try {
      await deleteGoal(id);
    } catch {
      load();
    }
  };

  const active = goals.filter((g) => !g.completed);
  const completed = goals.filter((g) => g.completed);
  const overdue = active.filter((g) => g.target_date && g.target_date < new Date().toISOString().slice(0, 10));
  const avgProgress = active.length
    ? Math.round(active.reduce((sum, g) => sum + g.progress, 0) / active.length)
    : 0;

  return (
    <MainLayout>
      <h1 className="text-4xl font-bold text-accent mb-6">🎯 Goals</h1>

      {!loading && !error && goals.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <StatCard
            icon={FaBullseye}
            iconBg="bg-accent-100"
            iconColor="text-accent-600"
            label="In progress"
            value={active.length}
          />
          <StatCard
            icon={FaCheckCircle}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-500"
            label="Completed"
            value={completed.length}
          />
          <StatCard
            icon={FaChartLine}
            iconBg="bg-sky-100"
            iconColor="text-sky-500"
            label="Avg. progress"
            value={`${avgProgress}%`}
          />
          <StatCard
            icon={FaExclamationTriangle}
            iconBg="bg-rose-100"
            iconColor="text-rose-500"
            label="Overdue"
            value={overdue.length}
          />
        </div>
      )}

      <div className="bg-white p-8 rounded-3xl shadow-lg mb-8">
        <GoalForm onCreate={handleCreate} />
      </div>

      {loading && <p className="text-gray-400 text-center py-8">Loading goals…</p>}
      {error && (
        <p className="text-rose-500 bg-white rounded-2xl shadow p-4 text-center">{error}</p>
      )}

      {!loading && !error && goals.length === 0 && (
        <div className="bg-white rounded-3xl shadow-lg p-12 text-center text-gray-400">
          No goals yet — set your first one above ✨
        </div>
      )}

      {!loading && !error && goals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...active, ...completed].map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onSetProgress={handleSetProgress}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </MainLayout>
  );
}

export default Goals;

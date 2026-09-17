import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import StatCard from "../components/StatCard";
import { FaPlus, FaTrash, FaFire, FaMoon, FaCheckCircle, FaChartBar } from "react-icons/fa";
import { getHabits, createHabit, deleteHabit, toggleHabitToday } from "../api/habits";
import { useToast } from "../context/ToastContext";

const EMOJI_OPTIONS = ["🌙", "💪", "📚", "🧘", "🥗", "🏃", "💧", "✍️", "🧴", "🌱"];

function HabitForm({ onCreate }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJI_OPTIONS[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onCreate({ name: name.trim(), emoji });
      setName("");
      setEmoji(EMOJI_OPTIONS[0]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 mb-8">
      <select
        className="p-3 rounded-xl border focus:outline-none focus:ring-2 ring-accent text-xl"
        value={emoji}
        onChange={(e) => setEmoji(e.target.value)}
      >
        {EMOJI_OPTIONS.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </select>

      <input
        className="flex-1 min-w-[200px] p-3 rounded-xl border focus:outline-none focus:ring-2 ring-accent"
        placeholder="New habit, e.g. Drink tea before bed"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        type="submit"
        disabled={submitting || !name.trim()}
        className="bg-accent bg-accent-hover disabled:opacity-50 text-white rounded-xl px-5 flex items-center gap-2 transition"
      >
        <FaPlus /> Add
      </button>
    </form>
  );
}

function HabitCard({ habit, onToggle, onDelete }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{habit.emoji}</span>
          <div>
            <p className="font-semibold text-gray-800">{habit.name}</p>
            <p className="text-sm text-gray-400 flex items-center gap-1">
              {habit.current_streak > 0 ? (
                <>
                  <FaFire className="text-orange-400" /> {habit.current_streak}-day streak
                </>
              ) : (
                "No streak yet"
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => onDelete(habit.id)}
          className="text-gray-300 hover:text-rose-500 transition"
          aria-label="Delete habit"
        >
          <FaTrash />
        </button>
      </div>

      <div className="flex items-center justify-between gap-1">
        {habit.last_7_days.map((d) => (
          <div
            key={d.date}
            className={`w-6 h-6 rounded-full ${
              d.completed ? "bg-accent" : "bg-gray-100"
            }`}
            title={d.date}
          />
        ))}
      </div>

      <button
        onClick={() => onToggle(habit)}
        className={`w-full py-2.5 rounded-xl font-semibold transition ${
          habit.completed_today
            ? "bg-accent-50 text-accent-600 border border-accent"
            : "bg-accent text-white bg-accent-hover"
        }`}
      >
        {habit.completed_today ? "Done today ✓" : "Mark done today"}
      </button>
    </div>
  );
}

function Habits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHabits();
      setHabits(data);
    } catch {
      setError("Couldn't reach the server. Is the Django backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (habit) => {
    try {
      const created = await createHabit(habit);
      setHabits((prev) => [created, ...prev]);
      showToast(`${created.emoji} ${created.name} added!`);
    } catch {
      showToast("Couldn't add that habit.", "error");
    }
  };

  const handleToggle = async (habit) => {
    try {
      const updated = await toggleHabitToday(habit.id);
      setHabits((prev) => prev.map((h) => (h.id === habit.id ? updated : h)));
      if (updated.completed_today) {
        showToast(
          updated.current_streak > 1
            ? `${updated.current_streak}-day streak! 🔥`
            : "Nice work! ✨"
        );
      }
    } catch {
      showToast("Couldn't update that habit.", "error");
    }
  };

  const handleDelete = async (id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    try {
      await deleteHabit(id);
    } catch {
      load();
    }
  };

  const bestStreak = habits.reduce((max, h) => Math.max(max, h.current_streak), 0);
  const doneToday = habits.filter((h) => h.completed_today).length;
  const totalCompletions = habits.reduce((sum, h) => sum + h.last_7_days.filter((d) => d.completed).length, 0);

  return (
    <MainLayout>
      <h1 className="text-4xl font-bold text-accent mb-6">🌙 Habits</h1>

      {!loading && !error && habits.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <StatCard
            icon={FaMoon}
            iconBg="bg-accent-100"
            iconColor="text-accent-600"
            label="Active habits"
            value={habits.length}
          />
          <StatCard
            icon={FaCheckCircle}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-500"
            label="Done today"
            value={`${doneToday}/${habits.length}`}
          />
          <StatCard
            icon={FaFire}
            iconBg="bg-amber-100"
            iconColor="text-amber-500"
            label="Best streak"
            value={bestStreak}
            delta="days"
          />
          <StatCard
            icon={FaChartBar}
            iconBg="bg-sky-100"
            iconColor="text-sky-500"
            label="Check-ins"
            value={totalCompletions}
            delta="last 7 days"
          />
        </div>
      )}

      <div className="bg-white p-8 rounded-3xl shadow-lg mb-8">
        <HabitForm onCreate={handleCreate} />
      </div>

      {loading && <p className="text-gray-400 text-center py-8">Loading habits…</p>}
      {error && (
        <p className="text-rose-500 bg-white rounded-2xl shadow p-4 text-center">{error}</p>
      )}

      {!loading && !error && habits.length === 0 && (
        <div className="bg-white rounded-3xl shadow-lg p-12 text-center text-gray-400">
          No habits yet — add your first one above to start a streak ✨
        </div>
      )}

      {!loading && !error && habits.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </MainLayout>
  );
}

export default Habits;

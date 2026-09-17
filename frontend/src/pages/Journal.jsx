import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import StatCard from "../components/StatCard";
import { FaTrash, FaBook, FaCalendarWeek, FaSmile, FaFire } from "react-icons/fa";
import { getEntries, createEntry, deleteEntry } from "../api/journal";
import { useToast } from "../context/ToastContext";

const MOODS = ["😊", "😌", "😴", "😢", "😡", "🥰", "😰", "✨"];

function EntryForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState(MOODS[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await onCreate({ title: title.trim(), content: content.trim(), mood });
      setTitle("");
      setContent("");
      setMood(MOODS[0]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8">
      <div className="flex gap-2 flex-wrap">
        {MOODS.map((m) => (
          <button
            type="button"
            key={m}
            onClick={() => setMood(m)}
            className={`w-11 h-11 rounded-full text-xl flex items-center justify-center transition ${
              mood === m ? "bg-accent-100 ring-2 ring-accent" : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <input
        className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 ring-accent"
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 ring-accent min-h-[100px] resize-y"
        placeholder="What's on your mind today? 💭"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button
        type="submit"
        disabled={submitting || !content.trim()}
        className="bg-accent bg-accent-hover disabled:opacity-50 text-white rounded-xl px-6 py-2.5 font-semibold transition"
      >
        Save entry
      </button>
    </form>
  );
}

function EntryCard({ entry, onDelete }) {
  const dateLabel = new Date(entry.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{entry.mood}</span>
          <div>
            {entry.title && <p className="font-semibold text-gray-800">{entry.title}</p>}
            <p className="text-xs text-gray-400">{dateLabel}</p>
          </div>
        </div>
        <button
          onClick={() => onDelete(entry.id)}
          className="text-gray-300 hover:text-rose-500 transition shrink-0"
          aria-label="Delete entry"
        >
          <FaTrash />
        </button>
      </div>
      <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
    </div>
  );
}

function Journal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setEntries(await getEntries());
    } catch {
      setError("Couldn't reach the server. Is the Django backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (entry) => {
    try {
      const created = await createEntry(entry);
      setEntries((prev) => [created, ...prev]);
      showToast("Entry saved 📝");
    } catch {
      showToast("Couldn't save that entry.", "error");
    }
  };

  const handleDelete = async (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteEntry(id);
    } catch {
      load();
    }
  };

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoKey = weekAgo.toISOString().slice(0, 10);
  const entriesThisWeek = entries.filter((e) => e.date >= weekAgoKey).length;

  const moodCounts = entries.reduce((acc, e) => {
    acc[e.mood] = (acc[e.mood] || 0) + 1;
    return acc;
  }, {});
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

  const longestStreakDays = (() => {
    const dates = new Set(entries.map((e) => e.date));
    let streak = 0;
    let day = new Date();
    while (dates.has(day.toISOString().slice(0, 10))) {
      streak += 1;
      day.setDate(day.getDate() - 1);
    }
    return streak;
  })();

  return (
    <MainLayout>
      <h1 className="text-4xl font-bold text-accent mb-6">📖 Journal</h1>

      {!loading && !error && entries.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <StatCard
            icon={FaBook}
            iconBg="bg-accent-100"
            iconColor="text-accent-600"
            label="Total entries"
            value={entries.length}
          />
          <StatCard
            icon={FaCalendarWeek}
            iconBg="bg-sky-100"
            iconColor="text-sky-500"
            label="This week"
            value={entriesThisWeek}
          />
          <StatCard
            icon={FaSmile}
            iconBg="bg-amber-100"
            iconColor="text-amber-500"
            label="Top mood"
            value={topMood ? topMood[0] : "—"}
          />
          <StatCard
            icon={FaFire}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-500"
            label="Writing streak"
            value={longestStreakDays}
            delta="days"
          />
        </div>
      )}

      <div className="bg-white p-8 rounded-3xl shadow-lg mb-8">
        <EntryForm onCreate={handleCreate} />
      </div>

      {loading && <p className="text-gray-400 text-center py-8">Loading entries…</p>}
      {error && (
        <p className="text-rose-500 bg-white rounded-2xl shadow p-4 text-center">{error}</p>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="bg-white rounded-3xl shadow-lg p-12 text-center text-gray-400">
          No entries yet — write your first one above ✨
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="space-y-4">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </MainLayout>
  );
}

export default Journal;

import { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import StatCard from "../components/StatCard";
import {
  FaTint,
  FaMinus,
  FaPlus,
  FaChartLine,
  FaBullseye,
  FaCalendarCheck,
} from "react-icons/fa";
import {
  getTodayWaterLog,
  getWaterHistory,
  incrementWater,
  decrementWater,
  setWaterGoal,
} from "../api/water";

const WEEKDAY_SHORT = ["S", "M", "T", "W", "T", "F", "S"];

function GlassGrid({ glasses, goal, onSetCount }) {
  const total = Math.max(goal, glasses);
  const cells = Array.from({ length: total }, (_, i) => i < glasses);

  return (
    <div className="flex flex-wrap gap-3">
      {cells.map((filled, i) => (
        <button
          key={i}
          onClick={() => onSetCount(i + 1 === glasses ? i : i + 1)}
          className={`w-10 h-12 rounded-b-xl rounded-t-md border-2 flex items-end justify-center transition ${
            filled
              ? "bg-sky-400 border-sky-400"
              : "bg-white border-sky-200 hover:border-sky-300"
          }`}
          aria-label={`Glass ${i + 1}`}
        >
          <FaTint className={filled ? "text-white mb-1" : "text-sky-200 mb-1"} />
        </button>
      ))}
    </div>
  );
}

function WeekStrip({ history }) {
  const days = useMemo(() => {
    const today = new Date();
    const byDate = {};
    history.forEach((h) => (byDate[h.date] = h));

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      const entry = byDate[key];
      const ratio = entry ? Math.min(1, entry.glasses / (entry.goal || 8)) : 0;
      return { key, dow: d.getDay(), ratio, isToday: i === 6 };
    });
  }, [history]);

  return (
    <div className="flex items-end justify-between gap-2 h-24">
      {days.map((d) => (
        <div key={d.key} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full h-16 bg-sky-50 rounded-lg flex items-end overflow-hidden">
            <div
              className="w-full bg-sky-400 rounded-lg transition-all"
              style={{ height: `${d.ratio * 100}%` }}
            />
          </div>
          <span
            className={`text-xs font-semibold ${
              d.isToday ? "text-sky-500" : "text-gray-400"
            }`}
          >
            {WEEKDAY_SHORT[d.dow]}
          </span>
        </div>
      ))}
    </div>
  );
}

function WaterTracker() {
  const [log, setLog] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [goalInput, setGoalInput] = useState("8");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [today, hist] = await Promise.all([getTodayWaterLog(), getWaterHistory()]);
      setLog(today);
      setHistory(hist);
      setGoalInput(String(today.goal));
    } catch {
      setError("Couldn't reach the server. Is the Django backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const applyUpdate = (updated) => {
    setLog(updated);
    setHistory((prev) => {
      const rest = prev.filter((h) => h.id !== updated.id);
      return [updated, ...rest];
    });
  };

  const handleIncrement = async () => {
    if (!log) return;
    setLog((prev) => ({ ...prev, glasses: prev.glasses + 1 }));
    try {
      const updated = await incrementWater(log.id);
      applyUpdate(updated);
    } catch {
      load();
    }
  };

  const handleDecrement = async () => {
    if (!log || log.glasses === 0) return;
    setLog((prev) => ({ ...prev, glasses: Math.max(0, prev.glasses - 1) }));
    try {
      const updated = await decrementWater(log.id);
      applyUpdate(updated);
    } catch {
      load();
    }
  };

  const handleSetCount = async (count) => {
    if (!log) return;
    const target = Math.max(0, count);
    const prevCount = log.glasses;
    setLog((prev) => ({ ...prev, glasses: target }));

    const delta = target - prevCount;
    try {
      let updated = log;
      const steps = Math.abs(delta);
      for (let i = 0; i < steps; i++) {
        updated = delta > 0 ? await incrementWater(log.id) : await decrementWater(log.id);
      }
      applyUpdate(updated);
    } catch {
      load();
    }
  };

  const handleGoalSave = async () => {
    if (!log) return;
    const goal = Math.max(1, parseInt(goalInput, 10) || log.goal);
    setGoalInput(String(goal));
    try {
      const updated = await setWaterGoal(log.id, goal);
      applyUpdate(updated);
    } catch {
      load();
    }
  };

  const progress = log ? Math.min(1, log.glasses / (log.goal || 8)) : 0;
  const weeklyAvg = history.length
    ? (history.reduce((sum, h) => sum + h.glasses, 0) / history.length).toFixed(1)
    : "0";
  const goalHitDays = history.filter((h) => h.glasses >= (h.goal || 8)).length;

  return (
    <MainLayout>
      <h1 className="text-4xl font-bold text-accent mb-6">💧 Water Tracker</h1>

      {!loading && !error && log && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <StatCard
            icon={FaTint}
            iconBg="bg-sky-100"
            iconColor="text-sky-500"
            label="Today"
            value={`${log.glasses}/${log.goal}`}
          />
          <StatCard
            icon={FaChartLine}
            iconBg="bg-accent-100"
            iconColor="text-accent-600"
            label="Weekly avg"
            value={weeklyAvg}
            delta="glasses/day"
          />
          <StatCard
            icon={FaBullseye}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-500"
            label="Goal"
            value={log.goal}
            delta="glasses/day"
          />
          <StatCard
            icon={FaCalendarCheck}
            iconBg="bg-amber-100"
            iconColor="text-amber-500"
            label="Goal days"
            value={goalHitDays}
            delta="this week"
          />
        </div>
      )}

      {loading && <p className="text-gray-400">Loading…</p>}
      {error && (
        <p className="text-rose-500 bg-white rounded-2xl shadow p-4 mb-6">{error}</p>
      )}

      {!loading && !error && log && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-700">Today</h2>
                <p className="text-gray-400 mt-1">
                  {log.glasses} / {log.goal} glasses{" "}
                  {progress >= 1 ? "— goal reached ✨" : ""}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDecrement}
                  className="w-10 h-10 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-500 flex items-center justify-center transition"
                  aria-label="Remove a glass"
                >
                  <FaMinus />
                </button>
                <button
                  onClick={handleIncrement}
                  className="w-10 h-10 rounded-full bg-sky-400 hover:bg-sky-500 text-white flex items-center justify-center transition"
                  aria-label="Add a glass"
                >
                  <FaPlus />
                </button>
              </div>
            </div>

            <div className="w-full h-4 bg-sky-50 rounded-full overflow-hidden mb-8">
              <div
                className="h-full bg-sky-400 transition-all"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            <GlassGrid glasses={log.glasses} goal={log.goal} onSetCount={handleSetCount} />

            <div className="flex items-center gap-3 mt-8 pt-6 border-t">
              <label className="text-gray-500 text-sm">Daily goal</label>
              <input
                type="number"
                min="1"
                className="w-20 p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-300"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onBlur={handleGoalSave}
                onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
              />
              <span className="text-gray-400 text-sm">glasses</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">This week</h2>
            <WeekStrip history={history} />
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default WaterTracker;

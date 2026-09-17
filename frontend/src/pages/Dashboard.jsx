import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import StatCard from "../components/StatCard";
import BarChart from "../components/charts/BarChart";
import DonutChart from "../components/charts/DonutChart";
import {
  FaCheckSquare,
  FaTint,
  FaFire,
  FaBullseye,
  FaStar,
  FaArrowRight,
} from "react-icons/fa";
import { getTasks } from "../api/tasks";
import { getTodayWaterLog, getWaterHistory } from "../api/water";
import { getHabits } from "../api/habits";
import { getGoals } from "../api/goals";
import { getCyclePrediction } from "../api/cycle";
import { getEntries } from "../api/journal";
import { getProfile } from "../api/profile";

const GOAL_CATEGORY_COLORS = {
  Personal: "#f472b6",
  Health: "#34d399",
  Career: "#38bdf8",
  Finance: "#facc15",
  Other: "#a78bfa",
};

const PHASE_STYLES = {
  Menstrual: "bg-rose-100 text-rose-600",
  Follicular: "bg-amber-100 text-amber-600",
  Ovulation: "bg-emerald-100 text-emerald-600",
  Luteal: "bg-purple-100 text-purple-600",
};

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [water, setWater] = useState(null);
  const [waterHistory, setWaterHistory] = useState([]);
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  const [cycle, setCycle] = useState(null);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    Promise.allSettled([
      getProfile(),
      getTasks(),
      getTodayWaterLog(),
      getWaterHistory(),
      getHabits(),
      getGoals(),
      getCyclePrediction(),
      getEntries(),
    ]).then(([p, t, w, wh, h, g, c, e]) => {
      if (p.status === "fulfilled") setProfile(p.value);
      if (t.status === "fulfilled") setTasks(t.value);
      if (w.status === "fulfilled") setWater(w.value);
      if (wh.status === "fulfilled") setWaterHistory(wh.value);
      if (h.status === "fulfilled") setHabits(h.value);
      if (g.status === "fulfilled") setGoals(g.value);
      if (c.status === "fulfilled") setCycle(c.value);
      if (e.status === "fulfilled") setEntries(e.value);
      setLoading(false);
    });
  }, []);

  const remainingTasks = tasks.filter((t) => !t.completed);
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.current_streak), 0);
  const activeGoals = goals.filter((g) => !g.completed);
  const spotlightHabit = habits.reduce(
    (best, h) => (h.current_streak > (best?.current_streak || 0) ? h : best),
    null
  );
  const latestEntry = entries[0];

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const weekBarData = (() => {
    const byDate = {};
    waterHistory.forEach((h) => (byDate[h.date] = h));
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      const entry = byDate[key];
      return {
        label: d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1),
        value: entry ? entry.glasses : 0,
      };
    });
  })();

  const goalDonutData = Object.entries(
    goals.reduce((acc, g) => {
      acc[g.category] = (acc[g.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([label, value]) => ({
    label,
    value,
    color: GOAL_CATEGORY_COLORS[label] || "#d1d5db",
  }));

  return (
    <MainLayout>
      {loading ? (
        <p className="text-gray-400">Loading your day…</p>
      ) : (
        <>
          {/* Hero banner */}
          <div className="bg-accent-gradient rounded-3xl p-8 mb-6 flex items-center justify-between flex-wrap gap-6 shadow-soft">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Good day, {profile?.display_name || "there"}! ☀️
              </h1>
              <p className="text-gray-600 mt-1">{today} — let's make today count 💖</p>
              <Link
                to="/tasks"
                className="inline-block mt-4 bg-white text-accent-600 font-semibold rounded-full px-6 py-2.5 shadow hover:shadow-md transition"
              >
                + Add a Task
              </Link>
            </div>
            <div className="text-6xl">🌸</div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <StatCard
              icon={FaCheckSquare}
              iconBg="bg-accent-100"
              iconColor="text-accent-600"
              label="Tasks left"
              value={remainingTasks.length}
              delta={`${tasks.length - remainingTasks.length} done`}
            />
            <StatCard
              icon={FaTint}
              iconBg="bg-sky-100"
              iconColor="text-sky-500"
              label="Water today"
              value={water ? `${water.glasses}/${water.goal}` : "—"}
              delta="glasses"
            />
            <StatCard
              icon={FaFire}
              iconBg="bg-amber-100"
              iconColor="text-amber-500"
              label="Best streak"
              value={bestStreak}
              delta="days in a row"
            />
            <StatCard
              icon={FaBullseye}
              iconBg="bg-emerald-100"
              iconColor="text-emerald-500"
              label="Active goals"
              value={activeGoals.length}
              delta="in progress"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-6">
                Water — This Week
              </h2>
              <BarChart data={weekBarData} />
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-6">Goals by Category</h2>
              {goalDonutData.length > 0 ? (
                <DonutChart segments={goalDonutData} />
              ) : (
                <p className="text-gray-400">Add a goal to see the breakdown ✨</p>
              )}
            </div>
          </div>

          {/* List widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Recent Tasks</h2>
                <Link to="/tasks" className="text-sm text-accent-600 font-medium hover:underline">
                  See All
                </Link>
              </div>

              {tasks.length === 0 ? (
                <p className="text-gray-400">No tasks yet ✨</p>
              ) : (
                <div className="space-y-3">
                  {tasks.slice(0, 3).map((t) => (
                    <div key={t.id} className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-accent-50 flex items-center justify-center text-lg shrink-0">
                        📝
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium truncate ${
                            t.completed ? "line-through text-gray-400" : "text-gray-800"
                          }`}
                        >
                          {t.title}
                        </p>
                        <p className="text-xs text-gray-400">{t.priority} priority</p>
                      </div>
                      <span
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          t.completed
                            ? "bg-accent text-white"
                            : "bg-accent-50 text-accent-600"
                        }`}
                      >
                        ✓
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-accent-gradient-strong rounded-3xl shadow-lg p-8 text-white flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Habit Spotlight</h2>
                <Link to="/habits" className="text-sm font-medium hover:underline">
                  See All
                </Link>
              </div>

              {spotlightHabit ? (
                <div className="flex-1 flex flex-col justify-end">
                  <p className="text-4xl mb-2">{spotlightHabit.emoji}</p>
                  <p className="text-2xl font-bold">{spotlightHabit.name}</p>
                  <p className="opacity-90 flex items-center gap-1 mt-1">
                    <FaFire /> {spotlightHabit.current_streak}-day streak
                  </p>
                </div>
              ) : (
                <p className="opacity-90">Start a habit to see it shine here 🌙</p>
              )}
            </div>
          </div>

          {/* Wellness widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Cycle Info</h2>
                <Link to="/period" className="text-sm text-accent-600 font-medium hover:underline">
                  See All
                </Link>
              </div>

              {cycle?.has_data ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-800">Day {cycle.cycle_day}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {cycle.days_until_next_period >= 0
                        ? `Next period in ${cycle.days_until_next_period} day${
                            cycle.days_until_next_period !== 1 ? "s" : ""
                          }`
                        : "Period may be starting"}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ${
                      PHASE_STYLES[cycle.phase] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {cycle.phase}
                  </span>
                </div>
              ) : (
                <p className="text-gray-400">Log your period to see predictions 🌷</p>
              )}
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Latest Journal Entry</h2>
                <Link to="/journal" className="text-sm text-accent-600 font-medium hover:underline">
                  See All
                </Link>
              </div>

              {latestEntry ? (
                <div className="flex items-start gap-3">
                  <span className="text-3xl shrink-0">{latestEntry.mood}</span>
                  <p className="text-gray-600 leading-relaxed">
                    {latestEntry.content.slice(0, 90)}
                    {latestEntry.content.length > 90 ? "…" : ""}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400">Write your first entry today 📝</p>
              )}
            </div>
          </div>

          {/* Bottom CTA */}
          <Link
            to="/journal"
            className="bg-accent-gradient-strong rounded-3xl p-8 flex items-center justify-between flex-wrap gap-4 text-white shadow-soft hover:brightness-105 transition"
          >
            <div className="flex items-center gap-4">
              <FaStar className="text-3xl text-yellow-200" />
              <div>
                <p className="text-xl font-semibold">Reflect on your day</p>
                <p className="opacity-90">Jot down a thought in your journal</p>
              </div>
            </div>
            <span className="bg-white text-accent-600 font-semibold rounded-full px-6 py-2.5 flex items-center gap-2 shrink-0">
              Write Now <FaArrowRight />
            </span>
          </Link>
        </>
      )}
    </MainLayout>
  );
}

export default Dashboard;

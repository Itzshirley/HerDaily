import { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import StatCard from "../components/StatCard";
import { FaChevronLeft, FaChevronRight, FaCalendarDay, FaCheckCircle, FaClock } from "react-icons/fa";
import { getTasks } from "../api/tasks";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PRIORITY_DOT = {
  High: "bg-rose-400",
  Medium: "bg-amber-400",
  Low: "bg-emerald-400",
};

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);

  const days = [];
  for (let i = 0; i < 42; i++) {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + i);
    days.push(day);
  }
  return days;
}

function CalendarPage() {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedKey, setSelectedKey] = useState(toDateKey(today));

  useEffect(() => {
    getTasks()
      .then(setTasks)
      .catch(() => setError("Couldn't load tasks. Is the Django backend running?"))
      .finally(() => setLoading(false));
  }, []);

  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((task) => {
      if (!task.due_date) return;
      if (!map[task.due_date]) map[task.due_date] = [];
      map[task.due_date].push(task);
    });
    return map;
  }, [tasks]);

  const days = useMemo(
    () => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()),
    [cursor]
  );

  const monthLabel = cursor.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const goToMonth = (delta) => {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const goToday = () => {
    const now = new Date();
    setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedKey(toDateKey(now));
  };

  const selectedTasks = tasksByDate[selectedKey] || [];
  const todayKey = toDateKey(today);

  const monthTasks = tasks.filter(
    (t) =>
      t.due_date &&
      new Date(t.due_date + "T00:00:00").getMonth() === cursor.getMonth() &&
      new Date(t.due_date + "T00:00:00").getFullYear() === cursor.getFullYear()
  );
  const monthCompleted = monthTasks.filter((t) => t.completed).length;
  const monthUpcoming = monthTasks.filter((t) => !t.completed && t.due_date >= todayKey).length;

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl text-accent font-bold">📅 Calendar</h1>
        <button
          onClick={goToday}
          className="text-sm font-semibold text-accent-600 bg-accent-100 hover:brightness-95 rounded-full px-4 py-2 transition"
        >
          Today
        </button>
      </div>

      {!loading && !error && (
        <div className="grid grid-cols-3 gap-5 mb-6">
          <StatCard
            icon={FaCalendarDay}
            iconBg="bg-accent-100"
            iconColor="text-accent-600"
            label="This month"
            value={monthTasks.length}
          />
          <StatCard
            icon={FaCheckCircle}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-500"
            label="Completed"
            value={monthCompleted}
          />
          <StatCard
            icon={FaClock}
            iconBg="bg-sky-100"
            iconColor="text-sky-500"
            label="Upcoming"
            value={monthUpcoming}
          />
        </div>
      )}

      {error && (
        <p className="text-rose-500 bg-white rounded-2xl shadow p-4 mb-6">{error}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => goToMonth(-1)}
              className="p-2 rounded-full hover:bg-accent-50 text-accent transition"
              aria-label="Previous month"
            >
              <FaChevronLeft />
            </button>

            <h2 className="text-xl font-semibold text-gray-700">{monthLabel}</h2>

            <button
              onClick={() => goToMonth(1)}
              className="p-2 rounded-full hover:bg-accent-50 text-accent transition"
              aria-label="Next month"
            >
              <FaChevronRight />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-400 mb-2">
            {WEEKDAYS.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const key = toDateKey(day);
              const inMonth = day.getMonth() === cursor.getMonth();
              const dayTasks = tasksByDate[key] || [];
              const isToday = key === todayKey;
              const isSelected = key === selectedKey;

              return (
                <button
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  className={`h-20 rounded-2xl p-2 text-left flex flex-col transition border
                    ${isSelected ? "border-accent ring-2 ring-accent" : "border-transparent"}
                    ${inMonth ? "bg-accent-50 hover:bg-accent-100" : "bg-gray-50 text-gray-300 hover:bg-gray-100"}
                  `}
                >
                  <span
                    className={`text-sm font-semibold ${
                      isToday
                        ? "bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center"
                        : ""
                    }`}
                  >
                    {day.getDate()}
                  </span>

                  <div className="flex gap-1 mt-auto flex-wrap">
                    {dayTasks.slice(0, 3).map((t) => (
                      <span
                        key={t.id}
                        className={`w-1.5 h-1.5 rounded-full ${
                          PRIORITY_DOT[t.priority] || "bg-gray-300"
                        }`}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[10px] text-gray-400">+{dayTasks.length - 3}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-1">
            {new Date(selectedKey + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            {selectedTasks.length} task{selectedTasks.length !== 1 ? "s" : ""} due
          </p>

          {loading && <p className="text-gray-400">Loading…</p>}

          {!loading && selectedTasks.length === 0 && (
            <p className="text-gray-400">Nothing due this day 🌸</p>
          )}

          <div className="space-y-3">
            {selectedTasks.map((t) => (
              <div key={t.id} className="p-4 rounded-2xl bg-accent-50 border border-accent">
                <p
                  className={`font-medium ${
                    t.completed ? "line-through text-gray-400" : "text-gray-800"
                  }`}
                >
                  {t.title}
                </p>
                <div className="flex gap-2 mt-2 text-xs text-gray-500">
                  <span
                    className={`px-2 py-0.5 rounded-full ${
                      PRIORITY_DOT[t.priority] || "bg-gray-300"
                    } bg-opacity-20 text-gray-600`}
                  >
                    {t.priority}
                  </span>
                  {t.category && <span>🏷 {t.category}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default CalendarPage;

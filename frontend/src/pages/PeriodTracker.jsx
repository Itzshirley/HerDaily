import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import StatCard from "../components/StatCard";
import {
  FaTrash,
  FaCalendarDay,
  FaHeart,
  FaHourglassHalf,
  FaLeaf,
} from "react-icons/fa";
import {
  getCycleLogs,
  createCycleLog,
  deleteCycleLog,
  getCycleSettings,
  updateCycleSettings,
  getCyclePrediction,
} from "../api/cycle";
import { useToast } from "../context/ToastContext";

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

const PHASE_STYLES = {
  Menstrual: "bg-rose-100 text-rose-600",
  Follicular: "bg-amber-100 text-amber-600",
  Ovulation: "bg-emerald-100 text-emerald-600",
  Luteal: "bg-purple-100 text-purple-600",
};

function PeriodTracker() {
  const [logs, setLogs] = useState([]);
  const [settings, setSettingsState] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [logData, settingsData, predictionData] = await Promise.all([
        getCycleLogs(),
        getCycleSettings(),
        getCyclePrediction(),
      ]);
      setLogs(logData);
      setSettingsState(settingsData);
      setPrediction(predictionData);
    } catch {
      setError("Couldn't reach the server. Is the Django backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleLogToday = async () => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      await createCycleLog({ start_date: today });
      showToast("Period logged 🩸");
      load();
    } catch {
      showToast("Couldn't log that — maybe today's already logged?", "error");
    }
  };

  const handleDeleteLog = async (id) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
    try {
      await deleteCycleLog(id);
      load();
    } catch {
      load();
    }
  };

  const handleSettingsSave = async (field, value) => {
    const parsed = Math.max(1, parseInt(value, 10) || settings[field]);
    setSettingsState((prev) => ({ ...prev, [field]: parsed }));
    try {
      await updateCycleSettings({ [field]: parsed });
      load();
    } catch {
      load();
    }
  };

  return (
    <MainLayout>
      <h1 className="text-4xl font-bold text-accent mb-6">🩸 Period Tracker</h1>

      {!loading && !error && prediction?.has_data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <StatCard
            icon={FaCalendarDay}
            iconBg="bg-accent-100"
            iconColor="text-accent-600"
            label="Cycle day"
            value={prediction.cycle_day}
          />
          <StatCard
            icon={FaHeart}
            iconBg="bg-rose-100"
            iconColor="text-rose-500"
            label="Phase"
            value={prediction.phase}
          />
          <StatCard
            icon={FaHourglassHalf}
            iconBg="bg-purple-100"
            iconColor="text-purple-500"
            label="Next period"
            value={
              prediction.days_until_next_period >= 0
                ? `${prediction.days_until_next_period}d`
                : "due"
            }
          />
          <StatCard
            icon={FaLeaf}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-500"
            label="Avg. cycle"
            value={`${prediction.cycle_length}d`}
          />
        </div>
      )}

      {loading && <p className="text-gray-400">Loading…</p>}
      {error && (
        <p className="text-rose-500 bg-white rounded-2xl shadow p-4 mb-6">{error}</p>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg p-8">
            {!prediction?.has_data ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-6">
                  No period logged yet — log your most recent start date to get predictions.
                </p>
                <button
                  onClick={handleLogToday}
                  className="bg-accent bg-accent-hover text-white rounded-xl px-6 py-3 font-semibold transition"
                >
                  Log period started today
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-gray-400 text-sm">Cycle day</p>
                    <p className="text-4xl font-bold text-gray-800">{prediction.cycle_day}</p>
                  </div>
                  <span
                    className={`text-sm font-semibold px-4 py-2 rounded-full ${
                      PHASE_STYLES[prediction.phase] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {prediction.phase} phase
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-accent-50 rounded-2xl p-4">
                    <p className="text-sm text-gray-500">Next period</p>
                    <p className="font-semibold text-gray-800">
                      {formatDate(prediction.next_period_date)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {prediction.days_until_next_period >= 0
                        ? `in ${prediction.days_until_next_period} day${
                            prediction.days_until_next_period !== 1 ? "s" : ""
                          }`
                        : "should have started"}
                    </p>
                  </div>

                  <div className="bg-emerald-50 rounded-2xl p-4">
                    <p className="text-sm text-gray-500">Fertile window</p>
                    <p className="font-semibold text-gray-800">
                      {formatDate(prediction.fertile_window_start)} –{" "}
                      {formatDate(prediction.fertile_window_end)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Ovulation ~{formatDate(prediction.ovulation_date)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogToday}
                  className="w-full bg-accent bg-accent-hover text-white rounded-xl px-6 py-3 font-semibold transition"
                >
                  Log period started today
                </button>
              </>
            )}

            {settings && (
              <div className="flex items-center gap-6 mt-8 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-500">Avg. cycle length</label>
                  <input
                    type="number"
                    min="1"
                    className="w-16 p-2 rounded-lg border focus:outline-none focus:ring-2 ring-accent"
                    value={settings.average_cycle_length}
                    onChange={(e) =>
                      setSettingsState((prev) => ({
                        ...prev,
                        average_cycle_length: e.target.value,
                      }))
                    }
                    onBlur={(e) => handleSettingsSave("average_cycle_length", e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-500">Avg. period length</label>
                  <input
                    type="number"
                    min="1"
                    className="w-16 p-2 rounded-lg border focus:outline-none focus:ring-2 ring-accent"
                    value={settings.average_period_length}
                    onChange={(e) =>
                      setSettingsState((prev) => ({
                        ...prev,
                        average_period_length: e.target.value,
                      }))
                    }
                    onBlur={(e) => handleSettingsSave("average_period_length", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">History</h2>
            {logs.length === 0 && (
              <p className="text-gray-400 text-sm">No periods logged yet.</p>
            )}
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-accent-50"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {formatDate(log.start_date)}
                  </span>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="text-gray-300 hover:text-rose-500 transition"
                    aria-label="Delete log"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default PeriodTracker;

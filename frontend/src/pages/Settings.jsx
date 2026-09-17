import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getProfile, updateProfile } from "../api/profile";
import { useToast } from "../context/ToastContext";

const THEMES = [
  { id: "pink", label: "Blossom Pink", swatch: "#ec4899" },
  { id: "lavender", label: "Lavender Dream", swatch: "#8b5cf6" },
  { id: "peach", label: "Peach Sorbet", swatch: "#f97316" },
  { id: "mint", label: "Mint Bloom", swatch: "#10b981" },
];

function Settings() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    getProfile()
      .then((data) => {
        setProfile(data);
        document.documentElement.setAttribute("data-theme", data.theme);
      })
      .catch(() => setError("Couldn't reach the server. Is the Django backend running?"))
      .finally(() => setLoading(false));
  }, []);

  const saveField = async (patch, successMessage) => {
    try {
      const updated = await updateProfile(patch);
      setProfile(updated);
      if (patch.theme) {
        document.documentElement.setAttribute("data-theme", updated.theme);
      }
      if (successMessage) showToast(successMessage);
    } catch {
      showToast("Couldn't save that change.", "error");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <h1 className="text-4xl font-bold text-accent mb-8">⚙️ Settings</h1>
        <p className="text-gray-400">Loading…</p>
      </MainLayout>
    );
  }

  if (error || !profile) {
    return (
      <MainLayout>
        <h1 className="text-4xl font-bold text-accent mb-8">⚙️ Settings</h1>
        <p className="text-rose-500 bg-white rounded-2xl shadow p-4">{error}</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h1 className="text-4xl font-bold text-accent mb-8">⚙️ Settings</h1>

      <div className="space-y-6 max-w-2xl">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Profile</h2>
          <label className="text-sm text-gray-500 block mb-1">Display name</label>
          <input
            className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 ring-accent"
            value={profile.display_name}
            onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
            onBlur={() => saveField({ display_name: profile.display_name }, "Name updated ✨")}
          />
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Vibe</h2>
          <p className="text-sm text-gray-500 mb-4">Pick the accent that feels like you.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => saveField({ theme: t.id }, `${t.label} applied!`)}
                className={`rounded-2xl p-4 flex flex-col items-center gap-2 border-2 transition ${
                  profile.theme === t.id ? "border-accent bg-accent-50" : "border-transparent bg-gray-50"
                }`}
              >
                <span
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: t.swatch }}
                />
                <span className="text-xs font-medium text-gray-600">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Preferences</h2>

          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-gray-700 font-medium">Default water goal</p>
              <p className="text-sm text-gray-400">Used when a new day's log is created</p>
            </div>
            <input
              type="number"
              min="1"
              className="w-20 p-2 rounded-lg border focus:outline-none focus:ring-2 ring-accent"
              value={profile.default_water_goal}
              onChange={(e) =>
                setProfile({ ...profile, default_water_goal: e.target.value })
              }
              onBlur={() =>
                saveField(
                  { default_water_goal: parseInt(profile.default_water_goal, 10) || 8 },
                  "Default water goal saved 💧"
                )
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 font-medium">Notifications</p>
              <p className="text-sm text-gray-400">Gentle reminders throughout the day</p>
            </div>
            <button
              onClick={() =>
                saveField(
                  { notifications_enabled: !profile.notifications_enabled },
                  profile.notifications_enabled ? "Notifications off" : "Notifications on 🔔"
                )
              }
              className={`w-14 h-8 rounded-full flex items-center px-1 transition ${
                profile.notifications_enabled ? "bg-accent justify-end" : "bg-gray-200 justify-start"
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-white shadow" />
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Settings;

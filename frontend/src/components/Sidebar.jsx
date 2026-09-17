import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaCalendarAlt,
  FaTint,
  FaMoon,
  FaBullseye,
  FaCog,
  FaBook,
  FaBars,
  FaTimes,
  FaFire,
} from "react-icons/fa";
import { IoCheckbox } from "react-icons/io5";
import { GiBlood } from "react-icons/gi";
import { getProfile } from "../api/profile";
import { getHabits } from "../api/habits";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: FaHome },
  { to: "/tasks", label: "Tasks", icon: IoCheckbox },
  { to: "/calendar", label: "Calendar", icon: FaCalendarAlt },
  { to: "/period", label: "Period Tracker", icon: GiBlood },
  { to: "/water", label: "Water Tracker", icon: FaTint },
  { to: "/habits", label: "Habits", icon: FaMoon },
  { to: "/goals", label: "Goals", icon: FaBullseye },
  { to: "/journal", label: "Journal", icon: FaBook },
  { to: "/settings", label: "Settings", icon: FaCog },
];

function SidebarContent({ pathname, onNavigate, name, bestStreak }) {
  return (
    <div className="w-72 bg-white h-full p-6 flex flex-col">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-accent-gradient flex items-center justify-center text-3xl font-bold text-accent-600 shadow-inner mb-3">
          {name ? name[0].toUpperCase() : "🌸"}
        </div>
        <p className="font-semibold text-gray-700">Hi, {name || "there"}! 👋</p>
      </div>

      <nav className="space-y-1.5 text-base flex-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-full font-medium transition-colors ${
                active
                  ? "bg-accent-50 text-accent-600 shadow-sm"
                  : "text-gray-500 hover:bg-accent-50 hover:text-accent-600"
              }`}
            >
              <Icon className={active ? "text-accent" : ""} />
              {label}
            </Link>
          );
        })}
      </nav>

      <Link
        to="/habits"
        onClick={onNavigate}
        className="bg-accent-gradient rounded-2xl p-5 text-center block hover:brightness-95 transition mt-4"
      >
        <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center mx-auto mb-2 text-xl">
          <FaFire className="text-orange-400" />
        </div>
        <p className="font-semibold text-gray-700">
          {bestStreak > 0 ? `${bestStreak}-day streak!` : "Start a streak"}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {bestStreak > 0 ? "Keep it going today ✨" : "Build a habit today ✨"}
        </p>
      </Link>
    </div>
  );
}

function Sidebar() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [name, setName] = useState("");
  const [bestStreak, setBestStreak] = useState(0);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    getProfile()
      .then((p) => setName(p.display_name))
      .catch(() => {});
    getHabits()
      .then((h) => setBestStreak(h.reduce((max, x) => Math.max(max, x.current_streak), 0)))
      .catch(() => {});
  }, [pathname]);

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block shadow-xl">
        <SidebarContent pathname={pathname} name={name} bestStreak={bestStreak} />
      </div>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white shadow-md flex items-center justify-between px-4 py-3">
        <span className="text-xl font-bold text-accent">🌸 HerDaily</span>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-2xl text-accent-600"
          aria-label="Open menu"
        >
          <FaBars />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative shadow-2xl animate-toast-in">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-xl text-gray-400"
              aria-label="Close menu"
            >
              <FaTimes />
            </button>
            <SidebarContent
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
              name={name}
              bestStreak={bestStreak}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;

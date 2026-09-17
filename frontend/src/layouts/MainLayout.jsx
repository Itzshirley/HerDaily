import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { FaBell } from "react-icons/fa";
import { getProfile } from "../api/profile";

function MainLayout({ children }) {
  const [initial, setInitial] = useState("🌸");

  useEffect(() => {
    getProfile()
      .then((p) => setInitial(p.display_name ? p.display_name[0].toUpperCase() : "🌸"))
      .catch(() => {});
  }, []);

  return (
    <div className="flex bg-accent-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="hidden lg:flex items-center justify-end gap-3 px-10 pt-6">
          <button
            className="w-11 h-11 rounded-full bg-white shadow flex items-center justify-center text-accent-600 relative"
            aria-label="Notifications"
          >
            <FaBell />
          </button>
          <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center text-white font-semibold">
            {initial}
          </div>
        </div>

        <div className="flex-1 p-6 lg:px-10 lg:pb-10 lg:pt-4 pt-20 lg:pt-4 max-w-full overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

export default MainLayout;

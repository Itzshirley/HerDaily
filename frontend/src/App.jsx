import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import CalendarPage from "./pages/CalendarPage";
import PeriodTracker from "./pages/PeriodTracker";
import WaterTracker from "./pages/WaterTracker";
import Habits from "./pages/Habits";
import Goals from "./pages/Goals";
import Journal from "./pages/Journal";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Dashboard */}
        <Route
          path="/"
          element={<Dashboard />}
        />

        {/* Tasks */}
        <Route
          path="/tasks"
          element={<Tasks />}
        />

        {/* Calendar */}
        <Route
          path="/calendar"
          element={<CalendarPage />}
        />

        {/* Period Tracker */}
        <Route
          path="/period"
          element={<PeriodTracker />}
        />

        {/* Water Tracker */}
        <Route
          path="/water"
          element={<WaterTracker />}
        />

        {/* Habits */}
        <Route
          path="/habits"
          element={<Habits />}
        />

        {/* Goals */}
        <Route
          path="/goals"
          element={<Goals />}
        />

        {/* Journal */}
        <Route
          path="/journal"
          element={<Journal />}
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={<Settings />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
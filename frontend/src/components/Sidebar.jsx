import { Link } from "react-router-dom";
import {
  FaHome,
  FaCalendarAlt,
  FaTint,
  FaMoon,
  FaBullseye,
  FaCog,
  FaBook,
} from "react-icons/fa";
import { IoCheckbox } from "react-icons/io5";
import { GiBlood } from "react-icons/gi";

function Sidebar() {
  return (
    <div className="w-72 bg-white shadow-xl min-h-screen p-6">

      <h1 className="text-3xl font-bold text-pink-500 mb-10">
        🌸 HerDaily
      </h1>

      <div className="space-y-6 text-lg">

        <Link to="/" className="flex gap-3 hover:text-pink-500">
          <FaHome />
          Dashboard
        </Link>

        <Link to="/tasks" className="flex gap-3 hover:text-pink-500">
          <IoCheckbox />
          Tasks
        </Link>

        <Link to="/calendar" className="flex gap-3 hover:text-pink-500">
          <FaCalendarAlt />
          Calendar
        </Link>

        <Link to="/period" className="flex gap-3 hover:text-pink-500">
          <GiBlood />
          Period Tracker
        </Link>

        <Link to="/water" className="flex gap-3 hover:text-pink-500">
          <FaTint />
          Water Tracker
        </Link>

        <Link to="/habits" className="flex gap-3 hover:text-pink-500">
          <FaMoon />
          Habits
        </Link>

        <Link to="/goals" className="flex gap-3 hover:text-pink-500">
          <FaBullseye />
          Goals
        </Link>

        <Link to="/journal" className="flex gap-3 hover:text-pink-500">
          <FaBook />
          Journal
        </Link>

        <Link to="/settings" className="flex gap-3 hover:text-pink-500">
          <FaCog />
          Settings
        </Link>

      </div>
    </div>
  );
}

export default Sidebar;
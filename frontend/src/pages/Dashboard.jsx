import MainLayout from "../layouts/MainLayout";

function Dashboard() {
  return (
    <MainLayout>

      <h1 className="text-4xl font-bold text-pink-500 mb-8">
        Hello Shirley ✨
      </h1>

      <div className="grid grid-cols-2 gap-8">

        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-2xl">📝 Tasks</h2>
          <p className="mt-4 text-gray-500">
            Stay productive today 💖
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-2xl">
            🩸 Cycle Information
          </h2>

          <p className="mt-4 text-gray-500">
            Ovulation in 3 days 🌷
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-2xl">
            💧 Water Tracker
          </h2>

          <p className="mt-4 text-gray-500">
            6 / 8 glasses today ✨
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-2xl">
            🌙 Habits
          </h2>

          <p className="mt-4 text-gray-500">
            Current streak 🔥 5 days
          </p>
        </div>

      </div>

    </MainLayout>
  );
}

export default Dashboard;
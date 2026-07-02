import MainLayout from "../layouts/MainLayout";

function WaterTracker() {
  return (
    <MainLayout>
      <h1 className="text-4xl font-bold text-pink-500 mb-8">
        💧 Water Tracker
      </h1>

      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold">
          Daily Goal
        </h2>

        <p className="mt-4 text-gray-500">
          6 / 8 glasses ✨
        </p>
      </div>
    </MainLayout>
  );
}

export default WaterTracker;
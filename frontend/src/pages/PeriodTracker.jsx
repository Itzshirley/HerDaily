import MainLayout from "../layouts/MainLayout";

function PeriodTracker() {
  return (
    <MainLayout>

      <h1 className="text-4xl font-bold text-pink-500 mb-8">
        🩸 Period Tracker
      </h1>

      <div className="grid grid-cols-2 gap-8">

        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-2xl">
            Next Period
          </h2>

          <p className="mt-4">
            July 2 🌸
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-2xl">
            Mood
          </h2>

          <p className="mt-4">
            😊 Happy
          </p>
        </div>

      </div>

    </MainLayout>
  );
}

export default PeriodTracker;
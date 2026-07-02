import MainLayout from "../layouts/MainLayout";

function Tasks() {
  return (
    <MainLayout>

      <h1 className="text-4xl text-pink-500 font-bold mb-8">
        📝 Tasks
      </h1>

      <div className="bg-white p-8 rounded-3xl shadow-lg">

        <input
          className="w-full p-4 rounded-xl border"
          placeholder="Search tasks..."
        />

      </div>

    </MainLayout>
  );
}

export default Tasks;
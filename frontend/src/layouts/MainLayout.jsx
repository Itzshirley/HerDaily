import Sidebar from "../components/Sidebar";

function MainLayout({ children }) {
  return (
    <div className="flex bg-pink-50">

      <Sidebar />

      <div className="flex-1 p-10">
        {children}
      </div>

    </div>
  );
}

export default MainLayout;
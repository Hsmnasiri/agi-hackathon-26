import { Outlet } from "react-router-dom";
import { Sidebar, TopBar } from "./components/layout";

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="scroll-soft flex-1 overflow-y-auto px-5 py-6 sm:px-7 sm:py-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Counter from "./components/Counter";
import Timer from "./components/Timer";
import ThemeToggle from "./components/ThemeToggle";
import { ThemeProvider } from "./context/ThemeContext";
import AllHooksDemo from "./components/AllHooksDemo";

export default function App() {
  return (
    <>
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="flex items-center justify-between py-3">
            <div className="text-lg font-semibold">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Hooks Playground</span>
            </div>
            <div className="flex items-center gap-5 text-sm">
              <NavLink 
                to="/" 
                className={({ isActive }) => `px-2 py-1 rounded-md transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'hover:text-blue-600 dark:hover:text-blue-400'}`}
              >
                  useState
              </NavLink>
              <NavLink 
                to="/effect"
                className={({ isActive }) => `px-2 py-1 rounded-md transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'hover:text-blue-600 dark:hover:text-blue-400'}`}
                >
                  useEffect
              </NavLink>
              <NavLink 
                to="/context"
                className={({ isActive }) => `px-2 py-1 rounded-md transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'hover:text-blue-600 dark:hover:text-blue-400'}`}
                >
                  useContext
              </NavLink>
              <NavLink 
                to="/all"
                className={({ isActive }) => `px-2 py-1 rounded-md transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'hover:text-blue-600 dark:hover:text-blue-400'}`}
                >
                  All
              </NavLink>
            </div>
          </nav>
        </div>
      </header>

      <main className="container-page">
        <div className="card">
          <Routes>
            <Route path="/" element={<Counter />} />
            <Route path="/effect" element={<Timer />} />
            <Route path="/context" element={<ThemeToggle />} />
            <Route path="/all" element={<AllHooksDemo />} />
          </Routes>
        </div>
      </main>
    </>
  );
}


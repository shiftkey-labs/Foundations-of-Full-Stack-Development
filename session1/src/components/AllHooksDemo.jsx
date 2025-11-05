import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function AllHooksDemo() {
  const { dark, toggleTheme } = useTheme(); // useContext
  const [count, setCount] = useState(0); // useState
  const [seconds, setSeconds] = useState(0); // useState for timer

  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000); // useEffect
    return () => clearInterval(id);
  }, []);

  return (
    <div className="text-center space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">All Hooks Together</h1>
        <p className="text-gray-600 dark:text-gray-300">useState + useEffect + useContext</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">Current Theme</p>
          <p className="text-lg font-semibold mb-4">{dark ? "Dark" : "Light"}</p>
          <button className="btn-primary" onClick={toggleTheme}>Toggle Theme</button>
        </div>

        <div className="card">
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">Click Counter</p>
          <p className="text-lg font-semibold mb-4">{count}</p>
          <button className="btn-primary" onClick={() => setCount(c => c + 1)}>Increment</button>
        </div>

        <div className="card">
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">Seconds Elapsed</p>
          <p className="text-lg font-semibold mb-4">{seconds}</p>
          <button className="btn-primary" onClick={() => setSeconds(0)}>Reset</button>
        </div>
      </div>
    </div>
  );
}


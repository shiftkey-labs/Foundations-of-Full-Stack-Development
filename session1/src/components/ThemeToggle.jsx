import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { dark, toggleTheme } = useTheme();

  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold mb-2">useContext Example</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-300">Current theme: <span className="font-bold">{dark ? "Dark" : "Light"}</span></p>
      <button onClick={toggleTheme} className="btn-primary">Toggle Theme</button>
    </div>
  );
}


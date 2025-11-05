import { useState } from "react";
import { ThemeContext, useTheme } from "../context/ThemeContext";
import { useContext } from "react";

export default function Counter() {
  const [cnt, setCnt] = useState(0);

  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold mb-2">useState Example</h1>
      <p className="mb-6">Click count: <span className="font-bold">{cnt}</span></p>
      <button onClick={() => setCnt(c => c + 1)} className="btn-primary">Click ME!</button>
    </div>
  );
}


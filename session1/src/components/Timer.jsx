import { useState, useEffect } from "react";

export default function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold mb-2">useEffect Example</h1>
      <p className="text-lg">Timer running: <span className="font-bold">{seconds}</span> seconds</p>
    </div>
  );
}


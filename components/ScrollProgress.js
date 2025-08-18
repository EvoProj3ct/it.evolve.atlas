"use client";

import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.body.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const scrolled = (currentScroll / totalScroll) * 100;
      setProgress(scrolled);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="progress-container">
      <div className="progress-bar" style={{ height: `${progress}%` }} />
    </div>
  );
}

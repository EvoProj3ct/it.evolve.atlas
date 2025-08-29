"use client";
import { useEffect } from "react";

export default function WindowEffects() {
  useEffect(() => {
    const windows = Array.from(document.querySelectorAll(".home-section .content"));

    let tray = document.querySelector(".icon-tray");
    if (!tray) {
      tray = document.createElement("div");
      tray.className = "icon-tray";
      document.body.appendChild(tray);
    }

    windows.forEach((win) => {
      const closeBtn = win.querySelector(".close");
      const minBtn = win.querySelector(".minimize");

      closeBtn?.addEventListener("click", () => {
        win.style.display = "none";
        const next = win.parentElement.nextElementSibling;
        if (next) next.scrollIntoView({ behavior: "smooth" });
      });

      minBtn?.addEventListener("click", () => {
        win.style.display = "none";
        const icon = document.createElement("span");
        icon.className = "window-icon";
        icon.textContent =
          win.querySelector(".title")?.textContent?.charAt(0) || "?";
        icon.title = win.querySelector(".title")?.textContent || "";
        icon.addEventListener("click", () => {
          win.style.display = "block";
          icon.remove();
          win.scrollIntoView({ behavior: "smooth" });
        });
        tray.appendChild(icon);
      });
    });
  }, []);

  return null;
}

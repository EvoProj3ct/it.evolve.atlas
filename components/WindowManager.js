"use client";
import { useEffect } from "react";

export default function WindowManager() {
  useEffect(() => {
    const sections = document.querySelectorAll('.home-section');
    sections.forEach(section => {
      const content = section.querySelector('.content.window');
      const minimize = content?.querySelector('.window-btn.minimize');
      const close = content?.querySelector('.window-btn.close');
      if (!content || !minimize || !close) return;
      section.addEventListener('mouseenter', () => {
        content.classList.add('active');
        content.classList.remove('hidden', 'minimized');
      });
      minimize.addEventListener('click', e => {
        e.stopPropagation();
        content.classList.add('minimized');
        content.classList.remove('active');
      });
      close.addEventListener('click', e => {
        e.stopPropagation();
        content.classList.add('destroying');
        content.classList.remove('active');
        setTimeout(() => {
          content.classList.add('hidden');
          content.classList.remove('destroying');
        }, 500);
      });
    });
  }, []);
  return null;
}

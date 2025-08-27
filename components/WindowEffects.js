"use client";
import { useEffect } from "react";

export default function WindowEffects() {
  useEffect(() => {
    const windows = Array.from(document.querySelectorAll('.home-section .content'));

    windows.forEach(win => {
      const bar = win.querySelector('.window-bar');
      const closeBtn = bar?.querySelector('.close');
      const minBtn = bar?.querySelector('.minimize');

      const showBar = () => {
        bar.style.display = 'flex';
      };

      const reset = () => {
        bar.style.display = 'none';
        win.classList.remove('destroy');
        win.style.visibility = 'hidden';
        setTimeout(() => {
          win.style.visibility = 'visible';
          win.classList.add('fade-in');
          setTimeout(() => win.classList.remove('fade-in'), 1000);
        }, 2000);
      };

      win.addEventListener('mouseenter', showBar);

      const destroyWindow = () => {
        win.classList.add('destroy');
        setTimeout(reset, 500);
      };

      closeBtn?.addEventListener('click', destroyWindow);
      minBtn?.addEventListener('click', destroyWindow);
    });
  }, []);

  return null;
}

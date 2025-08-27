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
      };

      win.addEventListener('mouseenter', showBar);

      closeBtn?.addEventListener('click', () => {
        win.classList.add('destroy');
        setTimeout(reset, 500);
      });
      minBtn?.addEventListener('click', () => {
        win.classList.add('destroy');
        setTimeout(reset, 500);
      });
    });
  }, []);

  return null;
}

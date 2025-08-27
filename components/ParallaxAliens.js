"use client";
import { useEffect } from "react";

export default function ParallaxAliens() {
  useEffect(() => {
    const aliens = Array.from(document.querySelectorAll('.alien'));
    aliens.forEach(el => {
      el.dataset.base = (-el.offsetHeight / 2).toString();
    });

    const handleScroll = () => {
      const scrollY = window.scrollY;
      aliens.forEach(el => {
        const base = parseFloat(el.dataset.base || '0');
        const speed = parseFloat(el.dataset.speed || '1.5');
        el.style.transform = `translateY(${scrollY * speed + base}px)`;
      });

      const ship = document.querySelector('.bottom-ship');
      if (ship) {
        const total = document.body.scrollHeight - window.innerHeight;
        const progress = scrollY / total;
        const maxX = window.innerWidth - ship.clientWidth;
        ship.style.transform = `translateX(${progress * maxX}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return null;
}

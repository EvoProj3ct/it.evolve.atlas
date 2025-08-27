"use client";
import { useEffect } from "react";

export default function ParallaxAliens() {
  useEffect(() => {
    const handleScroll = () => {
      const ship = document.querySelector('.bottom-ship');
      const bulletContainer = document.querySelector('.bullet-container');
      if (ship && bulletContainer) {
        const maxX = window.innerWidth - ship.clientWidth;
        const center = maxX / 2;
        const shipX = center + Math.sin(window.scrollY / 50) * center;
        const shipStep = Math.round(shipX / 20) * 20;
        ship.style.transform = `translateX(${shipStep}px)`;
        bulletContainer.style.transform = `translateX(${shipStep + ship.clientWidth / 2}px)`;
      }

      const bullets = document.querySelectorAll('.bullet');
      bullets.forEach((bullet, i) => {
        const y = window.scrollY * 0.5 + i * 80;
        const yStep = Math.round(y / 20) * 20;
        bullet.style.transform = `translateY(-${yStep}px)`;
      });

      const aliens = document.querySelectorAll('.alien');
      aliens.forEach((alien, i) => {
        const y = window.scrollY * (0.3 + i * 0.1);
        const x = Math.sin(window.scrollY / 80 + i) * 50;
        const stepX = Math.round(x / 20) * 20;
        const stepY = Math.round(y / 20) * 20;
        alien.style.transform = `translate(${stepX}px, ${stepY}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return null;
}

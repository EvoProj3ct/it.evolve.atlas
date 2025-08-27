"use client";
import { useEffect } from "react";

export default function ParallaxAliens() {
  useEffect(() => {
    const handleScroll = () => {
      const ship = document.querySelector('.bottom-ship');
      if (ship) {
        const total = document.body.scrollHeight - window.innerHeight;
        const progress = window.scrollY / total;
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

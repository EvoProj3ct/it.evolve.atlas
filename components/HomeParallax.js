"use client";
import { usePathname } from "next/navigation";
import ParallaxAliens from "./ParallaxAliens";

export default function HomeParallax() {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  return (
    <>
      <ParallaxAliens />
      <div className="space-ship-container">
        <img src="/ship.svg" alt="" className="bottom-ship ship-fluo" />
      </div>
      <div className="bullet-layer"></div>
      <div className="aliens-layer"></div>
    </>
  );
}

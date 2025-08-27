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
        <div className="bullet-container">
          <span className="bullet" />
          <span className="bullet" />
          <span className="bullet" />
        </div>
      </div>
      <div className="aliens-layer">
        <img src="/alien1.svg" alt="" className="alien pink" />
        <img src="/alien2.svg" alt="" className="alien red" />
        <img src="/alien3.svg" alt="" className="alien blue" />
        <img src="/alien1.svg" alt="" className="alien green" />
        <img src="/alien2.svg" alt="" className="alien yellow" />
      </div>
    </>
  );
}

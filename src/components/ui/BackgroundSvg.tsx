"use client";

import { useEffect, useState } from "react";

/**
 * Renders background.svg as <img> so the browser keeps it vector (no rasterization).
 * Tiles vertically to cover the full page; scrolls with content.
 */
export default function BackgroundSvg() {
  const [tileCount, setTileCount] = useState(3);

  useEffect(() => {
    const updateTiles = () => {
      const vw = window.innerWidth;
      const singleHeight = (5000 / 1920) * vw;
      const pageHeight = document.documentElement.scrollHeight;
      const count = Math.max(2, Math.ceil(pageHeight / singleHeight) + 1);
      setTileCount(count);
    };

    updateTiles();
    window.addEventListener("resize", updateTiles);
    const ro = new ResizeObserver(updateTiles);
    ro.observe(document.documentElement);

    return () => {
      window.removeEventListener("resize", updateTiles);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      className="absolute inset-0 z-[-1] pointer-events-none min-h-full"
      aria-hidden
    >
      <div className="flex flex-col w-full min-h-full">
        {Array.from({ length: tileCount }).map((_, i) => (
          <img
            key={i}
            src="/background.svg"
            alt=""
            className="w-full h-auto block flex-shrink-0"
            width={1920}
            height={5000}
            fetchPriority={i === 0 ? "high" : "low"}
          />
        ))}
      </div>
    </div>
  );
}

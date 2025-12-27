// src/components/ui/ProgressionLane.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { Footprints, MapPin } from "lucide-react";

interface ProgressionLaneProps {
  distance: number;
  isMoving: boolean;
}

export const ProgressionLane: React.FC<ProgressionLaneProps> = ({
  distance,
  isMoving,
}) => {
  const bgPos = -(distance * 2) % 1000;

  return (
    // ★ 修正: h-16 (64px) -> h-12 (48px) にコンパクト化
    <div className="w-full h-12 sm:h-16 relative overflow-hidden bg-black/40 border-t border-white/10 backdrop-blur-sm mt-0">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(90deg, transparent 95%, #00ffff 100%)`,
          backgroundSize: "50px 100%",
          transform: `translateX(${bgPos}px)`,
          transition: "transform 0.5s linear",
        }}
      />

      <div className="absolute left-6 sm:left-8 bottom-3 sm:bottom-4 text-cyan-400 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
        <div
          className={cn(
            "transition-transform duration-300",
            isMoving ? "animate-bounce" : ""
          )}
        >
          {/* アイコンサイズ調整 */}
          <Footprints className="transform rotate-90 w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      <div className="absolute right-4 bottom-3 sm:bottom-4 font-mono text-[10px] sm:text-xs text-white/50 flex items-center gap-1">
        <MapPin size={10} />
        {distance}m
      </div>

      {isMoving && (
        <div className="absolute left-10 sm:left-12 bottom-0 w-20 h-full bg-linear-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 blur-md transform skew-x-12" />
      )}
    </div>
  );
};

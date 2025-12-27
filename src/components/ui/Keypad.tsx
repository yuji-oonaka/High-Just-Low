// src/components/ui/Keypad.tsx
import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { UIMode, AnswerType } from "@/types";
import { ArrowUp, ArrowDown, Target } from "lucide-react";

interface KeypadProps {
  onInput: (type: AnswerType) => void;
  disabled: boolean;
  uiMode: UIMode;
  highlightType?: AnswerType; // ★ 追加: 正解誘導用
}

export const Keypad: React.FC<KeypadProps> = ({
  onInput,
  disabled,
  uiMode,
  highlightType,
}) => {
  const isRugged = uiMode === "RUGGED";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.key === "ArrowUp") onInput("HIGH");
      if (e.key === "ArrowDown") onInput("LOW");
      if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ")
        onInput("JUST");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled, onInput]);

  const btnBase = isRugged
    ? "bg-gray-200 text-black border-4 border-gray-400 active:translate-y-1 active:border-b-0"
    : "backdrop-blur-md shadow-lg active:scale-95 transition-all";

  const highLowStyle = isRugged
    ? "hover:bg-gray-300"
    : "bg-white/10 border border-white/20 text-white hover:bg-white/20";

  const justStyle = isRugged
    ? "bg-black text-white border-black hover:bg-gray-800"
    : "bg-cyan-500/80 text-white border border-cyan-400 shadow-cyan-500/50 hover:bg-cyan-500";

  // ★ 誘導用のスタイル（点滅して目立たせる）
  const highlightStyle =
    "ring-4 ring-yellow-400/80 animate-pulse bg-yellow-500/20";

  return (
    <div className="w-full h-full flex gap-3 sm:gap-4">
      {/* 左側: HIGH / LOW */}
      <div className="flex-1 flex flex-col gap-3 sm:gap-4">
        <button
          disabled={disabled}
          onClick={() => onInput("HIGH")}
          className={cn(
            "flex-1 rounded-2xl flex flex-col items-center justify-center font-black tracking-widest gap-1",
            "text-base sm:text-xl",
            btnBase,
            highLowStyle,
            highlightType === "HIGH" && highlightStyle // ★ 誘導
          )}
        >
          <ArrowUp className="w-6 h-6 sm:w-8 sm:h-8" />
          HIGH
        </button>
        <button
          disabled={disabled}
          onClick={() => onInput("LOW")}
          className={cn(
            "flex-1 rounded-2xl flex flex-col items-center justify-center font-black tracking-widest gap-1",
            "text-base sm:text-xl",
            btnBase,
            highLowStyle,
            highlightType === "LOW" && highlightStyle // ★ 誘導
          )}
        >
          <ArrowDown className="w-6 h-6 sm:w-8 sm:h-8" />
          LOW
        </button>
      </div>

      {/* 右側: JUST */}
      <button
        disabled={disabled}
        onClick={() => onInput("JUST")}
        className={cn(
          "flex-1 rounded-2xl flex flex-col items-center justify-center font-black tracking-widest gap-2",
          "text-2xl sm:text-3xl",
          btnBase,
          justStyle,
          highlightType === "JUST" && highlightStyle // ★ 誘導
        )}
      >
        <Target className="w-10 h-10 sm:w-12 sm:h-12" />
        JUST
      </button>
    </div>
  );
};

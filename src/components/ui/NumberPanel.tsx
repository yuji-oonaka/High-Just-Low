// src/components/ui/NumberPanel.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { UIMode, GameStatus } from "@/types";
import { Pause, Eye, Lightbulb, PlayCircle } from "lucide-react";

interface NumberPanelProps {
  formula: string;
  value: number;
  status: GameStatus;
  uiMode: UIMode;
  isTutorial?: boolean;
  questionCount?: number;
}

export const NumberPanel: React.FC<NumberPanelProps> = ({
  formula,
  value,
  status,
  uiMode,
  isTutorial,
  questionCount = 0,
}) => {
  const isRugged = uiMode === "RUGGED";
  const isFlash = status === "FLASH";
  const isInput = status === "INPUT";
  const isPaused = status === "PAUSED";
  const isPeek = status === "PEEK";
  const isCountdown = status === "COUNTDOWN";
  const isBridge = status === "TUTORIAL_BRIDGE";

  // 3問目(Warmup)の極薄演出用
  const isWarmup = !isRugged && questionCount === 3 && (isFlash || isInput);

  return (
    <div
      className={cn(
        // ★ 修正: duration-300 -> duration-200 (全体的にキビキビさせる)
        "flex flex-col items-center justify-center w-full h-full transition-all duration-200 relative overflow-hidden",
        isRugged
          ? cn("border-4 border-black bg-white")
          : cn(
              "bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl",
              isCountdown &&
                "border-yellow-400/50 shadow-[0_0_30px_rgba(250,204,21,0.2)] bg-white/5",
              isTutorial &&
                "border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.2)]",
              isBridge && "border-white/40 bg-white/10",
              isWarmup &&
                "border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            )
      )}
    >
      {/* PAUSED Overlay */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center z-20 transition-all duration-200 backdrop-blur-sm bg-black/40",
          isPaused ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="flex flex-col items-center text-white animate-pulse">
          <Pause size={48} />
          <span className="text-xl font-black tracking-widest mt-2">
            PAUSED
          </span>
        </div>
      </div>

      {/* PEEK Overlay */}
      {isPeek && (
        <div className="absolute top-4 left-0 w-full flex justify-center z-20">
          <div className="bg-green-500 text-black px-4 py-1 rounded-full text-[10px] font-bold animate-pulse flex items-center gap-2 shadow-lg shadow-green-500/50">
            <Eye size={12} /> CHECKING ANSWER...
          </div>
        </div>
      )}

      {/* チュートリアルガイド */}
      {isTutorial && !isRugged && (
        <div className="absolute top-4 left-0 w-full flex justify-center z-20">
          <div className="bg-cyan-500 text-black px-4 py-1 rounded-full text-[10px] font-bold animate-pulse flex items-center gap-2 shadow-lg shadow-cyan-500/50">
            <Lightbulb size={12} />
            {isFlash ? "今のうちに計算して" : "答えより 高い？低い？"}
          </div>
        </div>
      )}

      {/* TUTORIAL BRIDGE */}
      {isBridge && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 animate-in zoom-in fade-in duration-300">
          <PlayCircle size={48} className="text-white mb-2 animate-bounce" />
          <div className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg">
            じゃあ、いくよ！
          </div>
        </div>
      )}

      {/* カウントダウン時の視線誘導 */}
      {isCountdown && !isRugged && (
        <div className="absolute inset-0 flex items-center justify-center z-10 animate-pulse">
          <span className="text-sm font-light text-white/50 tracking-widest">
            ここに出るよ
          </span>
        </div>
      )}

      {/* 3問目の極薄テキスト */}
      {isWarmup && !isPaused && !isPeek && (
        <div className="absolute top-4 w-full text-center z-10 animate-in fade-in duration-1000">
          <span className="text-[10px] font-black text-white/20 tracking-[0.5em] uppercase">
            FOCUS
          </span>
        </div>
      )}

      {/* FLASH Phase */}
      <div
        className={cn(
          // ★ 修正: duration-300 -> duration-200
          "absolute inset-0 flex items-center justify-center text-4xl sm:text-6xl font-black tracking-tighter transition-opacity duration-200",
          ((isFlash && !isPaused) || isPeek) && !isBridge
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {formula} = ?
      </div>

      {/* INPUT Phase */}
      <div
        className={cn(
          // ★ 修正: duration-300 -> duration-200
          "absolute inset-0 flex items-center justify-center text-6xl sm:text-8xl font-black tracking-tighter transition-all duration-200",
          isInput && !isPaused && !isBridge
            ? isPeek
              ? "opacity-10 scale-75 blur-sm filter grayscale"
              : isRugged
              ? "text-black"
              : "text-white scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
            : "opacity-0 scale-150"
        )}
      >
        {value}
      </div>

      {/* 待機中 */}
      {!isFlash &&
        !isInput &&
        !isPaused &&
        !isPeek &&
        !isCountdown &&
        !isBridge &&
        status !== "GAP" &&
        !isRugged && (
          <div className="animate-pulse opacity-50 font-mono text-sm sm:text-base">
            WAITING...
          </div>
        )}
    </div>
  );
};

// src/components/screens/ResultScreen.tsx
import React from "react";
import {
  RotateCcw,
  Home,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown,
  Target,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GameState, UIMode, HistoryItem, AnswerType } from "@/types";

interface ResultScreenProps {
  gameState: GameState;
  uiMode: UIMode;
  onRetry: () => void;
  onHome: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  gameState,
  uiMode,
  onRetry,
  onHome,
}) => {
  const isRugged = uiMode === "RUGGED";

  const containerStyle = isRugged
    ? "bg-white text-black font-mono selection:bg-black selection:text-white"
    : "bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white font-sans";

  const buttonStyle = isRugged
    ? "border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors uppercase font-bold text-sm"
    : "bg-white/20 hover:bg-white/30 px-6 py-3 rounded-full font-bold backdrop-blur text-sm transition-transform active:scale-95";

  // 直近10件を表示（逆順にして最新を上に）
  const recentHistory = [...gameState.history].reverse().slice(0, 10);

  const getIcon = (type: AnswerType | "MISS_TIMEOUT") => {
    switch (type) {
      case "HIGH":
        return <ArrowUp size={14} />;
      case "LOW":
        return <ArrowDown size={14} />;
      case "JUST":
        return <Target size={14} />;
      case "MISS_TIMEOUT":
        return <Clock size={14} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 text-center",
        containerStyle
      )}
    >
      <div className="animate-in slide-in-from-bottom-10 fade-in duration-500 w-full max-w-md flex flex-col h-[80vh]">
        {/* Header Section */}
        <div className="flex-none space-y-4 mb-6">
          <div className="space-y-1">
            <h2 className="text-sm font-bold opacity-60 tracking-widest">
              FINISHED
            </h2>
            <div className="text-7xl font-black tracking-tighter">
              {gameState.score}
            </div>
          </div>

          <div className="flex justify-center gap-4 text-xs font-bold opacity-80">
            <div className="flex flex-col items-center">
              <span className="opacity-50">DIFFICULTY</span>
              <span>{gameState.difficulty}</span>
            </div>
            <div className="w-px bg-current opacity-30" />
            <div className="flex flex-col items-center">
              <span className="opacity-50">MAX COMBO</span>
              <span className="text-yellow-500">{gameState.maxCombo}</span>
            </div>
          </div>
        </div>

        {/* History Review Section (Scrollable) */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-2 mb-6 scrollbar-thin scrollbar-thumb-gray-500/20">
          <h3 className="text-xs font-bold text-left opacity-50 mb-2 sticky top-0 bg-inherit z-10 py-2 border-b border-white/10">
            RECENT LOG (Latest 10)
          </h3>
          {recentHistory.map((item, idx) => (
            <div
              key={idx}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg text-xs sm:text-sm font-bold transition-colors",
                isRugged
                  ? "bg-gray-100 border border-gray-200"
                  : "bg-white/5 border border-white/10",
                !item.isCorrect &&
                  (isRugged
                    ? "bg-red-50 border-red-200"
                    : "bg-red-500/10 border-red-500/30")
              )}
            >
              {/* Formula & Display */}
              <div className="flex flex-col items-start gap-1 w-24">
                <div className="opacity-60 text-[10px]">
                  {item.formula} = {item.answer}
                </div>
                <div className="text-lg leading-none">{item.display}</div>
              </div>

              {/* Arrow / Type */}
              <div className="flex-1 flex flex-col items-center px-2">
                <div className="text-[10px] opacity-40 mb-0.5">VS</div>
                <div
                  className={cn(
                    "flex items-center gap-1",
                    item.correctType === "HIGH"
                      ? "text-cyan-500"
                      : item.correctType === "LOW"
                      ? "text-purple-500"
                      : "text-yellow-500"
                  )}
                >
                  {/* 正解のタイプを表示 */}
                  {getIcon(item.correctType)}
                  <span>{item.correctType}</span>
                </div>
              </div>

              {/* Result */}
              <div className="flex flex-col items-end w-20">
                <div
                  className={cn(
                    "flex items-center gap-1 mb-1",
                    item.isCorrect ? "text-green-500" : "text-red-500"
                  )}
                >
                  {item.isCorrect ? "YOU: OK" : "YOU: NG"}
                  {item.isCorrect ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <XCircle size={12} />
                  )}
                </div>
                <div className="opacity-50 text-[10px] flex items-center gap-1">
                  Selected: {getIcon(item.playerAns)}{" "}
                  {item.playerAns === "MISS_TIMEOUT" ? "TIME" : item.playerAns}
                </div>
              </div>
            </div>
          ))}
          {recentHistory.length === 0 && (
            <div className="text-center opacity-30 py-8">No History</div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex-none flex gap-4 justify-center pt-2">
          <button onClick={onHome} className={buttonStyle}>
            <Home size={20} />
          </button>
          <button
            onClick={onRetry}
            className={cn(buttonStyle, "flex items-center gap-2")}
          >
            <RotateCcw size={20} /> RETRY
          </button>
        </div>
      </div>
    </div>
  );
};

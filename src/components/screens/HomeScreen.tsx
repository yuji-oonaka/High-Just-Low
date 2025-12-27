// src/components/screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import {
  Settings,
  Zap,
  Volume2,
  VolumeX,
  Star,
  ArrowUp,
  ArrowDown,
  BookOpen,
  Sparkles,
  Flame,
  Skull,
  Smile,
  Footprints,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GameConfig, Difficulty, UIMode } from "@/types";

interface HomeScreenProps {
  config: GameConfig;
  setConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
  highScore: number;
  onStart: () => void;
}

const DIFFICULTY_META: Record<
  Difficulty,
  { comment: string; icon: React.ReactNode }
> = {
  PRACTICE: { comment: "まずは肩慣らし", icon: <BookOpen size={16} /> },
  STARTER: { comment: "今日の一発目に", icon: <Footprints size={16} /> },
  EASY: { comment: "リズムに乗ろう", icon: <Smile size={16} /> },
  NORMAL: { comment: "ここが本番", icon: <Zap size={16} /> },
  HARD: { comment: "集中できてる？", icon: <Flame size={16} /> },
  EXTREME: { comment: "覚悟はいい？", icon: <Skull size={16} /> },
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  config,
  setConfig,
  highScore,
  onStart,
}) => {
  const isRugged = config.uiMode === "RUGGED";
  const [activeComment, setActiveComment] = useState("");

  // 難易度変更時にコメント更新 (Luxuryのみ)
  useEffect(() => {
    if (!isRugged) {
      setActiveComment(DIFFICULTY_META[config.difficulty].comment);
    } else {
      setActiveComment("");
    }
  }, [config.difficulty, isRugged]);

  const renderBtn = (d: Difficulty) => {
    const isSelected = config.difficulty === d;
    const meta = DIFFICULTY_META[d];

    return (
      <button
        key={d}
        onClick={() => setConfig((prev) => ({ ...prev, difficulty: d }))}
        className={cn(
          "flex items-center justify-center gap-2 py-3 rounded-xl transition-all border-b-2 active:border-b-0 active:translate-y-0.5",

          isSelected
            ? isRugged
              ? "bg-black text-white border-transparent"
              : d === "PRACTICE"
              ? "bg-green-600 text-white border-green-800 shadow-lg shadow-green-900/40"
              : d === "STARTER"
              ? "bg-yellow-500 text-black border-yellow-700 shadow-lg shadow-yellow-900/40"
              : d === "EXTREME"
              ? "bg-purple-600 text-white border-purple-800 shadow-lg shadow-purple-900/40"
              : "bg-cyan-600 text-white border-cyan-800 shadow-lg shadow-cyan-900/40"
            : isRugged
            ? "bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200"
            : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10"
        )}
      >
        {/* アイコンは選択中のみ表示 (視覚ノイズの削減) */}
        {isSelected && meta.icon}
        <span className="text-xs sm:text-sm font-black tracking-wider uppercase">
          {d}
        </span>
      </button>
    );
  };

  return (
    <div
      className={cn(
        "h-dvh w-full flex flex-col items-center justify-evenly p-4 transition-colors duration-500 relative overflow-hidden",
        isRugged
          ? "bg-white text-black font-mono selection:bg-black selection:text-white"
          : "bg-[#0a0a16] text-white font-sans"
      )}
    >
      {/* 背景装飾 (Luxuryのみ) */}
      {!isRugged && (
        <>
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-20%] left-[-10%] w-150 h-150 bg-cyan-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-150 h-150 bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-1000" />
          </div>
        </>
      )}

      <div className="max-w-md w-full relative z-10 flex flex-col items-center gap-6 sm:gap-8">
        {/* LOGO AREA */}
        <div className="flex flex-col items-center justify-center py-2 select-none w-full scale-90 sm:scale-100">
          <div className="relative group pr-4">
            <h1
              className={cn(
                "px-4 py-1 text-7xl sm:text-8xl font-black italic tracking-tighter leading-none transform -skew-x-6",
                isRugged
                  ? "text-black"
                  : "text-transparent bg-clip-text bg-linear-to-t from-cyan-500 to-white drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]"
              )}
            >
              HIGH
            </h1>
            {!isRugged && (
              <ArrowUp
                className="absolute -left-4 top-1/2 -translate-y-1/2 text-cyan-400 opacity-80"
                size={32}
                strokeWidth={3}
              />
            )}
          </div>

          <div className="flex items-center gap-4 -my-2 z-10">
            <span
              className={cn(
                "text-4xl font-black opacity-30",
                isRugged ? "text-black" : "text-white"
              )}
            >
              /
            </span>
            <h1
              className={cn(
                "px-4 py-1 text-8xl sm:text-9xl font-black tracking-tighter leading-none",
                isRugged
                  ? "text-black"
                  : "text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]"
              )}
            >
              JUST
            </h1>
            <span
              className={cn(
                "text-4xl font-black opacity-30",
                isRugged ? "text-black" : "text-white"
              )}
            >
              /
            </span>
          </div>

          <div className="relative group pr-4">
            <h1
              className={cn(
                "px-4 py-1 text-7xl sm:text-8xl font-black italic tracking-tighter leading-none transform -skew-x-6",
                isRugged
                  ? "text-black"
                  : "text-transparent bg-clip-text bg-linear-to-b from-purple-400 to-purple-600 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
              )}
            >
              LOW
            </h1>
            {!isRugged && (
              <ArrowDown
                className="absolute -right-4 top-1/2 -translate-y-1/2 text-purple-400 opacity-80"
                size={32}
                strokeWidth={3}
              />
            )}
          </div>
        </div>

        {/* MAIN UI AREA */}
        <div className="w-full flex flex-col gap-6">
          {/* Difficulty Grid */}
          <div className="flex flex-col gap-4">
            {/* WARM UP (あえてラベルは消して余白で区切る) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {renderBtn("PRACTICE")}
              {renderBtn("STARTER")}
              {renderBtn("EASY")}
            </div>

            {/* Spacer */}
            <div className="h-2 w-full" />

            {/* CHALLENGE */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {renderBtn("NORMAL")}
              {renderBtn("HARD")}
              {renderBtn("EXTREME")}
            </div>
          </div>

          {/* Information Area (Comment only) */}
          <div className="space-y-2">
            {/* メッセージエリア: 説明文(Sub)を全廃止し、感情(Comment)のみ表示 */}
            <div className="h-6 flex flex-col items-center justify-center text-center">
              {!isRugged && activeComment && (
                <div className="text-sm font-bold text-cyan-300 animate-in fade-in slide-in-from-bottom-1 duration-300">
                  {activeComment}
                </div>
              )}
            </div>

            <button
              onClick={onStart}
              className={cn(
                "w-full py-5 text-xl font-black tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 shadow-xl relative overflow-hidden group rounded-2xl",
                isRugged
                  ? "bg-black text-white border-b-8 border-gray-800 active:border-b-0 active:translate-y-2"
                  : "bg-linear-to-r from-cyan-500 via-blue-500 to-purple-600 text-white shadow-cyan-500/20"
              )}
            >
              <span className="relative z-10 flex items-center justify-center gap-4">
                START GAME
              </span>
              {!isRugged && (
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/20 to-transparent skew-x-12" />
              )}
            </button>
          </div>

          {/* Footer Settings */}
          <div className="flex justify-between items-center px-2">
            <button
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  uiMode: prev.uiMode === "LUXURY" ? "RUGGED" : "LUXURY",
                }))
              }
              className={cn(
                "flex items-center gap-2 text-[10px] font-bold py-2 px-3 rounded-lg transition-colors",
                isRugged
                  ? "text-gray-400 hover:text-black"
                  : "text-white/30 hover:text-white"
              )}
            >
              {isRugged ? <Settings size={14} /> : <Sparkles size={14} />}
              {config.uiMode} MODE
            </button>

            <div
              className={cn(
                "text-[10px] font-bold px-3 py-1 rounded-full",
                isRugged
                  ? "bg-gray-100 text-gray-400"
                  : "bg-white/5 text-white/30"
              )}
            >
              HIGH SCORE: {highScore}
            </div>

            <button
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  isSoundEnabled: !prev.isSoundEnabled,
                }))
              }
              className={cn(
                "flex items-center gap-2 text-[10px] font-bold py-2 px-3 rounded-lg transition-colors",
                isRugged
                  ? "text-gray-400 hover:text-black"
                  : "text-white/30 hover:text-white"
              )}
            >
              {config.isSoundEnabled ? (
                <Volume2 size={14} />
              ) : (
                <VolumeX size={14} />
              )}
              SOUND
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

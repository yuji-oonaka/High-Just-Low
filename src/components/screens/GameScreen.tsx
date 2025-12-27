// src/components/screens/GameScreen.tsx
import React, { useState, useEffect } from "react";
import { Home, Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { GameConfig, GameState, FeedbackState, AnswerType } from "@/types";
import { Keypad } from "@/components/ui/Keypad";
import { NumberPanel } from "@/components/ui/NumberPanel";
import { ProgressionLane } from "@/components/ui/ProgressionLane";
import { useSound } from "@/hooks/useSound";

interface GameScreenProps {
  config: GameConfig;
  gameState: GameState;
  feedback: FeedbackState | null;
  onAnswer: (val: AnswerType) => void;
  onAbort: () => void;
  onStartGame: () => void;
  onTogglePause: () => void;
  onTogglePeek: () => void;
}

const STAGE_THEMES = [
  "bg-gradient-to-br from-slate-900 via-blue-950 to-black",
  "bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-black",
  "bg-gradient-to-br from-[#2e1065] via-[#4c1d95] to-[#0f172a]",
  "bg-gradient-to-br from-[#0e7490] via-[#0369a1] to-[#1e3a8a]",
  "bg-gradient-to-br from-[#c2410c] via-[#be185d] to-[#4c1d95]",
  "bg-gradient-to-br from-black via-[#312e81] to-black",
];

export const GameScreen: React.FC<GameScreenProps> = ({
  config,
  gameState,
  feedback,
  onAnswer,
  onAbort,
  onStartGame,
  onTogglePause,
  onTogglePeek,
}) => {
  const isRugged = config.uiMode === "RUGGED";
  const { playRankSound, playPass, playCount, playGo } = useSound(
    config.isSoundEnabled
  );

  const [showStageClear, setShowStageClear] = useState(false);
  useEffect(() => {
    if (gameState.lastStageClear > 0) {
      setShowStageClear(true);
      const t = setTimeout(() => setShowStageClear(false), 2000);
      return () => clearTimeout(t);
    }
  }, [gameState.lastStageClear]);

  const [count, setCount] = useState(3);
  useEffect(() => {
    if (gameState.status === "COUNTDOWN") {
      setCount(3);
      if (!isRugged) playCount?.();
      else playCount?.();
      const timer = setInterval(() => setCount((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [gameState.status, playCount, isRugged]);

  useEffect(() => {
    if (gameState.status !== "COUNTDOWN") return;
    if (count > 0 && count < 3) playCount?.();
    if (count === 0) {
      playGo?.();
      onStartGame();
    }
  }, [count, gameState.status, playCount, playGo, onStartGame]);

  useEffect(() => {
    const volume = gameState.isRecoveryTurn ? 0.8 : 1.0;
    if (feedback?.type === "CORRECT" && feedback.rank) {
      playRankSound?.(feedback.rank, volume);
    } else if (feedback?.type === "CORRECT") {
      playRankSound?.("GOOD", volume);
    } else if (feedback?.type === "MISS" || feedback?.type === "TIME_UP") {
      playPass?.(volume);
    }
  }, [feedback, playRankSound, playPass, gameState.isRecoveryTurn]);

  const currentTheme = isRugged
    ? "bg-white text-black font-mono"
    : STAGE_THEMES[Math.min(gameState.stage, STAGE_THEMES.length - 1)] +
      " text-white font-sans transition-colors duration-[2000ms]";

  const showTutorial =
    gameState.difficulty === "STARTER" && gameState.questionCount === 1;
  const canInteract =
    gameState.status === "INPUT" ||
    gameState.status === "PAUSED" ||
    gameState.status === "PEEK";
  const isPractice = gameState.difficulty === "PRACTICE";

  return (
    <div
      className={cn(
        "h-dvh w-full flex flex-col items-center relative overflow-hidden transition-all",
        currentTheme
      )}
    >
      {/* Header Info */}
      <div className="w-full max-w-md flex-none pt-4 px-4 pb-2 z-10 space-y-2">
        <div className="space-y-2">
          <div className="flex justify-between items-end px-2">
            <div className="text-xs font-bold opacity-60">SCORE</div>
            {isPractice ? (
              <div className="text-sm font-bold text-green-400 tracking-widest border border-green-500/30 px-2 py-1 rounded shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                PRACTICE MODE
              </div>
            ) : (
              <div className="text-3xl sm:text-4xl font-black tabular-nums leading-none">
                {gameState.score}
              </div>
            )}
          </div>

          <div className="relative w-full h-4 sm:h-6 bg-gray-700 rounded-full overflow-hidden border-2 border-gray-600">
            <div
              className={cn(
                "h-full transition-all duration-300 ease-out",
                gameState.clearGauge > 50
                  ? "bg-green-500"
                  : gameState.clearGauge > 20
                  ? "bg-yellow-500"
                  : "bg-red-500"
              )}
              style={{ width: `${gameState.clearGauge}%` }}
            />
            {!isRugged && (
              <div className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white shadow-black drop-shadow-md">
                LIFE
              </div>
            )}
          </div>
        </div>

        <div className="h-6 flex justify-between items-center px-2">
          <div
            className={cn(
              "text-lg sm:text-xl font-black italic",
              isRugged ? "text-black" : "text-yellow-400"
            )}
          >
            {gameState.combo > 1 && `${gameState.combo} COMBO!`}
          </div>
          {!isRugged && (
            <div className="text-[10px] sm:text-xs font-bold opacity-70 tracking-widest border border-white/20 px-2 py-0.5 rounded">
              STAGE {gameState.stage}
            </div>
          )}
        </div>
      </div>

      {/* Main Area */}
      <div className="w-full max-w-md flex-1 flex flex-col justify-evenly items-center relative z-10 px-4 min-h-0">
        {/* Number Panel Area */}
        <div className="w-full h-[30vh] max-h-64 relative flex flex-col justify-end">
          {/* Feedback Area */}
          <div className="absolute -top-24 left-0 w-full flex flex-col justify-end items-center h-24 z-30 pointer-events-none space-y-2">
            {!isRugged && showStageClear && (
              <div className="animate-in fade-in zoom-in duration-300 flex flex-col items-center">
                <div className="text-3xl sm:text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,1)] tracking-tighter">
                  STAGE CLEAR
                </div>
                <div className="text-xs sm:text-sm font-bold tracking-[0.3em] text-cyan-300 mt-1">
                  NEXT AREA
                </div>
              </div>
            )}

            {feedback &&
              !showStageClear &&
              (isRugged || feedback.type !== "CORRECT" ? (
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "text-5xl sm:text-6xl font-black animate-ping-once opacity-0 transform scale-50",
                      feedback.type === "CORRECT"
                        ? "text-green-500"
                        : "text-red-500"
                    )}
                  >
                    {feedback.msg}
                  </span>
                  {!isRugged && feedback.subMsg && (
                    <div className="text-sm font-light text-white/70 mt-1 animate-in fade-in duration-500">
                      {feedback.subMsg}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "text-5xl sm:text-7xl font-black italic tracking-tighter animate-ping-once opacity-0 transform scale-50 drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]",
                      feedback.rank === "EXCELLENT"
                        ? "text-yellow-400 scale-125"
                        : feedback.rank === "GREAT"
                        ? "text-cyan-400"
                        : "text-white"
                    )}
                  >
                    {feedback.rank}!!
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-white/80 mt-1 animate-pulse">
                    {feedback.msg}
                  </div>
                  {!isRugged && feedback.subMsg && (
                    <div className="text-sm font-light text-white/80 mt-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      {feedback.subMsg}
                    </div>
                  )}
                </div>
              ))}
          </div>

          <div className="flex-1 w-full relative">
            <NumberPanel
              formula={gameState.currentFormula}
              value={gameState.displayValue}
              status={gameState.status}
              uiMode={config.uiMode}
              isTutorial={gameState.isTutorial}
              questionCount={gameState.questionCount} // ★ 追加: 進行度を渡す
            />

            {/* カウントダウン表示 (パネルの下に配置、テキスト削除) */}
            {gameState.status === "COUNTDOWN" && (
              <div className="absolute top-full left-0 w-full flex flex-col items-center pt-4 z-40">
                {/* ★ ここにあった「ここに出るよ」を削除 */}
                <div
                  className={cn(
                    "text-6xl sm:text-7xl font-black",
                    !isRugged &&
                      "animate-bounce drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]",
                    isRugged ? "text-black" : "text-white"
                  )}
                >
                  {count > 0 ? count : "GO!"}
                </div>
              </div>
            )}

            {/* Tutorial Overlays */}
            {showTutorial &&
              !gameState.isTutorial &&
              gameState.status === "FLASH" && (
                <div
                  className={cn(
                    "absolute top-0 -mt-8 sm:-mt-12 w-full text-center font-bold text-sm sm:text-lg",
                    !isRugged &&
                      "animate-bounce drop-shadow-md text-yellow-400",
                    isRugged && "text-black"
                  )}
                >
                  Remember the answer!
                </div>
              )}
            {showTutorial &&
              !gameState.isTutorial &&
              gameState.status === "INPUT" && (
                <div
                  className={cn(
                    "absolute top-0 -mt-8 sm:-mt-12 w-full text-center font-bold text-sm sm:text-lg",
                    !isRugged && "animate-pulse drop-shadow-md text-cyan-400",
                    isRugged && "text-black"
                  )}
                >
                  Is this Number HIGH or LOW?
                </div>
              )}
          </div>
        </div>

        {/* Keypad Area */}
        <div className="w-full h-[25vh] max-h-56">
          <Keypad
            uiMode={config.uiMode}
            onInput={onAnswer}
            disabled={
              gameState.status !== "INPUT" && gameState.status !== "PEEK"
            }
            highlightType={
              gameState.isTutorial && gameState.status === "INPUT"
                ? gameState.correctType
                : undefined
            }
          />
        </div>
      </div>

      {/* Footer */}
      <div className="w-full flex-none z-10 pb-4 sm:pb-6">
        {!isRugged && (
          <div className="w-full mb-4">
            <ProgressionLane
              distance={gameState.stageProgress}
              isMoving={feedback?.type === "CORRECT"}
            />
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex justify-between items-center px-6 max-w-md mx-auto">
          {/* ABORT */}
          <button
            onClick={onAbort}
            className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold opacity-50 hover:opacity-100 transition-opacity w-12"
          >
            <Home size={20} />
            <span>EXIT</span>
          </button>

          {/* PAUSE */}
          <button
            onClick={onTogglePause}
            disabled={!canInteract}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all w-12",
              canInteract
                ? "opacity-80 hover:opacity-100"
                : "opacity-0 pointer-events-none",
              gameState.status === "PAUSED" && "text-yellow-500 opacity-100"
            )}
          >
            {gameState.status === "PAUSED" ? (
              <Play size={20} />
            ) : (
              <Pause size={20} />
            )}
            <span>{gameState.status === "PAUSED" ? "RESUME" : "PAUSE"}</span>
          </button>

          {/* CHECK/PEEK (Only for PRACTICE) */}
          {isPractice ? (
            <button
              onClick={onTogglePeek}
              disabled={!canInteract}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all w-12",
                canInteract
                  ? "opacity-80 hover:opacity-100"
                  : "opacity-0 pointer-events-none",
                gameState.status === "PEEK"
                  ? "text-green-400 opacity-100"
                  : "text-green-600/80"
              )}
            >
              {gameState.status === "PEEK" ? (
                <Play size={20} />
              ) : (
                <RotateCcw size={20} />
              )}
              <span>{gameState.status === "PEEK" ? "BACK" : "CHECK"}</span>
            </button>
          ) : (
            <div className="w-12" />
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes ping-once {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          40% {
            transform: scale(1.1);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        .animate-ping-once {
          animation: ping-once 0.6s cubic-bezier(0, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};

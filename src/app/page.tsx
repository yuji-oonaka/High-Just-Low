// src/app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { GameConfig } from "@/types";
import { useGameEngine } from "@/hooks/useGameEngine";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { GameScreen } from "@/components/screens/GameScreen";
import { ResultScreen } from "@/components/screens/ResultScreen";

export default function Page() {
  // ★ 修正: デフォルトを LUXURY に変更
  const [config, setConfig] = useState<GameConfig>({
    difficulty: "NORMAL",
    uiMode: "LUXURY",
    isSoundEnabled: true,
  });

  const {
    gameState,
    feedback,
    initGame,
    startGame,
    exitGame,
    handleAnswer,
    setDifficulty,
    togglePause,
    togglePeek,
  } = useGameEngine(config.isSoundEnabled, config.uiMode);

  useEffect(() => {
    setDifficulty(config.difficulty);
  }, [config.difficulty, setDifficulty]);

  if (gameState.status === "IDLE") {
    return (
      <HomeScreen
        config={config}
        setConfig={setConfig}
        highScore={gameState.highScore}
        onStart={() => initGame(config.difficulty)}
      />
    );
  }

  if (gameState.status === "GAMEOVER") {
    return (
      <ResultScreen
        gameState={gameState}
        uiMode={config.uiMode}
        onRetry={() => initGame(config.difficulty)}
        onHome={exitGame}
      />
    );
  }

  return (
    <GameScreen
      config={config}
      gameState={gameState}
      feedback={feedback}
      onAnswer={handleAnswer}
      onAbort={exitGame}
      onStartGame={startGame}
      onTogglePause={togglePause}
      onTogglePeek={togglePeek}
    />
  );
}

// src/hooks/useGameEngine.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Difficulty, FeedbackState, AnswerType, UIMode, FeedbackRank, HistoryItem } from '@/types';
import { generateProblem, getCommentary } from '@/lib/gameLogic';
import { getHighScore, saveHighScore } from '@/lib/storage';

const GAUGE_MAX = 100;

// ★ 修正: 150 -> 250 (CSSのduration-200より長くして、完全に消えてから次を出す)
const ENTRY_GAP = 250; 

const BASE_SETTINGS = {
  PRACTICE:{ flash: 800,  gap: 200, limit: 99999, damage: 0, heal: 20 },
  STARTER: { flash: 1500, gap: 500, limit: 4000, damage: 5,  heal: 15 },
  EASY:    { flash: 1200, gap: 300, limit: 3000, damage: 8,  heal: 10 },
  NORMAL:  { flash: 800,  gap: 200, limit: 2000, damage: 12, heal: 8 },
  HARD:    { flash: 600,  gap: 150, limit: 1500, damage: 18, heal: 6 },
  EXTREME: { flash: 400,  gap: 100, limit: 1200, damage: 25, heal: 5 },
};

export const useGameEngine = (soundEnabled: boolean, uiMode: UIMode) => {
  const [gameState, setGameState] = useState<GameState>({
    status: 'IDLE',
    score: 0,
    highScore: 0,
    combo: 0,
    maxCombo: 0,
    clearGauge: 60,
    difficulty: 'NORMAL',
    currentFormula: "",
    targetValue: 0,
    displayValue: 0,
    correctType: 'JUST',
    questionCount: 0,
    stage: 1,
    stageProgress: 0,
    lastStageClear: 0,
    tempoOffset: 0,
    isRecoveryTurn: false,
    history: [],
    isTutorial: false,
  });
  
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const inputStartTimeRef = useRef<number>(0);
  const pauseStartTimeRef = useRef<number>(0);

  useEffect(() => {
    setGameState(prev => ({ ...prev, highScore: getHighScore() }));
  }, []);

  useEffect(() => {
    if (gameState.difficulty === 'PRACTICE') return;
    if (gameState.score > gameState.highScore) {
      saveHighScore(gameState.score);
      setGameState(prev => ({ ...prev, highScore: prev.score }));
    }
  }, [gameState.score, gameState.highScore, gameState.difficulty]);

  useEffect(() => {
    if (gameState.status !== 'INPUT') return;

    const settings = BASE_SETTINGS[gameState.difficulty];
    const timeAlreadyElapsed = Date.now() - inputStartTimeRef.current;
    const remainingTime = settings.limit - timeAlreadyElapsed;

    if (remainingTime > 80000 || gameState.isTutorial) return;

    if (remainingTime <= 0) {
       handleAnswer('MISS_TIMEOUT');
       return;
    }

    const timeoutId = setTimeout(() => {
      handleAnswer('MISS_TIMEOUT');
    }, remainingTime);

    return () => clearTimeout(timeoutId);
  }, [gameState.status, gameState.currentFormula, gameState.difficulty, gameState.isTutorial]);

  const nextProblem = useCallback((diff: Difficulty) => {
    const prob = generateProblem(diff);
    const base = BASE_SETTINGS[diff];

    setGameState(prev => {
        // 遅延後にデータを更新してFLASHを開始
        setTimeout(() => {
            setGameState(curr => {
                if (curr.status !== 'GAP') return curr;

                const nextQCount = curr.questionCount + 1;
                const isTutorialTurn = diff === 'PRACTICE' && curr.questionCount === 0;
                const isSecondTurn = diff === 'PRACTICE' && curr.questionCount === 1;
                const isWarmupTurn = diff === 'PRACTICE' && curr.questionCount === 2;

                const recoveryBonus = curr.isRecoveryTurn ? 100 : 0;
                let currentFlash = Math.max(200, base.flash + curr.tempoOffset + recoveryBonus);
                let currentGap = Math.max(50, base.gap + (curr.tempoOffset * 0.5));

                if (diff === 'STARTER' && curr.questionCount === 0) {
                    currentFlash += 800;
                    currentGap += 500;
                }

                if (diff === 'PRACTICE') {
                    if (isTutorialTurn) {
                        currentFlash = 4000;
                        currentGap = 1000;
                    } else if (isSecondTurn) {
                        currentFlash = 2000;
                        currentGap = 500;
                    } else if (isWarmupTurn) {
                        currentFlash = 1200;
                        currentGap = 300;
                    }
                }

                setTimeout(() => {
                    setGameState(s => {
                        if (s.status !== 'FLASH') return s;
                        return { ...s, status: 'GAP' };
                    });

                    setTimeout(() => {
                        setGameState(s => {
                            if (s.status !== 'GAP') return s;
                            inputStartTimeRef.current = Date.now();
                            return { ...s, status: 'INPUT' };
                        });
                    }, currentGap);
                }, currentFlash);

                return {
                    ...curr,
                    status: 'FLASH',
                    currentFormula: prob.formula,
                    targetValue: prob.answer,
                    displayValue: prob.display,
                    correctType: prob.type,
                    difficulty: diff,
                    questionCount: nextQCount,
                    isTutorial: isTutorialTurn
                };
            });
        }, ENTRY_GAP); // ★ 250ms待ってからデータ更新

        // まずはGAPにして今の表示を消す（前のデータ維持）
        return {
            ...prev,
            status: 'GAP'
        };
    });
  }, []);

  const initGame = useCallback((diff: Difficulty) => {
    setGameState(prev => ({
      ...prev,
      status: 'COUNTDOWN',
      score: 0,
      combo: 0,
      clearGauge: 60,
      difficulty: diff,
      questionCount: 0,
      stage: 1,
      stageProgress: 0,
      lastStageClear: 0,
      tempoOffset: 0,
      isRecoveryTurn: false,
      history: [],
      isTutorial: false,
    }));
    setFeedback(null);
    inputStartTimeRef.current = 0;
  }, []);

  const startGame = useCallback(() => {
    nextProblem(gameState.difficulty);
  }, [gameState.difficulty, nextProblem]);

  const exitGame = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'IDLE' }));
  }, []);

  const togglePause = useCallback(() => {
    setGameState(prev => {
      if (prev.status === 'PAUSED') {
        const now = Date.now();
        const pausedDuration = now - pauseStartTimeRef.current;
        inputStartTimeRef.current += pausedDuration;
        return { ...prev, status: 'INPUT' };
      } else if (prev.status === 'INPUT') {
        pauseStartTimeRef.current = Date.now();
        return { ...prev, status: 'PAUSED' };
      }
      return prev;
    });
  }, []);

  const togglePeek = useCallback(() => {
    setGameState(prev => {
      if (prev.difficulty !== 'PRACTICE') return prev;
      if (prev.status === 'PEEK') {
        const now = Date.now();
        const pausedDuration = now - pauseStartTimeRef.current;
        inputStartTimeRef.current += pausedDuration;
        return { ...prev, status: 'INPUT' };
      } else if (prev.status === 'INPUT') {
        pauseStartTimeRef.current = Date.now();
        return { ...prev, status: 'PEEK' };
      }
      return prev;
    });
  }, []);

  const handleAnswer = useCallback((playerAns: AnswerType | 'MISS_TIMEOUT') => {
    if (gameState.status !== 'INPUT' && playerAns !== 'MISS_TIMEOUT') return;
    
    const settings = BASE_SETTINGS[gameState.difficulty];
    const isCorrect = playerAns === gameState.correctType;
    const now = Date.now();
    const elapsed = now - inputStartTimeRef.current;
    
    const comboBonus = Math.min(gameState.combo * 0.02, 0.4); 
    const excellentThreshold = Math.max(0.2, 0.6 - comboBonus);
    const greatThreshold = Math.max(0.1, 0.3 - (comboBonus / 2));
    const remainingRatio = Math.max(0, 1 - (elapsed / settings.limit));
    let rank: FeedbackRank = 'GOOD';
    if (remainingRatio > excellentThreshold) rank = 'EXCELLENT';
    else if (remainingRatio > greatThreshold) rank = 'GREAT';

    const historyItem: HistoryItem = {
      formula: gameState.currentFormula,
      answer: gameState.targetValue,
      display: gameState.displayValue,
      correctType: gameState.correctType,
      playerAns: playerAns,
      isCorrect: isCorrect
    };

    let nextGauge = gameState.clearGauge;
    let nextScore = gameState.score;
    let nextCombo = gameState.combo;
    let nextMaxCombo = gameState.maxCombo;
    let nextTempoOffset = gameState.tempoOffset;
    let nextIsRecovery = false;
    let nextStage = gameState.stage;
    let nextProgress = gameState.stageProgress;
    let nextStageClear = gameState.lastStageClear;
    let isGameOver = false;

    if (isCorrect) {
       nextGauge = Math.min(GAUGE_MAX, nextGauge + settings.heal);
       nextCombo += 1;
       nextMaxCombo = Math.max(nextMaxCombo, nextCombo);
       nextScore += 100 + (gameState.combo * 10);
       nextTempoOffset = Math.max(nextTempoOffset - 50, -200);
       nextIsRecovery = false;

       const progressStep = rank === 'EXCELLENT' ? 20 : 10;
       nextProgress += progressStep;
       if (nextProgress >= 100) {
           nextProgress = 0;
           nextStage += 1;
           nextStageClear = gameState.stage;
       }

    } else {
       const damage = playerAns === 'MISS_TIMEOUT' ? settings.damage + 5 : settings.damage;
       nextGauge = nextGauge - damage;
       nextCombo = 0;
       nextTempoOffset = Math.min(nextTempoOffset + 150, 300);
       nextIsRecovery = true;
       
       if (nextGauge <= 0) {
           nextGauge = 0;
           isGameOver = true;
       }
    }

    let subMsg = "";
    if (gameState.isTutorial && isCorrect) {
        subMsg = "今の感覚でOK！";
    } else if (uiMode === 'LUXURY') {
        subMsg = getCommentary(
            isCorrect ? 'CORRECT' : (playerAns === 'MISS_TIMEOUT' ? 'TIME_UP' : 'MISS'),
            rank,
            gameState.correctType === 'JUST'
        );
    }

    setFeedback({ 
        type: isCorrect ? 'CORRECT' : (playerAns === 'MISS_TIMEOUT' ? 'TIME_UP' : 'MISS'), 
        rank: isCorrect ? rank : undefined,
        msg: isCorrect ? gameState.correctType : 'MISS',
        subMsg
    });

    const isTutorialJustFinished = gameState.isTutorial;

    setGameState(prev => ({
        ...prev,
        score: nextScore,
        combo: nextCombo,
        maxCombo: nextMaxCombo,
        clearGauge: nextGauge,
        status: isGameOver ? 'GAMEOVER' : (isTutorialJustFinished ? 'TUTORIAL_BRIDGE' : prev.status),
        stage: nextStage,
        stageProgress: nextProgress,
        lastStageClear: nextStageClear,
        tempoOffset: nextTempoOffset,
        isRecoveryTurn: nextIsRecovery,
        history: [...prev.history, historyItem],
        isTutorial: false
    }));

    if (!isGameOver) {
        const nextDelay = isTutorialJustFinished ? 1500 : (isCorrect ? 200 : 500);
        setTimeout(() => {
            setFeedback(null);
            nextProblem(gameState.difficulty);
        }, nextDelay);
    }

  }, [gameState, nextProblem, uiMode]);

  const setDifficulty = useCallback((diff: Difficulty) => {
    setGameState(prev => ({ ...prev, difficulty: diff }));
  }, []);

  return {
    gameState,
    feedback,
    initGame,
    startGame,
    exitGame,
    handleAnswer,
    setDifficulty,
    togglePause,
    togglePeek
  };
};
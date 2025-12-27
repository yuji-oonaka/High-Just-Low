// src/types/index.ts

export type Difficulty = 'PRACTICE' | 'STARTER' | 'EASY' | 'NORMAL' | 'HARD' | 'EXTREME';
export type UIMode = 'RUGGED' | 'LUXURY';
// ★ TUTORIAL_BRIDGE を追加
export type GameStatus = 'IDLE' | 'COUNTDOWN' | 'PAUSED' | 'PEEK' | 'FLASH' | 'GAP' | 'INPUT' | 'RESULT' | 'GAMEOVER' | 'TUTORIAL_BRIDGE';
export type AnswerType = 'HIGH' | 'JUST' | 'LOW';
export type FeedbackRank = 'EXCELLENT' | 'GREAT' | 'GOOD';

export interface HistoryItem {
  formula: string;
  answer: number;
  display: number;
  correctType: AnswerType;
  playerAns: AnswerType | 'MISS_TIMEOUT';
  isCorrect: boolean;
}

export interface GameConfig {
  difficulty: Difficulty;
  uiMode: UIMode;
  isSoundEnabled: boolean;
}

export interface GameState {
  status: GameStatus;
  score: number;
  highScore: number;
  combo: number;
  maxCombo: number;
  clearGauge: number;
  difficulty: Difficulty;
  
  currentFormula: string;
  targetValue: number;
  displayValue: number;
  correctType: AnswerType;
  
  questionCount: number;
  
  stage: number;
  stageProgress: number;
  lastStageClear: number;

  tempoOffset: number;
  isRecoveryTurn: boolean;

  history: HistoryItem[];

  isTutorial: boolean;
}

export interface FeedbackState {
  type: 'CORRECT' | 'MISS' | 'TIME_UP' | 'STAGE_CLEAR';
  rank?: FeedbackRank;
  msg: string;
  subMsg?: string;
}
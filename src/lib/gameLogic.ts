// src/lib/gameLogic.ts
import { Difficulty, AnswerType, FeedbackRank } from '@/types';

interface Problem {
  formula: string;
  answer: number;
  display: number;
  type: AnswerType;
}

// ... (既存のSETTINGS, randomInt, generateProblem はそのまま維持) ...
const SETTINGS = {
  PRACTICE: { min: 20, max: 90, terms: 2, diffRange: [5, 15], justRate: 0.3 },
  STARTER: { min: 10, max: 30, terms: 2, diffRange: [10, 20], justRate: 0.4 },
  EASY: { min: 10, max: 50, terms: 2, diffRange: [10, 20], justRate: 0.4 },
  NORMAL: { min: 20, max: 90, terms: 2, diffRange: [5, 15], justRate: 0.3 },
  HARD: { min: 100, max: 500, terms: 2, diffRange: [2, 10], justRate: 0.2 },
  EXTREME: { min: 100, max: 999, terms: 3, diffRange: [1, 5], justRate: 0.15 }
};

const randomInt = (min: number, max: number) => 
  Math.floor(Math.random() * (max - min + 1)) + min;

export const generateProblem = (difficulty: Difficulty): Problem => {
  const setting = SETTINGS[difficulty];
  const nums: number[] = [];
  
  for (let i = 0; i < setting.terms; i++) {
    nums.push(randomInt(setting.min, setting.max));
  }
  
  const answer = nums.reduce((a, b) => a + b, 0);
  const formula = nums.join(' + ');

  const rand = Math.random();
  let type: AnswerType;
  
  if (rand < setting.justRate) {
    type = 'JUST';
  } else {
    type = Math.random() < 0.5 ? 'HIGH' : 'LOW';
  }

  let display = answer;

  if (type !== 'JUST') {
    const diff = randomInt(setting.diffRange[0], setting.diffRange[1]);
    
    if (type === 'HIGH') {
      display = answer + diff; 
    } else {
      display = answer - diff; 
    }
  }

  return { formula, answer, display, type };
};

// ★ ここから下を追加：コメンタリーロジック

const COMMENTS = {
  EXCELLENT: ["今の、速い", "判断が早い", "ノってる", "いい流れ"],
  GOOD: ["いい判断", "その調子", "問題なし", "安定してる"], // GREAT/GOOD兼用
  JUST: ["見えてたね", "今のは分かる", "落ち着いてた"],
  MISS: ["ドンマイ", "切り替えよ", "一回リセット", "落ち着こ", "まだいける", "次で戻せる"],
  TIMEOUT: ["ちょっと早かった", "今のは流れた", "判断前だったね"],
  CLEAR: ["ここまでOK", "いいペース", "一旦ここまで"]
};

// ランダムに取得するヘルパー
const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export const getCommentary = (
  type: 'CORRECT' | 'MISS' | 'TIME_UP' | 'STAGE_CLEAR',
  rank?: FeedbackRank,
  isJust?: boolean
): string => {
  if (type === 'STAGE_CLEAR') return pick(COMMENTS.CLEAR);
  if (type === 'TIME_UP') return pick(COMMENTS.TIMEOUT);
  if (type === 'MISS') return pick(COMMENTS.MISS);

  if (type === 'CORRECT') {
    if (isJust) return pick(COMMENTS.JUST);
    if (rank === 'EXCELLENT') return pick(COMMENTS.EXCELLENT);
    return pick(COMMENTS.GOOD);
  }

  return "";
};
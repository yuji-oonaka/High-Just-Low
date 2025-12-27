// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// クラス名の結合ユーティリティ
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 漢数字・全角数字・ひらがな読みを半角数字に変換するパーサー（今回は未使用だがエラー防止のため残す）
export const parseVoiceInput = (text: string): number | 'PASS' | null => {
  if (!text) return null;
  let str = text.trim();

  if (/パス|スキップ|次|next|skip/gi.test(str)) {
    return 'PASS';
  }

  const kanjiMap: { [key: string]: number } = {
    '〇':0, '一':1, '二':2, '三':3, '四':4, '五':5, '六':6, '七':7, '八':8, '九':9,
    '０':0, '１':1, '２':2, '３':3, '４':4, '５':5, '６':6, '７':7, '８':8, '９':9
  };
  
  str = str.split('').map(char => kanjiMap[char] !== undefined ? kanjiMap[char] : char).join('');
  str = str.replace(/[^0-9]/g, "");

  if (str === "") return null;
  
  const num = parseInt(str, 10);
  return isNaN(num) ? null : num;
};
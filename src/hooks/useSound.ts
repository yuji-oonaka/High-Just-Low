// src/hooks/useSound.ts
import { useCallback, useRef, useEffect } from 'react';
import { FeedbackRank } from '@/types';

export const useSound = (enabled: boolean = true) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current = new AudioContext();
      }
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playTone = useCallback((freq: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
    if (!enabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, [enabled]);

  // ★ volumeScale 引数を追加 (デフォルト 1.0)
  const playRankSound = useCallback((rank: FeedbackRank, volumeScale: number = 1.0) => {
    if (!enabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    // 全体の音量をスケール
    const baseVol = volumeScale;

    if (rank === 'EXCELLENT') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.1);
      gain.gain.setValueAtTime(0.3 * baseVol, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
      
      const bass = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bass.type = 'sine';
      bass.frequency.setValueAtTime(100, t);
      bass.frequency.linearRampToValueAtTime(50, t + 0.3);
      bassGain.gain.setValueAtTime(0.5 * baseVol, t);
      bassGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      bass.connect(bassGain);
      bassGain.connect(ctx.destination);
      bass.start();
      bass.stop(t + 0.3);

      osc.start();
      osc.stop(t + 0.4);

    } else if (rank === 'GREAT') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
      gain.gain.setValueAtTime(0.15 * baseVol, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
      osc.start();
      osc.stop(t + 0.2);

    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      gain.gain.setValueAtTime(0.1 * baseVol, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      osc.start();
      osc.stop(t + 0.1);
    }
  }, [enabled]);

  // 互換性維持 + Pass音の音量調整対応
  const playPass = useCallback((volumeScale: number = 1.0) => playTone(300, 'triangle', 0.2, 0.2 * volumeScale), [playTone]);
  const playCount = useCallback(() => playTone(800, 'sine', 0.1, 0.2), [playTone]);
  const playGo = useCallback(() => playTone(1600, 'square', 0.4, 0.2), [playTone]);

  return { playRankSound, playPass, playCount, playGo };
};
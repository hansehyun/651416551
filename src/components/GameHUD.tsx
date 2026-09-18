import React from 'react';
import { Volume2, VolumeX, Trophy, Pause, Play, Shield, Zap, Clock, Sparkles } from 'lucide-react';

interface GameHUDProps {
  score: number;
  combo: number;
  level: number;
  shards: number;
  shieldActive: boolean;
  blasterTime: number;
  timewarpTime: number;
  isMuted: boolean;
  isPaused: boolean;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onOpenLeaderboard: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  combo,
  level,
  shards,
  shieldActive,
  blasterTime,
  timewarpTime,
  isMuted,
  isPaused,
  onToggleMute,
  onTogglePause,
  onOpenLeaderboard,
}) => {
  return (
    <div
      id="game-hud"
      className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-2 p-3 sm:p-5 select-none"
    >
      {/* 최상단 상태 바 */}
      <div className="flex items-center justify-between gap-3">
        {/* 점수 및 레벨 */}
        <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-cyan-500/40 bg-neutral-950/80 px-4 py-2 backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <div>
            <div className="font-cyber text-[10px] tracking-widest text-cyan-400 uppercase">SCORE</div>
            <div className="font-cyber text-xl sm:text-2xl font-black text-cyan-100 tracking-wider">
              {score.toLocaleString()}
            </div>
          </div>

          <div className="h-7 w-px bg-cyan-500/30" />

          <div>
            <div className="font-cyber text-[10px] tracking-widest text-purple-400 uppercase">WARP</div>
            <div className="font-cyber text-sm sm:text-base font-bold text-purple-200">
              LV.{level}
            </div>
          </div>

          {/* 콤보 배율 */}
          {combo > 1 && (
            <div className="animate-pulse rounded-lg border border-pink-500/60 bg-pink-950/50 px-2 py-0.5 text-center">
              <span className="font-cyber text-xs sm:text-sm font-black text-pink-300">
                x{combo}
              </span>
            </div>
          )}
        </div>

        {/* 상단 우측 컨트롤 버튼들 */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* 수집한 에너지 샤드 카운터 */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-neutral-950/80 px-3 py-2 text-xs font-bold text-cyan-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-cyber">{shards}</span>
          </div>

          {/* 리더보드 버튼 */}
          <button
            id="hud-leaderboard-btn"
            onClick={onOpenLeaderboard}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-yellow-500/50 bg-neutral-950/80 px-3 text-xs font-bold text-yellow-300 backdrop-blur-md transition-all hover:bg-yellow-500/20 hover:shadow-[0_0_15px_rgba(234,179,8,0.3)] active:scale-95"
            aria-label="명예의 전당 보기"
          >
            <Trophy className="h-4 w-4" />
            <span className="font-cyber hidden sm:inline">RANK</span>
          </button>

          {/* 일시정지 버튼 */}
          <button
            id="hud-pause-btn"
            onClick={onTogglePause}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/40 bg-neutral-950/80 text-cyan-300 backdrop-blur-md transition-all hover:bg-cyan-500/20 active:scale-95"
            aria-label={isPaused ? '계속하기' : '일시정지'}
          >
            {isPaused ? <Play className="h-4 w-4 fill-current" /> : <Pause className="h-4 w-4" />}
          </button>

          {/* 오디오 토글 버튼 */}
          <button
            id="hud-sound-btn"
            onClick={onToggleMute}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/40 bg-neutral-950/80 text-cyan-300 backdrop-blur-md transition-all hover:bg-cyan-500/20 active:scale-95"
            aria-label={isMuted ? '음소거 해제' : '음소거'}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-neutral-500" /> : <Volume2 className="h-4 w-4 text-cyan-300" />}
          </button>
        </div>
      </div>

      {/* 활성화된 파워업 상태 표시 바 */}
      <div className="pointer-events-auto flex flex-wrap gap-2">
        {shieldActive && (
          <div className="flex items-center gap-1.5 rounded-full border border-purple-400 bg-purple-950/70 px-3 py-1 text-xs font-bold text-purple-200 backdrop-blur-md shadow-[0_0_12px_rgba(168,85,247,0.4)] animate-pulse">
            <Shield className="h-3.5 w-3.5 text-purple-300 fill-purple-400/40" />
            <span className="font-cyber text-[11px]">ENERGY SHIELD</span>
          </div>
        )}

        {blasterTime > 0 && (
          <div className="flex items-center gap-1.5 rounded-full border border-pink-400 bg-pink-950/70 px-3 py-1 text-xs font-bold text-pink-200 backdrop-blur-md shadow-[0_0_12px_rgba(255,0,128,0.4)]">
            <Zap className="h-3.5 w-3.5 text-pink-300 fill-pink-400/40 animate-bounce" />
            <span className="font-cyber text-[11px]">BLASTER {Math.ceil(blasterTime / 60)}s</span>
          </div>
        )}

        {timewarpTime > 0 && (
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-400 bg-emerald-950/70 px-3 py-1 text-xs font-bold text-emerald-200 backdrop-blur-md shadow-[0_0_12px_rgba(16,185,129,0.4)]">
            <Clock className="h-3.5 w-3.5 text-emerald-300 animate-spin" />
            <span className="font-cyber text-[11px]">TIME WARP {Math.ceil(timewarpTime / 60)}s</span>
          </div>
        )}
      </div>
    </div>
  );
};

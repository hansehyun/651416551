import React from 'react';
import { Play, Trophy, Rocket, Shield, Zap, Sparkles, Compass } from 'lucide-react';

interface StartMenuProps {
  onStartGame: () => void;
  onOpenLeaderboard: () => void;
  topScore: number;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  onStartGame,
  onOpenLeaderboard,
  topScore,
}) => {
  return (
    <div
      id="start-menu-overlay"
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/75 p-4 sm:p-6 backdrop-blur-md"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-cyan-500/50 bg-neutral-950/90 p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(0,240,255,0.25)]">
        {/* 네온 모서리 라인 */}
        <div className="absolute top-0 left-0 h-6 w-6 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-0 right-0 h-6 w-6 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-cyan-400" />

        {/* 뱃지 */}
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-950/50 px-3 py-1 text-xs font-bold text-cyan-300">
          <Compass className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
          <span className="font-cyber tracking-widest uppercase">RETRO ARCADE SIMULATOR</span>
        </div>

        {/* 타이틀 */}
        <h1 className="font-cyber text-3xl sm:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 [text-shadow:0_0_30px_rgba(0,240,255,0.5)] uppercase">
          NEON SPACE DODGER
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-neutral-300 font-medium">
          소행성을 회피하고 네온 크리스탈을 수집하여 은하계 최고 기록에 도전하세요
        </p>

        {/* 최고 점수 배너 */}
        {topScore > 0 && (
          <div className="my-4 inline-flex items-center gap-2 rounded-xl border border-yellow-500/40 bg-yellow-950/30 px-4 py-2 text-xs font-bold text-yellow-300">
            <Trophy className="h-4 w-4 text-yellow-400" />
            <span className="font-cyber">ALL-TIME BEST: {topScore.toLocaleString()}</span>
          </div>
        )}

        {/* 게임 가이드 그리드 */}
        <div className="my-6 grid grid-cols-2 sm:grid-cols-4 gap-2 text-left text-xs">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-2.5">
            <Rocket className="h-4 w-4 text-cyan-400 mb-1" />
            <div className="font-cyber text-[11px] font-bold text-neutral-200">조작 방식</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">마우스 / 터치 드래그 또는 방향키 (WASD)</div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-2.5">
            <Sparkles className="h-4 w-4 text-cyan-300 mb-1" />
            <div className="font-cyber text-[11px] font-bold text-neutral-200">크리스탈 샤드</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">+50점 및 최대 5배수 콤보 배율 누적</div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-2.5">
            <Shield className="h-4 w-4 text-purple-400 mb-1" />
            <div className="font-cyber text-[11px] font-bold text-neutral-200">포스 실드</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">소행성 1회 충돌 방어 및 충격 흡수</div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-2.5">
            <Zap className="h-4 w-4 text-pink-400 mb-1" />
            <div className="font-cyber text-[11px] font-bold text-neutral-200">블래스터 캐논</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">트윈 플라즈마 레이저로 소행성 파괴</div>
          </div>
        </div>

        {/* 메인 시작 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            id="start-mission-btn"
            onClick={onStartGame}
            className="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-cyan-400 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 py-3.5 font-cyber text-sm sm:text-base font-black uppercase tracking-wider text-white shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all hover:border-pink-400 hover:shadow-[0_0_35px_rgba(255,0,128,0.7)] active:scale-95"
          >
            <Play className="h-5 w-5 fill-current transition-transform group-hover:scale-110" />
            <span>LAUNCH MISSION</span>
          </button>

          <button
            id="start-leaderboard-btn"
            onClick={onOpenLeaderboard}
            className="flex items-center justify-center gap-2 rounded-xl border border-yellow-500/60 bg-neutral-900 px-5 py-3.5 font-cyber text-xs sm:text-sm font-bold tracking-wider text-yellow-300 transition-all hover:bg-yellow-500/20 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] active:scale-95"
          >
            <Trophy className="h-4 w-4" />
            <span>HALL OF FAME</span>
          </button>
        </div>
      </div>
    </div>
  );
};

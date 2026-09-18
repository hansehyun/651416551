import React, { useState } from 'react';
import { RotateCcw, Trophy, Send, CheckCircle2, Sparkles, ShieldAlert } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  level: number;
  shards: number;
  maxCombo: number;
  onRestart: () => void;
  onSubmitScore: (pilotName: string) => Promise<boolean>;
  onOpenLeaderboard: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  level,
  shards,
  maxCombo,
  onRestart,
  onSubmitScore,
  onOpenLeaderboard,
}) => {
  const [pilotName, setPilotName] = useState(() => {
    return localStorage.getItem('pilot_name') || 'CYBER_ACE';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = pilotName.trim();
    if (!trimmed || isSubmitting || isSubmitted) return;

    setIsSubmitting(true);
    localStorage.setItem('pilot_name', trimmed);
    const success = await onSubmitScore(trimmed);
    setIsSubmitting(false);
    if (success) {
      setIsSubmitted(true);
    }
  };

  return (
    <div
      id="gameover-modal"
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-pink-500/50 bg-neutral-950/95 p-6 text-center shadow-[0_0_50px_rgba(255,0,128,0.3)]">
        {/* 장식용 사이버 모서리 라인 */}
        <div className="absolute top-0 left-0 h-8 w-8 border-t-2 border-l-2 border-pink-500" />
        <div className="absolute top-0 right-0 h-8 w-8 border-t-2 border-r-2 border-pink-500" />
        <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-pink-500" />
        <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-pink-500" />

        {/* 상단 경고 뱃지 */}
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-pink-500/50 bg-pink-950/60 px-3 py-1 text-xs font-bold text-pink-400">
          <ShieldAlert className="h-3.5 w-3.5 animate-pulse text-pink-400" />
          <span className="font-cyber tracking-widest uppercase">HULL BREACH DETECTED</span>
        </div>

        <h2 className="font-cyber text-3xl sm:text-4xl font-black tracking-wider text-pink-500 [text-shadow:0_0_20px_rgba(255,0,128,0.8)] uppercase">
          GAME OVER
        </h2>

        {/* 최종 스코어 디스플레이 */}
        <div className="my-5 rounded-xl border border-cyan-500/30 bg-neutral-900/60 p-4">
          <div className="font-cyber text-xs tracking-widest text-cyan-400 uppercase">FINAL SCORE</div>
          <div className="font-cyber text-4xl sm:text-5xl font-black text-cyan-200 [text-shadow:0_0_25px_rgba(0,240,255,0.7)] my-1">
            {score.toLocaleString()}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-cyan-500/20 pt-3 text-xs">
            <div>
              <div className="text-neutral-400">WARP LVL</div>
              <div className="font-cyber text-sm font-bold text-purple-300">LV.{level}</div>
            </div>
            <div>
              <div className="text-neutral-400">SHARDS</div>
              <div className="font-cyber text-sm font-bold text-cyan-300 flex items-center justify-center gap-1">
                <Sparkles className="h-3 w-3" />
                {shards}
              </div>
            </div>
            <div>
              <div className="text-neutral-400">MAX COMBO</div>
              <div className="font-cyber text-sm font-bold text-pink-300">x{maxCombo}</div>
            </div>
          </div>
        </div>

        {/* 리더보드 등록 폼 */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="flex gap-2">
              <input
                id="pilot-name-input"
                type="text"
                maxLength={16}
                value={pilotName}
                onChange={(e) => setPilotName(e.target.value.toUpperCase())}
                placeholder="CALLSIGN (NAME)"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-yellow-500/50 bg-neutral-900 px-3.5 py-2.5 text-center font-cyber text-sm font-bold uppercase tracking-wider text-yellow-300 placeholder-neutral-600 focus:border-yellow-400 focus:outline-none focus:shadow-[0_0_15px_rgba(234,179,8,0.4)] disabled:opacity-50"
              />
              <button
                type="submit"
                id="submit-score-btn"
                disabled={!pilotName.trim() || isSubmitting}
                className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-yellow-400 bg-gradient-to-r from-yellow-500 to-amber-600 px-4 font-cyber text-xs font-black text-black transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? 'SAVING...' : 'SAVE'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-950/40 py-2.5 text-xs font-bold text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="font-cyber tracking-wider">SCORE RECORDED ON HALL OF FAME</span>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            id="restart-game-btn"
            onClick={onRestart}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-cyan-400 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 py-3 font-cyber text-sm font-black uppercase tracking-wider text-white shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all hover:shadow-[0_0_30px_rgba(255,0,128,0.6)] active:scale-95"
          >
            <RotateCcw className="h-4 w-4 stroke-[3]" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            id="view-leaderboard-btn"
            onClick={onOpenLeaderboard}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-900/80 px-4 py-3 font-cyber text-xs font-bold tracking-wider text-neutral-300 transition-all hover:border-yellow-500/50 hover:text-yellow-300 active:scale-95"
          >
            <Trophy className="h-4 w-4 text-yellow-400" />
            <span>RANKING</span>
          </button>
        </div>
      </div>
    </div>
  );
};

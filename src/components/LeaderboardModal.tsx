import React from 'react';
import { Trophy, X, Medal, Sparkles, User, RefreshCw } from 'lucide-react';
import { LeaderboardEntry } from '../types';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  scores: LeaderboardEntry[];
  isLoading: boolean;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  scores,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="leaderboard-modal"
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-yellow-500/50 bg-neutral-950/95 shadow-[0_0_50px_rgba(234,179,8,0.25)]">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between border-b border-yellow-500/30 p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-yellow-400/80 bg-yellow-500/20 text-yellow-300 shadow-[0_0_12px_rgba(234,179,8,0.4)]">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-cyber text-base sm:text-lg font-black tracking-wider text-yellow-300">
                HALL OF FAME
              </h3>
              <p className="font-mono text-[11px] text-neutral-400">GALACTIC TOP ACE PILOTS</p>
            </div>
          </div>

          <button
            id="close-leaderboard-btn"
            onClick={onClose}
            className="rounded-lg border border-neutral-800 p-2 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 스코어 리스트 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
              <RefreshCw className="h-8 w-8 animate-spin text-yellow-400 mb-2" />
              <p className="font-cyber text-xs tracking-wider text-yellow-400/80 uppercase">
                SYNCHRONIZING ORBITAL DATA...
              </p>
            </div>
          ) : scores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-500">
              <Medal className="h-10 w-10 text-neutral-600 mb-2 stroke-[1.5]" />
              <p className="font-cyber text-sm text-neutral-400">NO PILOT RECORDS YET</p>
              <p className="text-xs text-neutral-500 mt-1">Be the first ace pilot to claim rank #1!</p>
            </div>
          ) : (
            scores.map((entry, index) => {
              const isTop1 = index === 0;
              const isTop2 = index === 1;
              const isTop3 = index === 2;

              let rankBadgeColor = 'text-neutral-400 border-neutral-800 bg-neutral-900/60';
              let rowBorder = 'border-neutral-800/80 bg-neutral-900/40';

              if (isTop1) {
                rankBadgeColor = 'text-yellow-300 border-yellow-500/80 bg-yellow-950/60 shadow-[0_0_10px_rgba(234,179,8,0.4)]';
                rowBorder = 'border-yellow-500/40 bg-yellow-950/20';
              } else if (isTop2) {
                rankBadgeColor = 'text-cyan-300 border-cyan-500/80 bg-cyan-950/60 shadow-[0_0_10px_rgba(0,240,255,0.3)]';
                rowBorder = 'border-cyan-500/30 bg-cyan-950/20';
              } else if (isTop3) {
                rankBadgeColor = 'text-pink-300 border-pink-500/80 bg-pink-950/60 shadow-[0_0_10px_rgba(255,0,128,0.3)]';
                rowBorder = 'border-pink-500/30 bg-pink-950/20';
              }

              return (
                <div
                  key={entry.id || index}
                  className={`flex items-center justify-between rounded-xl border p-3 transition-all hover:bg-neutral-800/50 ${rowBorder}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-cyber text-xs font-black ${rankBadgeColor}`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-cyber text-sm font-bold text-neutral-200">
                        <User className="h-3 w-3 text-neutral-500" />
                        <span>{entry.playerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                        <span>WARP LV.{entry.level}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-cyan-400">
                          <Sparkles className="h-2.5 w-2.5" />
                          {entry.shardsCollected || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-cyber text-base font-black text-yellow-400 tracking-wider">
                      {entry.score.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      {new Date(entry.createdAt).toLocaleDateString('ko-KR', {
                        month: 'numeric',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 모달 푸터 */}
        <div className="border-t border-neutral-800 p-3 bg-neutral-900/50 text-center">
          <p className="font-mono text-[11px] text-neutral-400">
            Scores sync in real-time with Google Cloud Firestore
          </p>
        </div>
      </div>
    </div>
  );
};

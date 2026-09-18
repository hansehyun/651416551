import React from 'react';
import { CheckCircle2, Zap, Radio } from 'lucide-react';

interface TodoHeaderProps {
  totalCount: number;
  completedCount: number;
}

/**
 * TodoHeader 컴포넌트 (Cyberpunk Neon Billboard UI)
 * 
 * 시니어 팁:
 * 사이버펑크 스타일을 구현할 때는 블랙(#05060b) 베이스 위에
 * 고대비의 Cyan(#00f0ff), Neon Purple(#a855f7), Hot Pink(#ff007f)의 세 가지
 * 대표 네온 컬러를 조화롭게 배치하여 미래 도시 전광판의 발광 효과를 연출합니다.
 */
export const TodoHeader: React.FC<TodoHeaderProps> = ({ totalCount, completedCount }) => {
  // 사이버펑크 테마 날짜 포맷
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const cyberDate = `NET.SYNC // ${year}.${month}.${day}`;

  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <header className="mb-7" id="todo-header">
      {/* 상단 HUD 시리얼 및 라이브 상태 태그 */}
      <div className="mb-3 flex items-center justify-between border-b border-cyan-500/20 pb-2 text-[11px] tracking-widest text-cyan-400/80">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-cyber font-semibold tracking-widest text-cyan-300">SYS.ONLINE // PORT:2077</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-purple-400">
          <Radio className="h-3 w-3 animate-pulse text-pink-500" />
          <span>{cyberDate}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            {/* 네온 발광 아이콘 박스 */}
            <div className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-400/60 bg-cyan-950/40 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              <Zap className="h-6 w-6 stroke-[2.2] text-cyan-300 animate-pulse" />
              <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-cyan-500 to-pink-500 opacity-20 blur-xs" />
            </div>

            {/* 네온 텍스트 타이틀 */}
            <div>
              <h1 className="font-cyber text-2xl font-extrabold tracking-wider text-white drop-shadow-[0_0_8px_rgba(0,240,255,0.6)] sm:text-3xl">
                CYBER <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500">TODO</span>
              </h1>
              <p className="font-cyber text-xs tracking-wider text-purple-300/80">
                NEURAL PROTOCOL TASK TERMINAL
              </p>
            </div>
          </div>
        </div>

        {/* 진행률 네온 뱃지 */}
        <div className="flex items-center gap-2 self-start rounded-lg border border-pink-500/40 bg-pink-950/30 px-3.5 py-2 shadow-[0_0_12px_rgba(255,0,128,0.25)] sm:self-auto">
          <CheckCircle2 className="h-4 w-4 text-pink-400 animate-pulse" />
          <span className="font-cyber text-xs font-bold tracking-wider text-pink-300">
            {completedCount}/{totalCount} DONE [{progressPercent}%]
          </span>
        </div>
      </div>

      {/* 네온 그라데이션 프로그레스 바 (Cyan -> Purple -> Pink) */}
      <div className="mt-5">
        <div className="flex justify-between text-[10px] font-mono text-cyan-400/60 mb-1">
          <span>TASK_PROGRESS</span>
          <span>{progressPercent}% COMPLETE</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-sm border border-cyan-500/30 bg-neutral-950 p-[1px]">
          <div
            className="h-full rounded-xs bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 transition-all duration-500 ease-out shadow-[0_0_12px_rgba(0,240,255,0.8)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </header>
  );
};

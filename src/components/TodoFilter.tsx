import React from 'react';
import { FilterType } from '../types.ts';

interface TodoFilterProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: {
    all: number;
    active: number;
    completed: number;
  };
}

/**
 * TodoFilter 컴포넌트 (Cyberpunk Neon Tab Switcher)
 * 
 * 시니어 팁:
 * 각 탭마다 고유의 네온 시그니처 색상을 부여하여 (전체: Cyan, 진행 중: Purple, 완료: Pink)
 * 사용자가 현재 선택한 상태를 시각적으로 직관적이면서도 화려하게 인지할 수 있도록 설계합니다.
 */
const FILTER_TABS: { key: FilterType; label: string; activeClasses: string; badgeClasses: string }[] = [
  {
    key: 'all',
    label: '전체',
    activeClasses: 'border-cyan-400 bg-cyan-950/50 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)]',
    badgeClasses: 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40',
  },
  {
    key: 'active',
    label: '진행 중',
    activeClasses: 'border-purple-400 bg-purple-950/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]',
    badgeClasses: 'bg-purple-500/20 text-purple-300 border border-purple-400/40',
  },
  {
    key: 'completed',
    label: '완료',
    activeClasses: 'border-pink-500 bg-pink-950/50 text-pink-300 shadow-[0_0_15px_rgba(255,0,128,0.45)]',
    badgeClasses: 'bg-pink-500/20 text-pink-300 border border-pink-400/40',
  },
];

export const TodoFilter: React.FC<TodoFilterProps> = ({
  currentFilter,
  onFilterChange,
  counts,
}) => {
  return (
    <div
      className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-3"
      id="todo-filter-container"
    >
      {/* 탭 버튼 영역 */}
      <div className="flex gap-2 rounded-lg border border-neutral-800 bg-neutral-950/80 p-1.5 backdrop-blur-sm" role="tablist">
        {FILTER_TABS.map((tab) => {
          const isActive = currentFilter === tab.key;
          const count = counts[tab.key];

          return (
            <button
              key={tab.key}
              id={`filter-tab-${tab.key}`}
              role="tab"
              aria-selected={isActive}
              onClick={() => onFilterChange(tab.key)}
              className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-cyber font-bold tracking-wider uppercase transition-all duration-200 ${
                isActive
                  ? tab.activeClasses
                  : 'border-transparent text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900 hover:text-neutral-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                  isActive ? tab.badgeClasses : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 우측 총계 인디케이터 */}
      <div className="flex items-center gap-1.5 font-mono text-[11px] text-cyan-400/70">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
        <span>TOTAL: {counts.all} UNITS</span>
      </div>
    </div>
  );
};

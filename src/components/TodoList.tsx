import React from 'react';
import { Radio, Sparkles, Cpu } from 'lucide-react';
import { Todo, FilterType } from '../types.ts';
import { TodoItem } from './TodoItem.tsx';

interface TodoListProps {
  todos: Todo[];
  filter: FilterType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * TodoList 컴포넌트 (Cyberpunk Task Matrix)
 * 
 * 시니어 팁:
 * 빈 상태(Empty State) 디자인에서도 일관된 사이버펑크 테마를 유지하여
 * SF 게임 속 미션 인터페이스 같은 몰입감을 선사합니다.
 */
export const TodoList: React.FC<TodoListProps> = ({
  todos,
  filter,
  onToggle,
  onDelete,
}) => {
  // 할 일 목록이 비어있는 경우 빈 상태(Empty State) 안내 화면
  if (todos.length === 0) {
    let emptyMessage = '등록된 퀘스트가 없습니다. 새로운 프로토콜을 등록하세요!';
    let emptySub = 'WAITING FOR NEW TASKS // STANDBY MODE';

    if (filter === 'active') {
      emptyMessage = '진행 중인 퀘스트가 없습니다. 모든 목표를 달성하셨습니다!';
      emptySub = 'ALL ACTIVE NODES COMPLETED // EXCELLENT WORK';
    } else if (filter === 'completed') {
      emptyMessage = '완료된 퀘스트가 아직 없습니다. 첫 번째 미션을 완수해 보세요!';
      emptySub = 'NO ARCHIVED DATA FOUND // INITIALIZE PROTOCOL';
    }

    return (
      <div
        id="todo-empty-state"
        className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-cyan-500/30 bg-neutral-950/50 py-12 px-4 text-center backdrop-blur-xs"
      >
        {/* 네온 배경 블러 */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-purple-500/5 to-transparent pointer-events-none" />

        <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-cyan-400/40 bg-neutral-900 shadow-[0_0_20px_rgba(0,240,255,0.25)]">
          {filter === 'active' ? (
            <Sparkles className="h-7 w-7 text-pink-400 animate-pulse" />
          ) : filter === 'completed' ? (
            <Cpu className="h-7 w-7 text-purple-400 animate-pulse" />
          ) : (
            <Radio className="h-7 w-7 text-cyan-400 animate-pulse" />
          )}
        </div>

        <p className="mt-4 max-w-sm text-sm font-semibold text-slate-200">
          {emptyMessage}
        </p>
        <p className="mt-1 font-mono text-[11px] tracking-wider text-cyan-400/70">
          {emptySub}
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2.5" id="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};

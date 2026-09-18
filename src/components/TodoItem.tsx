import React from 'react';
import { Check, Trash2 } from 'lucide-react';
import { Todo } from '../types.ts';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * TodoItem 컴포넌트 (Cyberpunk Neon Hologram Panel)
 * 
 * 시니어 팁:
 * - 완료 상태(completed): 핫 핑크(Hot Pink) 색상의 네온 취소선(line-through)과 반투명 텍스트로 처리하여 완료 여부를 극적으로 부각합니다.
 * - 진행 중 상태: 일렉트릭 시안(Cyan) 테두리 호버 효과와 선명한 텍스트로 즉각적인 상호작용 피드백을 제공합니다.
 * - 삭제 버튼: 사이버 경고음 같은 핑크 네온 발광 효과를 주어 직관적인 UX를 완성합니다.
 */
export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  return (
    <li
      id={`todo-item-${todo.id}`}
      className={`group relative flex items-center justify-between gap-3 overflow-hidden rounded-lg border p-3.5 transition-all duration-200 ${
        todo.completed
          ? 'border-neutral-800/90 bg-neutral-950/60 text-neutral-500'
          : 'border-cyan-500/30 bg-neutral-950/80 text-neutral-100 shadow-[0_2px_10px_rgba(0,0,0,0.6)] hover:border-cyan-400/80 hover:shadow-[0_0_15px_rgba(0,240,255,0.25)]'
      }`}
    >
      {/* 좌측 사이버 데코레이션 바 */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${
          todo.completed
            ? 'bg-pink-600 shadow-[0_0_8px_#ff007f]'
            : 'bg-cyan-400 shadow-[0_0_8px_#00f0ff] group-hover:w-1.5'
        }`}
      />

      {/* 체크박스와 할 일 텍스트 영역 */}
      <div className="flex min-w-0 flex-1 items-center gap-3 pl-1">
        {/* 네온 사이버 체크박스 버튼 */}
        <button
          type="button"
          id={`todo-toggle-${todo.id}`}
          onClick={() => onToggle(todo.id)}
          aria-label={todo.completed ? '미완료로 변경' : '완료로 변경'}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all duration-200 ${
            todo.completed
              ? 'border-pink-500 bg-pink-600 text-white shadow-[0_0_10px_rgba(255,0,128,0.8)]'
              : 'border-cyan-500/60 bg-black/60 text-transparent hover:border-cyan-300 hover:shadow-[0_0_8px_rgba(0,240,255,0.6)]'
          }`}
        >
          <Check
            className={`h-3.5 w-3.5 stroke-[3] transition-transform ${
              todo.completed ? 'scale-100' : 'scale-0'
            }`}
          />
        </button>

        {/* 할 일 텍스트: 완료 시 취소선(line-through) 및 핑크 데코레이션 */}
        <span
          onClick={() => onToggle(todo.id)}
          className={`cursor-pointer truncate text-sm transition-all select-none ${
            todo.completed
              ? 'text-neutral-500 line-through decoration-pink-500 decoration-2'
              : 'font-medium text-slate-100 hover:text-cyan-300'
          }`}
          title={todo.text}
        >
          {todo.text}
        </span>
      </div>

      {/* 핑크 네온 삭제 버튼 */}
      <button
        type="button"
        id={`todo-delete-${todo.id}`}
        onClick={() => onDelete(todo.id)}
        aria-label="할 일 삭제"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-transparent text-neutral-500 transition-all duration-200 hover:border-pink-500/60 hover:bg-pink-950/40 hover:text-pink-400 hover:shadow-[0_0_12px_rgba(255,0,128,0.4)]"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
};

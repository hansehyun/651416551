import React, { useState } from 'react';
import { Plus, Terminal } from 'lucide-react';

interface TodoInputProps {
  onAddTodo: (text: string) => void;
  isSyncing?: boolean;
}

/**
 * TodoInput 컴포넌트 (Cyberpunk Terminal Input)
 * 
 * 시니어 팁:
 * 사이버펑크 터미널 감성을 주기 위해 커맨드라인 프롬프트(`>`) 기호와
 * 네온 시안/퍼플 포커스 링을 결합했습니다.
 * 기존의 useState 기반 제어 컴포넌트(Controlled Component) 로직은 그대로 유지됩니다.
 */
export const TodoInput: React.FC<TodoInputProps> = ({ onAddTodo, isSyncing = false }) => {
  // 사용자가 입력 중인 텍스트를 관리하는 로컬 상태
  const [inputText, setInputText] = useState('');

  // 폼 제출 이벤트 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // 새로고침 기본 동작 방지

    const trimmed = inputText.trim();
    // 공백만 입력된 경우 추가하지 않음 (유효성 검사)
    if (!trimmed || isSyncing) {
      return;
    }

    // 부모 컴포넌트로부터 전달받은 추가 함수 호출
    onAddTodo(trimmed);

    // 입력창 비우기
    setInputText('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative mb-6" id="todo-input-form">
      <div className="relative flex items-center gap-2">
        {/* 입력창 내부 터미널 프롬프트 기호 */}
        <div className="pointer-events-none absolute left-3.5 flex items-center gap-1 text-cyan-400">
          <Terminal className="h-4 w-4 stroke-[2.2] animate-pulse" />
          <span className="font-mono font-bold text-xs text-pink-400">&gt;</span>
        </div>

        <input
          id="todo-text-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="새로운 퀘스트/할 일을 터미널에 입력하세요..."
          disabled={isSyncing}
          className="w-full rounded-lg border border-cyan-500/40 bg-neutral-950/80 py-3.5 pl-12 pr-4 text-sm font-medium text-cyan-100 placeholder-neutral-500 backdrop-blur-sm transition-all focus:border-cyan-400 focus:bg-neutral-900/90 focus:outline-none focus:ring-1 focus:ring-cyan-400 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] focus:shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-60"
          autoComplete="off"
        />

        {/* 네온 사이버 버튼 */}
        <button
          id="todo-add-button"
          type="submit"
          disabled={!inputText.trim() || isSyncing}
          className="group relative flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-lg border border-cyan-400/80 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:border-pink-400 hover:shadow-[0_0_20px_rgba(255,0,128,0.5)] active:scale-95 disabled:cursor-not-allowed disabled:border-neutral-800 disabled:from-neutral-900 disabled:to-neutral-800 disabled:text-neutral-600 disabled:shadow-none"
          aria-label="할 일 추가"
        >
          <Plus className={`h-4 w-4 stroke-[3] transition-transform text-cyan-200 ${isSyncing ? 'animate-spin' : 'group-hover:rotate-90'}`} />
          <span className="font-cyber hidden sm:inline">{isSyncing ? 'SAVING...' : 'ADD TASK'}</span>
        </button>
      </div>
    </form>
  );
};

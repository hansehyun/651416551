import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import {
  onSnapshot,
  query,
  orderBy,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { Todo, FilterType } from './types.ts';
import { TodoHeader } from './components/TodoHeader.tsx';
import { TodoInput } from './components/TodoInput.tsx';
import { TodoFilter } from './components/TodoFilter.tsx';
import { TodoList } from './components/TodoList.tsx';
import {
  db,
  todosCollectionRef,
  testConnection,
  handleFirestoreError,
  OperationType,
} from './firebase.ts';

/**
 * 초기 할 일 시드 데이터 (Firestore 컬렉션이 비어있을 때 최초 1회 생성)
 */
const SEED_TODOS: Omit<Todo, 'id'>[] = [
  {
    text: '뉴로링크 사이버네틱스 방화벽 보안 프로토콜 갱신',
    completed: true,
    createdAt: Date.now() - 3600000,
  },
  {
    text: '네온 시안 & 핫 핑크 홀로그램 HUD 인터페이스 보정',
    completed: true,
    createdAt: Date.now() - 1800000,
  },
  {
    text: 'Cloud Firestore 실시간 동기화 매트릭스 점검',
    completed: false,
    createdAt: Date.now(),
  },
];

export default function App() {
  /**
   * 1. 상태(State) 관리
   * 
   * - todos: Firestore로부터 실시간 동기화되는 Todo 항목 목록
   * - filter: 현재 선택된 필터 탭 ('all' | 'active' | 'completed')
   * - isLoading: 초기 데이터 로드 중 여부
   * - isSyncing: Firestore와의 통신 상태 시각화
   */
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * 2. Firestore 초기 연결 확인 및 실시간 데이터 구독 (onSnapshot)
   * 
   * 시니어 팁:
   * `onSnapshot`을 사용하면 클라이언트가 직접 데이터를 다시 불러올 필요 없이,
   * 추가/수정/삭제 등 Firestore의 데이터가 바뀔 때마다 실시간으로 콜백이 실행되어
   * UI가 완벽하게 동기화됩니다. 새로고침 시에도 Firestore로부터 최신 데이터를 즉시 불러옵니다.
   */
  useEffect(() => {
    // 연결 테스트 수행
    testConnection();

    // 생성 시간 내림차순(최신순) 쿼리
    const q = query(todosCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        // 컬렉션이 완전히 비어있는 경우 최초 시드 데이터 생성 (첫 사용자 경험 제공)
        if (snapshot.empty) {
          try {
            for (const seed of SEED_TODOS) {
              const newDocRef = doc(todosCollectionRef);
              await setDoc(newDocRef, seed);
            }
            setIsLoading(false);
            return;
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, 'todos');
          }
        }

        const loadedTodos: Todo[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            text: data.text ?? '',
            completed: Boolean(data.completed),
            createdAt: Number(data.createdAt ?? Date.now()),
          };
        });

        setTodos(loadedTodos);
        setIsLoading(false);
        setErrorMessage(null);
      },
      (error) => {
        setIsLoading(false);
        const msg = error instanceof Error ? error.message : String(error);
        setErrorMessage(`Firestore 동기화 오류: ${msg}`);
        console.error('Firestore onSnapshot Error:', error);
      }
    );

    // 컴포넌트 언마운트 시 리스너 해제 (메모리 누수 방지)
    return () => unsubscribe();
  }, []);

  /**
   * 3. 할 일 추가 핸들러 (Firestore `setDoc`)
   * 
   * 시니어 팁:
   * `doc(todosCollectionRef)`로 고유 ID를 가진 문서 참조를 생성한 후,
   * `setDoc`으로 Firestore에 영구 저장합니다.
   * `onSnapshot` 리스너가 이를 감지하여 `todos` state를 자동으로 갱신합니다.
   */
  const handleAddTodo = async (text: string) => {
    try {
      setIsSyncing(true);
      setErrorMessage(null);
      const newDocRef = doc(todosCollectionRef);
      const newTodoData = {
        text,
        completed: false,
        createdAt: Date.now(),
      };

      await setDoc(newDocRef, newTodoData);
    } catch (error) {
      console.error('handleAddTodo Error:', error);
      const msg = error instanceof Error ? error.message : String(error);
      setErrorMessage(`할 일 추가 실패: ${msg}`);
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * 4. 완료 여부 토글 핸들러 (Firestore `updateDoc`)
   * 
   * 시니어 팁:
   * 문서 전체를 덮어쓰지 않고 `updateDoc`을 사용해 `completed` 필드만 효율적으로 수정합니다.
   */
  const handleToggleTodo = async (id: string) => {
    const targetTodo = todos.find((t) => t.id === id);
    if (!targetTodo) return;

    try {
      setIsSyncing(true);
      setErrorMessage(null);
      const todoDocRef = doc(db, 'todos', id);
      await updateDoc(todoDocRef, {
        completed: !targetTodo.completed,
      });
    } catch (error) {
      console.error('handleToggleTodo Error:', error);
      const msg = error instanceof Error ? error.message : String(error);
      setErrorMessage(`할 일 상태 변경 실패: ${msg}`);
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * 5. 할 일 삭제 핸들러 (Firestore `deleteDoc`)
   * 
   * 시니어 팁:
   * `deleteDoc`을 실행하면 Firestore에서 해당 문서가 완전히 삭제되며,
   * 새로고침하거나 다른 기기에서 접속해도 삭제된 상태가 영구 유지됩니다.
   */
  const handleDeleteTodo = async (id: string) => {
    try {
      setIsSyncing(true);
      setErrorMessage(null);
      const todoDocRef = doc(db, 'todos', id);
      await deleteDoc(todoDocRef);
    } catch (error) {
      console.error('handleDeleteTodo Error:', error);
      const msg = error instanceof Error ? error.message : String(error);
      setErrorMessage(`할 일 삭제 실패: ${msg}`);
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * 6. 파생 상태(Derived State) 계산
   */
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true; // 'all'
  });

  const counts = {
    all: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
  };

  return (
    <main className="relative min-h-screen cyber-grid-bg flex flex-col justify-center px-4 py-8 sm:py-16 text-slate-100 overflow-hidden">
      {/* 1. 미래 도시 네온 불빛 반사 효과 (Cyan, Purple, Pink Ambient Glows) */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-cyan-500/15 blur-[100px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 right-1/4 h-[450px] w-[450px] rounded-full bg-purple-600/15 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-pink-600/15 blur-[100px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-xl z-10">
        {/* 2. 미래 전광판 HUD 메인 패널 (Cyber Billboard Frame) */}
        <section
          id="todo-app-card"
          className="relative overflow-hidden rounded-2xl border border-cyan-500/40 bg-neutral-950/85 p-6 shadow-[0_0_35px_rgba(0,240,255,0.15)] backdrop-blur-md sm:p-8"
        >
          {/* 패널 모서리 사이버 볼트/리벳 데코레이션 */}
          <div className="absolute top-2.5 left-2.5 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_4px_#00f0ff]" />
          <div className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-pink-500 shadow-[0_0_4px_#ff007f]" />
          <div className="absolute bottom-2.5 left-2.5 h-1.5 w-1.5 rounded-full bg-purple-500 shadow-[0_0_4px_#a855f7]" />
          <div className="absolute bottom-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_4px_#00f0ff]" />

          {/* 상단 얇은 사이버 네온 라인 */}
          <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />

          {/* 헤더 및 프로그레스 바 */}
          <TodoHeader
            totalCount={counts.all}
            completedCount={counts.completed}
          />

          {/* 시스템 알림 / 에러 HUD 배너 */}
          {errorMessage && (
            <div
              id="todo-error-banner"
              className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-pink-500/80 bg-pink-950/40 p-3.5 text-xs text-pink-200 shadow-[0_0_15px_rgba(255,0,128,0.3)] backdrop-blur-sm"
              role="alert"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-pink-400 animate-pulse mt-0.5" />
                <div>
                  <p className="font-cyber font-bold tracking-wider text-pink-300 uppercase">
                    SYSTEM ALERT // FIRESTORE ERROR
                  </p>
                  <p className="mt-0.5 font-mono text-pink-200/90">{errorMessage}</p>
                </div>
              </div>
              <button
                type="button"
                id="todo-error-dismiss-btn"
                onClick={() => setErrorMessage(null)}
                className="rounded p-1 text-pink-400 hover:bg-pink-900/50 hover:text-pink-200 transition-colors"
                aria-label="알림 닫기"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* 터미널 할 일 입력창 */}
          <TodoInput onAddTodo={handleAddTodo} isSyncing={isSyncing} />

          {/* 네온 필터 탭 (전체 / 진행 중 / 완료) */}
          <TodoFilter
            currentFilter={filter}
            onFilterChange={setFilter}
            counts={counts}
          />

          {/* 로딩 인디케이터 또는 할 일 목록 매트릭스 */}
          {isLoading ? (
            <div
              id="todo-loading-state"
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent shadow-[0_0_15px_rgba(0,240,255,0.5)]" />
              <p className="mt-3 font-cyber text-xs tracking-wider text-cyan-300">
                CONNECTING TO CLOUD FIRESTORE...
              </p>
            </div>
          ) : (
            <TodoList
              todos={filteredTodos}
              filter={filter}
              onToggle={handleToggleTodo}
              onDelete={handleDeleteTodo}
            />
          )}
        </section>

        {/* 3. 하단 사이버펑크 터미널 가이드 풋터 (Firestore 연동 안내) */}
        <footer className="mt-5 flex items-center justify-between px-2 text-[11px] font-mono text-neutral-500">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                isSyncing
                  ? 'bg-pink-500 animate-ping shadow-[0_0_8px_#ff007f]'
                  : 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
              }`}
            />
            <span className={isSyncing ? 'text-pink-400' : 'text-emerald-400/80'}>
              {isSyncing ? 'FIRESTORE SYNCING...' : 'CLOUD FIRESTORE LIVE // SYNCED'}
            </span>
          </div>
          <span className="text-cyan-500/60 hidden sm:inline">
            PERSISTENCE ENABLED
          </span>
        </footer>
      </div>
    </main>
  );
}

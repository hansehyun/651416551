import React, { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDocFromServer,
} from 'firebase/firestore';
import { db } from './firebase';
import { LeaderboardEntry, GameState } from './types';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { StartMenu } from './components/StartMenu';
import { GameOverModal } from './components/GameOverModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { sound } from './utils/audio';
import { AlertTriangle, Zap, X } from 'lucide-react';

/**
 * Firebase Firestore 에러 처리 규격
 */
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 실시간 게임 스탯 (HUD 연동)
  const [hudStats, setHudStats] = useState({
    score: 0,
    combo: 1,
    level: 1,
    shards: 0,
    shieldActive: true,
    blasterTime: 0,
    timewarpTime: 0,
  });

  // 게임 오버 시 최종 기록
  const [finalStats, setFinalStats] = useState({
    score: 0,
    level: 1,
    shards: 0,
    maxCombo: 1,
  });

  /**
   * 1. Firestore 연결 테스트
   */
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error('Firebase connection offline:', error);
        }
      }
    }
    testConnection();
  }, []);

  /**
   * 2. 명예의 전당 (리더보드) 실시간 구독
   */
  useEffect(() => {
    const scoresColRef = collection(db, 'scores');
    const q = query(scoresColRef, orderBy('score', 'desc'), limit(15));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: LeaderboardEntry[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            playerName: data.playerName || 'PILOT',
            score: typeof data.score === 'number' ? data.score : 0,
            level: typeof data.level === 'number' ? data.level : 1,
            shardsCollected: typeof data.shardsCollected === 'number' ? data.shardsCollected : 0,
            createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
          });
        });
        setLeaderboard(list);
        setIsLoadingScores(false);
      },
      (error) => {
        setIsLoadingScores(false);
        const msg = error instanceof Error ? error.message : String(error);
        console.error('Firestore leaderboard onSnapshot error:', msg);
      }
    );

    return () => unsubscribe();
  }, []);

  // 게임 시작 핸들러
  const handleStartGame = useCallback(() => {
    setErrorMessage(null);
    setGameState('playing');
  }, []);

  // 게임 오버 핸들러
  const handleGameOver = useCallback((stats: { score: number; level: number; shards: number; maxCombo: number }) => {
    setFinalStats(stats);
    setGameState('gameover');
  }, []);

  // 스탯 업데이트 콜백
  const handleUpdateStats = useCallback((stats: typeof hudStats) => {
    setHudStats(stats);
  }, []);

  // 점수 등록 (Firestore 저장)
  const handleSubmitScore = async (pilotName: string): Promise<boolean> => {
    try {
      setErrorMessage(null);
      const scoresColRef = collection(db, 'scores');
      const newScoreRef = doc(scoresColRef);

      await setDoc(newScoreRef, {
        playerName: pilotName,
        score: finalStats.score,
        level: finalStats.level,
        shardsCollected: finalStats.shards,
        createdAt: Date.now(),
      });

      return true;
    } catch (error) {
      console.error('Score submission error:', error);
      const msg = error instanceof Error ? error.message : String(error);
      setErrorMessage(`점수 저장 실패: ${msg}`);
      return false;
    }
  };

  // 사운드 토글
  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // 일시정지 토글
  const handleTogglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  };

  const topScore = leaderboard.length > 0 ? leaderboard[0].score : 0;

  return (
    <div
      id="neon-space-dodger-app"
      className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-[#05060b] text-neutral-100 font-rajdhani select-none"
    >
      {/* 백그라운드 미세 주사선 스캔라인 효과 */}
      <div className="pointer-events-none absolute inset-0 z-10 scanlines opacity-40" />

      {/* 시스템 에러 알림 배너 */}
      {errorMessage && (
        <div
          id="system-error-banner"
          className="absolute top-4 z-50 flex items-center justify-between gap-3 rounded-xl border border-pink-500/80 bg-pink-950/90 px-4 py-2.5 text-xs text-pink-200 shadow-[0_0_20px_rgba(255,0,128,0.5)] backdrop-blur-md animate-bounce"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-pink-400" />
            <span className="font-mono">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="rounded p-1 text-pink-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 메인 게임 아케이드 프레임 */}
      <div className="relative flex h-full w-full max-w-5xl flex-col overflow-hidden border-cyan-500/30 sm:border sm:rounded-2xl sm:my-3 sm:shadow-[0_0_40px_rgba(0,240,255,0.2)]">
        {/* 상단 네온 HUD */}
        <GameHUD
          score={hudStats.score}
          combo={hudStats.combo}
          level={hudStats.level}
          shards={hudStats.shards}
          shieldActive={hudStats.shieldActive}
          blasterTime={hudStats.blasterTime}
          timewarpTime={hudStats.timewarpTime}
          isMuted={isMuted}
          isPaused={gameState === 'paused'}
          onToggleMute={handleToggleMute}
          onTogglePause={handleTogglePause}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        />

        {/* 60FPS 메인 캔버스 엔진 */}
        <GameCanvas
          isPlaying={gameState === 'playing' || gameState === 'paused'}
          isPaused={gameState === 'paused'}
          onGameOver={handleGameOver}
          onUpdateStats={handleUpdateStats}
        />

        {/* 모바일 화면 하단 레이저 발사 보조 버튼 (블래스터 활성화 시 등장) */}
        {gameState === 'playing' && hudStats.blasterTime > 0 && (
          <div className="pointer-events-auto absolute bottom-6 right-6 z-20 flex sm:hidden">
            <button
              id="mobile-fire-btn"
              onClick={() => {
                const event = new KeyboardEvent('keydown', { code: 'Space' });
                window.dispatchEvent(event);
              }}
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-pink-400 bg-pink-600/80 text-white shadow-[0_0_20px_rgba(255,0,128,0.6)] active:scale-90"
              aria-label="블래스터 발사"
            >
              <Zap className="h-8 w-8 fill-current text-white animate-pulse" />
            </button>
          </div>
        )}

        {/* 시작 화면 오버레이 */}
        {gameState === 'menu' && (
          <StartMenu
            onStartGame={handleStartGame}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            topScore={topScore}
          />
        )}

        {/* 일시정지 오버레이 */}
        {gameState === 'paused' && (
          <div
            id="pause-overlay"
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <div className="rounded-2xl border border-cyan-500/50 bg-neutral-950/90 p-6 text-center shadow-[0_0_30px_rgba(0,240,255,0.3)]">
              <h3 className="font-cyber text-2xl font-black text-cyan-300 uppercase tracking-widest">
                MISSION PAUSED
              </h3>
              <p className="mt-1 text-xs text-neutral-400">시스템 일시 정지 중입니다</p>
              <button
                onClick={() => setGameState('playing')}
                className="mt-5 rounded-xl border border-cyan-400 bg-cyan-600/80 px-6 py-2.5 font-cyber text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:bg-cyan-500"
              >
                RESUME FLIGHT
              </button>
            </div>
          </div>
        )}

        {/* 게임 오버 모달 */}
        {gameState === 'gameover' && (
          <GameOverModal
            score={finalStats.score}
            level={finalStats.level}
            shards={finalStats.shards}
            maxCombo={finalStats.maxCombo}
            onRestart={handleStartGame}
            onSubmitScore={handleSubmitScore}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          />
        )}

        {/* 명예의 전당 (리더보드) 모달 */}
        <LeaderboardModal
          isOpen={isLeaderboardOpen}
          onClose={() => setIsLeaderboardOpen(false)}
          scores={leaderboard}
          isLoading={isLoadingScores}
        />
      </div>
    </div>
  );
};
export default App;

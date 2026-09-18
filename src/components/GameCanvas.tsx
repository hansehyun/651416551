import React, { useRef, useEffect, useCallback } from 'react';
import {
  PlayerShip,
  Obstacle,
  Collectible,
  Laser,
  Particle,
  FloatingText,
  PowerupType,
} from '../types';
import { sound } from '../utils/audio';

interface GameCanvasProps {
  isPlaying: boolean;
  isPaused: boolean;
  onGameOver: (finalStats: { score: number; level: number; shards: number; maxCombo: number }) => void;
  onUpdateStats: (stats: {
    score: number;
    combo: number;
    level: number;
    shards: number;
    shieldActive: boolean;
    blasterTime: number;
    timewarpTime: number;
  }) => void;
}

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  isPlaying,
  isPaused,
  onGameOver,
  onUpdateStats,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 게임 상태 레프 (60FPS 렌더 루프 내부에서 즉각 참조)
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // 플레이어 및 월드 객체
  const playerRef = useRef<PlayerShip>({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    size: 24,
    angle: 0,
    shield: true, // 게임 시작 시 기본 1회 보호막 제공
    shieldDuration: 0,
    blasterDuration: 0,
    timewarpDuration: 0,
  });

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const pointerPos = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  // 엔티티 목록
  const obstaclesRef = useRef<Obstacle[]>([]);
  const collectiblesRef = useRef<Collectible[]>([]);
  const lasersRef = useRef<Laser[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const starsRef = useRef<Star[]>([]);

  // 점수 및 상태 카운터
  const statsRef = useRef({
    score: 0,
    combo: 1,
    maxCombo: 1,
    comboTimer: 0,
    level: 1,
    shards: 0,
    distance: 0,
    screenShake: 0,
  });

  // 스폰 타이머
  const spawnTimersRef = useRef({
    obstacle: 0,
    collectible: 0,
    laserCooldown: 0,
  });

  // 별빛 배경 초기화
  const initStars = (width: number, height: number) => {
    const stars: Star[] = [];
    const count = Math.min(120, Math.floor((width * height) / 6000));
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random(),
        size: Math.random() * 2 + 0.8,
        speed: Math.random() * 3 + 1,
      });
    }
    starsRef.current = stars;
  };

  // 파티클 생성 함수
  const spawnParticles = (x: number, y: number, color: string, count: number = 12, speed: number = 4) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const vel = (Math.random() * 0.8 + 0.2) * speed;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel,
        life: 1,
        maxLife: Math.random() * 20 + 20,
        size: Math.random() * 3 + 1.5,
        color,
        alpha: 1,
      });
    }
  };

  // 플로팅 텍스트 알림
  const addFloatingText = (text: string, x: number, y: number, color: string) => {
    floatingTextsRef.current.push({
      id: Math.random(),
      text,
      x,
      y,
      vy: -1.5,
      color,
      alpha: 1,
      scale: 1,
    });
  };

  // 게임 초기화
  const resetGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    playerRef.current = {
      x: width / 2,
      y: height - 100,
      vx: 0,
      vy: 0,
      size: 22,
      angle: 0,
      shield: true,
      shieldDuration: 0,
      blasterDuration: 0,
      timewarpDuration: 0,
    };

    obstaclesRef.current = [];
    collectiblesRef.current = [];
    lasersRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];

    statsRef.current = {
      score: 0,
      combo: 1,
      maxCombo: 1,
      comboTimer: 0,
      level: 1,
      shards: 0,
      distance: 0,
      screenShake: 0,
    };

    spawnTimersRef.current = {
      obstacle: 0,
      collectible: 0,
      laserCooldown: 0,
    };

    addFloatingText('SYSTEMS ONLINE // READY!', width / 2, height / 2 - 40, '#00f0ff');
  }, []);

  // 소행성 생성
  const spawnObstacle = (width: number) => {
    const size = Math.random() * 24 + 20;
    const sides = Math.floor(Math.random() * 3) + 6; // 6~8각형
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const r = size * (0.8 + Math.random() * 0.4);
      points.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
    }

    const level = statsRef.current.level;
    const baseSpeed = 2.2 + level * 0.45;
    const speed = baseSpeed * (0.85 + Math.random() * 0.4);

    const colors = ['#f43f5e', '#fb7185', '#fb923c', '#e11d48'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    obstaclesRef.current.push({
      id: Math.random(),
      x: Math.random() * (width - size * 2) + size,
      y: -size - 10,
      vx: (Math.random() - 0.5) * 1.5,
      vy: speed,
      size,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      sides,
      points,
      color,
    });
  };

  // 아이템 스폰 (크리스탈 샤드 or 파워업)
  const spawnCollectible = (width: number) => {
    const rand = Math.random();
    let type: PowerupType = 'shard';

    if (rand < 0.6) {
      type = 'shard'; // 60% 샤드
    } else if (rand < 0.75) {
      type = 'shield'; // 15% 실드
    } else if (rand < 0.9) {
      type = 'blaster'; // 15% 레이저 블래스터
    } else {
      type = 'timewarp'; // 10% 타임 워프 (슬로우 모션)
    }

    collectiblesRef.current.push({
      id: Math.random(),
      type,
      x: Math.random() * (width - 60) + 30,
      y: -30,
      vy: 2.2,
      size: type === 'shard' ? 14 : 18,
      pulse: 0,
    });
  };

  // 레이저 발사
  const fireLaser = () => {
    const player = playerRef.current;
    sound.playLaser();
    lasersRef.current.push(
      {
        id: Math.random(),
        x: player.x - 12,
        y: player.y - 15,
        vy: -14,
        width: 3,
        height: 16,
      },
      {
        id: Math.random(),
        x: player.x + 12,
        y: player.y - 15,
        vy: -14,
        width: 3,
        height: 16,
      }
    );
  };

  // 키보드 이벤트 바인딩
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
      if (e.code === 'Space' && playerRef.current.blasterDuration > 0) {
        e.preventDefault();
        fireLaser();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 마우스 및 터치 이벤트 바인딩
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      pointerPos.current = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
        active: true,
      };
    };

    const handlePointerDown = (e: PointerEvent) => {
      handlePointerMove(e);
      if (playerRef.current.blasterDuration > 0) {
        fireLaser();
      }
    };

    const handlePointerLeave = () => {
      pointerPos.current.active = false;
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  // 캔버스 크기 자동 리사이징
  useEffect(() => {
    const updateSize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      if (starsRef.current.length === 0) {
        initStars(rect.width, rect.height);
        resetGame();
      }
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }

    return () => ro.disconnect();
  }, [resetGame]);

  // 메인 게임 루프 (60FPS Canvas Animation)
  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      lastTimeRef.current = time;

      const width = canvas.width;
      const height = canvas.height;

      if (!isPaused) {
        // --- 1. 업데이트 로직 ---
        const player = playerRef.current;
        const stats = statsRef.current;
        const timers = spawnTimersRef.current;

        // 슬로우 모션 (타임 워프 파워업) 여부
        const isTimeWarp = player.timewarpDuration > 0;
        const timeFactor = isTimeWarp ? 0.45 : 1.0;

        // 타이머 감소
        if (player.blasterDuration > 0) {
          player.blasterDuration--;
          // 블래스터 상태일 때 연사 (250ms마다 자동 발사 보조)
          timers.laserCooldown++;
          if (timers.laserCooldown > 14) {
            timers.laserCooldown = 0;
            fireLaser();
          }
        }
        if (player.timewarpDuration > 0) player.timewarpDuration--;

        // 콤보 타이머 감소
        if (stats.comboTimer > 0) {
          stats.comboTimer--;
          if (stats.comboTimer <= 0 && stats.combo > 1) {
            stats.combo = 1; // 콤보 초기화
          }
        }

        // 레벨 스케일링 (1000점마다 워프 레벨 상승)
        stats.level = Math.floor(stats.score / 1200) + 1;

        // 생존 비행 점수 가산
        stats.distance++;
        if (stats.distance % 5 === 0) {
          stats.score += 1 * stats.combo;
        }

        // 플레이어 조작 (키보드 + 포인터 부드러운 보간)
        const moveSpeed = 6.8;
        if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA']) {
          player.vx -= 1.2;
        }
        if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD']) {
          player.vx += 1.2;
        }
        if (keysPressed.current['ArrowUp'] || keysPressed.current['KeyW']) {
          player.vy -= 1.2;
        }
        if (keysPressed.current['ArrowDown'] || keysPressed.current['KeyS']) {
          player.vy += 1.2;
        }

        // 마우스/터치 위치 추적
        if (pointerPos.current.active) {
          const dx = pointerPos.current.x - player.x;
          const dy = pointerPos.current.y - player.y;
          player.vx += dx * 0.08;
          player.vy += dy * 0.08;
        }

        // 감속 및 마찰력
        player.vx *= 0.86;
        player.vy *= 0.86;

        // 최대 속도 제한
        player.vx = Math.max(-moveSpeed, Math.min(moveSpeed, player.vx));
        player.vy = Math.max(-moveSpeed, Math.min(moveSpeed, player.vy));

        player.x += player.vx;
        player.y += player.vy;

        // 경계 제한
        player.x = Math.max(player.size, Math.min(width - player.size, player.x));
        player.y = Math.max(player.size + 40, Math.min(height - player.size - 20, player.y));

        // 기체 틸팅 각도 계산
        player.angle = player.vx * 0.04;

        // 엔진 트윈 플라즈마 파티클
        if (Math.random() < 0.85) {
          const exhaustX = player.x + (Math.random() - 0.5) * 8;
          const exhaustY = player.y + player.size - 2;
          particlesRef.current.push({
            x: exhaustX,
            y: exhaustY,
            vx: (Math.random() - 0.5) * 1.5,
            vy: Math.random() * 4 + 4,
            life: 1,
            maxLife: 15,
            size: Math.random() * 3 + 2,
            color: player.blasterDuration > 0 ? '#ff007f' : '#00f0ff',
            alpha: 1,
          });
        }

        // 소행성 스폰
        timers.obstacle++;
        const obstacleSpawnInterval = Math.max(25, 65 - stats.level * 4);
        if (timers.obstacle > obstacleSpawnInterval) {
          timers.obstacle = 0;
          spawnObstacle(width);
        }

        // 아이템 스폰
        timers.collectible++;
        if (timers.collectible > 110) {
          timers.collectible = 0;
          spawnCollectible(width);
        }

        // 소행성 업데이트 및 충돌 검사
        for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
          const obs = obstaclesRef.current[i];
          obs.x += obs.vx * timeFactor;
          obs.y += obs.vy * timeFactor;
          obs.rotation += obs.rotationSpeed * timeFactor;

          // 플레이어와 충돌 검사
          const dist = Math.hypot(player.x - obs.x, player.y - obs.y);
          if (dist < player.size + obs.size * 0.75) {
            // 충돌 발생!
            if (player.shield) {
              // 실드로 방어
              player.shield = false;
              sound.playShieldBlock();
              stats.screenShake = 16;
              spawnParticles(obs.x, obs.y, '#a855f7', 24, 6);
              addFloatingText('SHIELD SHATTERED!', player.x, player.y - 30, '#a855f7');
              obstaclesRef.current.splice(i, 1);
              continue;
            } else {
              // 실드 없음 -> 게임 오버
              sound.playExplosion();
              sound.playGameOver();
              spawnParticles(player.x, player.y, '#ff007f', 40, 8);
              onGameOver({
                score: stats.score,
                level: stats.level,
                shards: stats.shards,
                maxCombo: stats.maxCombo,
              });
              return;
            }
          }

          // 화면 밖으로 벗어난 소행성 제거 (성공적 회피 점수)
          if (obs.y > height + obs.size * 2) {
            obstaclesRef.current.splice(i, 1);
            stats.score += 15 * stats.combo;
          }
        }

        // 레이저 업데이트 및 소행성 타격
        for (let l = lasersRef.current.length - 1; l >= 0; l--) {
          const laser = lasersRef.current[l];
          laser.y += laser.vy;

          let hit = false;
          for (let o = obstaclesRef.current.length - 1; o >= 0; o--) {
            const obs = obstaclesRef.current[o];
            const d = Math.hypot(laser.x - obs.x, laser.y - obs.y);
            if (d < obs.size) {
              hit = true;
              sound.playExplosion();
              spawnParticles(obs.x, obs.y, obs.color, 16, 5);
              stats.score += 70 * stats.combo;
              addFloatingText(`+${70 * stats.combo}`, obs.x, obs.y, '#ff007f');
              obstaclesRef.current.splice(o, 1);
              break;
            }
          }

          if (hit || laser.y < -30) {
            lasersRef.current.splice(l, 1);
          }
        }

        // 아이템 업데이트 및 획득 검사
        for (let c = collectiblesRef.current.length - 1; c >= 0; c--) {
          const item = collectiblesRef.current[c];
          item.y += item.vy * timeFactor;
          item.pulse += 0.08;

          // 자석 효과: 플레이어가 가까워지면 흡수
          const d = Math.hypot(player.x - item.x, player.y - item.y);
          if (d < 110) {
            item.x += (player.x - item.x) * 0.12;
            item.y += (player.y - item.y) * 0.12;
          }

          // 플레이어와 충돌 획득
          if (d < player.size + item.size) {
            if (item.type === 'shard') {
              stats.shards++;
              stats.combo = Math.min(stats.combo + 1, 5);
              if (stats.combo > stats.maxCombo) stats.maxCombo = stats.combo;
              stats.comboTimer = 180; // 약 3초 유지
              const points = 50 * stats.combo;
              stats.score += points;
              sound.playShard(stats.combo);
              spawnParticles(item.x, item.y, '#00f0ff', 12, 4);
              addFloatingText(`+${points} (${stats.combo}x)`, item.x, item.y, '#00f0ff');
            } else if (item.type === 'shield') {
              player.shield = true;
              sound.playPowerup();
              spawnParticles(item.x, item.y, '#a855f7', 20, 5);
              addFloatingText('SHIELD ONLINE!', item.x, item.y, '#a855f7');
            } else if (item.type === 'blaster') {
              player.blasterDuration = 480; // 8초
              sound.playPowerup();
              spawnParticles(item.x, item.y, '#ff007f', 24, 6);
              addFloatingText('BLASTER CANNON!', item.x, item.y, '#ff007f');
            } else if (item.type === 'timewarp') {
              player.timewarpDuration = 360; // 6초
              sound.playPowerup();
              spawnParticles(item.x, item.y, '#10b981', 20, 5);
              addFloatingText('TIME WARP SLOW-MO!', item.x, item.y, '#10b981');
            }

            collectiblesRef.current.splice(c, 1);
            continue;
          }

          if (item.y > height + 40) {
            collectiblesRef.current.splice(c, 1);
          }
        }

        // 파티클 업데이트
        for (let p = particlesRef.current.length - 1; p >= 0; p--) {
          const pt = particlesRef.current[p];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life++;
          pt.alpha = 1 - pt.life / pt.maxLife;
          if (pt.life >= pt.maxLife) {
            particlesRef.current.splice(p, 1);
          }
        }

        // 플로팅 텍스트 업데이트
        for (let t = floatingTextsRef.current.length - 1; t >= 0; t--) {
          const ft = floatingTextsRef.current[t];
          ft.y += ft.vy;
          ft.alpha -= 0.02;
          if (ft.alpha <= 0) {
            floatingTextsRef.current.splice(t, 1);
          }
        }

        // 스크린 쉐이크 감쇠
        if (stats.screenShake > 0) {
          stats.screenShake *= 0.88;
          if (stats.screenShake < 0.2) stats.screenShake = 0;
        }

        // HUD 상태 알림
        onUpdateStats({
          score: stats.score,
          combo: stats.combo,
          level: stats.level,
          shards: stats.shards,
          shieldActive: player.shield,
          blasterTime: player.blasterDuration,
          timewarpTime: player.timewarpDuration,
        });
      }

      // --- 2. 렌더링 로직 ---
      ctx.save();

      // 스크린 쉐이크 효과 적용
      const shake = statsRef.current.screenShake;
      if (shake > 0) {
        ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      }

      // 우주 배경 클리어
      ctx.fillStyle = '#05060b';
      ctx.fillRect(0, 0, width, height);

      // 별빛 워프 필드 렌더링
      const warpSpeed = 1 + statsRef.current.level * 0.4;
      ctx.fillStyle = '#ffffff';
      starsRef.current.forEach((star) => {
        if (!isPaused) {
          star.y += star.speed * warpSpeed;
          if (star.y > height) {
            star.y = 0;
            star.x = Math.random() * width;
          }
        }

        const streak = warpSpeed > 2 ? warpSpeed * 3 : star.size;
        ctx.fillStyle = star.z > 0.6 ? '#c084fc' : star.z > 0.3 ? '#38bdf8' : '#e2e8f0';
        ctx.fillRect(star.x, star.y, star.size, streak);
      });

      // 레이저 렌더링
      lasersRef.current.forEach((laser) => {
        ctx.shadowColor = '#ff007f';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#ff007f';
        ctx.fillRect(laser.x - laser.width / 2, laser.y, laser.width, laser.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(laser.x - laser.width / 4, laser.y + 2, laser.width / 2, laser.height - 4);
      });
      ctx.shadowBlur = 0;

      // 아이템 (크리스탈 & 파워업) 렌더링
      collectiblesRef.current.forEach((item) => {
        const glowRadius = Math.sin(item.pulse) * 4 + 8;
        ctx.save();
        ctx.translate(item.x, item.y);

        if (item.type === 'shard') {
          // 청록색 크리스탈 샤드
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = glowRadius;
          ctx.fillStyle = '#00f0ff';
          ctx.beginPath();
          ctx.moveTo(0, -item.size);
          ctx.lineTo(item.size * 0.7, 0);
          ctx.lineTo(0, item.size);
          ctx.lineTo(-item.size * 0.7, 0);
          ctx.closePath();
          ctx.fill();

          // 내부 하이라이트
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(0, -item.size * 0.5);
          ctx.lineTo(item.size * 0.3, 0);
          ctx.lineTo(0, item.size * 0.5);
          ctx.lineTo(-item.size * 0.3, 0);
          ctx.closePath();
          ctx.fill();
        } else if (item.type === 'shield') {
          // 보라색 실드 오브
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 15;
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, item.size, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
          ctx.fill();
        } else if (item.type === 'blaster') {
          // 핑크색 블래스터 번개
          ctx.shadowColor = '#ff007f';
          ctx.shadowBlur = 15;
          ctx.fillStyle = '#ff007f';
          ctx.beginPath();
          ctx.moveTo(2, -item.size);
          ctx.lineTo(-item.size * 0.6, 2);
          ctx.lineTo(0, 2);
          ctx.lineTo(-2, item.size);
          ctx.lineTo(item.size * 0.6, -2);
          ctx.lineTo(0, -2);
          ctx.closePath();
          ctx.fill();
        } else if (item.type === 'timewarp') {
          // 에메랄드 슬로우 모션
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 15;
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 2;
          ctx.strokeRect(-item.size / 2, -item.size / 2, item.size, item.size);
          ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
          ctx.fillRect(-item.size / 2, -item.size / 2, item.size, item.size);
        }

        ctx.restore();
      });

      // 소행성 (소용돌이 네온 록) 렌더링
      obstaclesRef.current.forEach((obs) => {
        ctx.save();
        ctx.translate(obs.x, obs.y);
        ctx.rotate(obs.rotation);

        ctx.shadowColor = obs.color;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = obs.color;
        ctx.lineWidth = 2;
        ctx.fillStyle = '#170c17';

        ctx.beginPath();
        obs.points.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 내부 크레이터 디테일
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(obs.size * 0.25, -obs.size * 0.2, obs.size * 0.25, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      });

      // 파티클 렌더링
      particlesRef.current.forEach((pt) => {
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillStyle = pt.color;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      // 플레이어 우주선 렌더링
      const player = playerRef.current;
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(player.angle);

      // 에너지 실드 보호막 (활성화 시)
      if (player.shield) {
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 18;
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.8)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, player.size + 14, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(168, 85, 247, 0.12)';
        ctx.fill();
      }

      // 우주선 본체 (사이버 네온 파이터)
      ctx.shadowColor = player.blasterDuration > 0 ? '#ff007f' : '#00f0ff';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#0a0d1a';
      ctx.strokeStyle = player.blasterDuration > 0 ? '#ff007f' : '#00f0ff';
      ctx.lineWidth = 2.2;

      ctx.beginPath();
      ctx.moveTo(0, -player.size); // 전면 기수
      ctx.lineTo(player.size, player.size * 0.85); // 우측 날개
      ctx.lineTo(player.size * 0.35, player.size * 0.55); // 우측 안쪽
      ctx.lineTo(0, player.size * 0.7); // 중앙 후면
      ctx.lineTo(-player.size * 0.35, player.size * 0.55); // 좌측 안쪽
      ctx.lineTo(-player.size, player.size * 0.85); // 좌측 날개
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 조종석 콕핏 캐노피
      ctx.fillStyle = player.blasterDuration > 0 ? '#ff007f' : '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(0, -player.size * 0.45);
      ctx.lineTo(player.size * 0.22, 0);
      ctx.lineTo(0, player.size * 0.25);
      ctx.lineTo(-player.size * 0.22, 0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // 플로팅 텍스트 렌더링
      floatingTextsRef.current.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.font = 'bold 15px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = ft.color;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 10;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      ctx.restore();

      gameLoopRef.current = requestAnimationFrame(animate);
    };

    gameLoopRef.current = requestAnimationFrame(animate);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, isPaused, onGameOver, onUpdateStats]);

  return (
    <div
      ref={containerRef}
      id="game-canvas-container"
      className="relative h-full w-full select-none overflow-hidden touch-none"
    >
      <canvas
        ref={canvasRef}
        id="game-canvas"
        className="block h-full w-full cursor-crosshair"
      />
    </div>
  );
};

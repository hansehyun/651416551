/**
 * Neon Space Dodger 게임 데이터 모델 및 타입 정의
 */

export type GameState = 'menu' | 'playing' | 'gameover' | 'paused';

export type PowerupType = 'shield' | 'blaster' | 'timewarp' | 'shard';

export interface PlayerShip {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  shield: boolean;
  shieldDuration: number;
  blasterDuration: number;
  timewarpDuration: number;
}

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  sides: number;
  points: { x: number; y: number }[];
  color: string;
}

export interface Collectible {
  id: number;
  type: PowerupType;
  x: number;
  y: number;
  vy: number;
  size: number;
  pulse: number;
}

export interface Laser {
  id: number;
  x: number;
  y: number;
  vy: number;
  width: number;
  height: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  vy: number;
  color: string;
  alpha: number;
  scale: number;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  level: number;
  shardsCollected: number;
  createdAt: number;
}

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Heart, Home as HomeIcon, Flag, PartyPopper, Volume2, VolumeX,
  Pause, Play, RotateCcw, Footprints, Trophy, ArrowLeft
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Ume's Journey to Nani Ghar — a small canvas endless-runner mini game.
// Run, jump obstacles and collect treats on the way from Home to Nani Ghar.
// ---------------------------------------------------------------------------

type GamePhase = 'ready' | 'playing' | 'paused' | 'gameover' | 'win';

const WORLD_W = 900;
const WORLD_H = 400;
const GROUND_Y = 328;
const PLAYER_X = 120;
const PLAYER_W = 34;
const PLAYER_H = 54;
const GRAVITY = 2000; // px/s^2
const JUMP_VELOCITY = -660; // px/s
const TOTAL_DISTANCE = 16000; // px of travel to reach Nani Ghar
const HEARTS_MAX = 3;
const HIGH_SCORE_KEY = 'ume-journey-highscore';

interface Zone {
  name: string;
  from: number;
  to: number;
  sky: [string, string];
  hill: string;
  ground: string;
  groundEdge: string;
  accent: string;
}

const ZONES: Zone[] = [
  { name: 'Leaving Home',    from: 0.00, to: 0.18, sky: ['#bfe3ff', '#eef8ff'], hill: '#a9d6b8', ground: '#cf9d5f', groundEdge: '#8a6a3d', accent: '#f2a65a' },
  { name: 'The Main Road',   from: 0.18, to: 0.42, sky: ['#8fc7ef', '#dcf0fb'], hill: '#94a8ab', ground: '#96979a', groundEdge: '#5f6265', accent: '#3d5a63' },
  { name: 'The Bazaar',      from: 0.42, to: 0.68, sky: ['#ffcf87', '#fff1d2'], hill: '#e3a05c', ground: '#c98a4b', groundEdge: '#7c4f27', accent: '#d94f3d' },
  { name: 'Village Path',    from: 0.68, to: 0.88, sky: ['#bfe3ab', '#f0fadf'], hill: '#7fae5e', ground: '#8bb95a', groundEdge: '#4f7942', accent: '#c96b2f' },
  { name: "Nani Ghar Lane",  from: 0.88, to: 1.01, sky: ['#ff9a6b', '#ffe0b0'], hill: '#e08a55', ground: '#caa15e', groundEdge: '#8a622f', accent: '#c2452e' },
];

function zoneAt(fraction: number): { zone: Zone; index: number } {
  const idx = ZONES.findIndex(z => fraction >= z.from && fraction < z.to);
  const i = idx === -1 ? ZONES.length - 1 : idx;
  return { zone: ZONES[i], index: i };
}

function lerpColor(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ar = (pa >> 16) & 255, ag = (pa >> 8) & 255, ab = pa & 255;
  const br = (pb >> 16) & 255, bg = (pb >> 8) & 255, bb = pb & 255;
  const r = Math.round(ar + (br - ar) * t), g = Math.round(ag + (bg - ag) * t), bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r},${g},${bl})`;
}

type ObstacleKind = 'pothole' | 'cart' | 'dog';
type CollectKind = 'flower' | 'sweet' | 'coin';

interface Obstacle { id: number; x: number; kind: ObstacleKind; w: number; h: number; hit: boolean; }
interface Collectible { id: number; x: number; y: number; kind: CollectKind; taken: boolean; bob: number; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number; }

let idSeq = 1;

// --- tiny WebAudio synth for jump/collect/hit/win blips (no asset files needed) ---
class Beeper {
  ctx: AudioContext | null = null;
  muted = false;
  ensure() {
    if (!this.ctx) {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    return this.ctx;
  }
  tone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.08, delay = 0) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
  jump() { this.tone(520, 0.14, 'triangle', 0.07); this.tone(760, 0.1, 'triangle', 0.05, 0.03); }
  collect() { this.tone(880, 0.09, 'square', 0.05); this.tone(1180, 0.12, 'square', 0.05, 0.05); }
  hit() { this.tone(160, 0.25, 'sawtooth', 0.09); this.tone(90, 0.3, 'sawtooth', 0.07, 0.05); }
  win() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.28, 'triangle', 0.06, i * 0.11)); }
  gameover() { this.tone(220, 0.2, 'sawtooth', 0.07); this.tone(140, 0.35, 'sawtooth', 0.06, 0.15); }
}

export const JourneyGameView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const beeperRef = useRef<Beeper>(new Beeper());
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef<number>(0);

  const phaseRef = useRef<GamePhase>('ready');
  const [phase, setPhaseState] = useState<GamePhase>('ready');
  const setPhase = (p: GamePhase) => { phaseRef.current = p; setPhaseState(p); };

  const [muted, setMuted] = useState(false);
  const [hearts, setHearts] = useState(HEARTS_MAX);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [zoneToast, setZoneToast] = useState<string | null>(null);
  const [finalStats, setFinalStats] = useState({ score: 0, time: 0, isRecord: false, distancePct: 0 });
  const [highScore, setHighScore] = useState<number>(() => {
    try { return Number(localStorage.getItem(HIGH_SCORE_KEY) || 0); } catch { return 0; }
  });

  // Mutable game state kept in refs so the render loop doesn't fight React.
  const gs = useRef({
    distance: 0,
    speed: 300,
    playerY: GROUND_Y - PLAYER_H,
    velocityY: 0,
    grounded: true,
    runCycle: 0,
    obstacles: [] as Obstacle[],
    collectibles: [] as Collectible[],
    particles: [] as Particle[],
    obstacleTimer: 1.1,
    collectTimer: 0.7,
    hearts: HEARTS_MAX,
    score: 0,
    invincible: 0,
    shakeTime: 0,
    shakeMag: 0,
    zoneIndex: 0,
    startTime: 0,
    flashRed: 0,
  }).current;

  const resetGame = useCallback(() => {
    gs.distance = 0;
    gs.speed = 300;
    gs.playerY = GROUND_Y - PLAYER_H;
    gs.velocityY = 0;
    gs.grounded = true;
    gs.runCycle = 0;
    gs.obstacles = [];
    gs.collectibles = [];
    gs.particles = [];
    gs.obstacleTimer = 1.1;
    gs.collectTimer = 0.6;
    gs.hearts = HEARTS_MAX;
    gs.score = 0;
    gs.invincible = 0;
    gs.shakeTime = 0;
    gs.zoneIndex = 0;
    gs.flashRed = 0;
    gs.startTime = performance.now();
    setHearts(HEARTS_MAX);
    setScore(0);
    setProgress(0);
    setZoneToast(null);
  }, [gs]);

  const doJump = useCallback(() => {
    if (phaseRef.current !== 'playing') return;
    if (gs.grounded) {
      gs.velocityY = JUMP_VELOCITY;
      gs.grounded = false;
      beeperRef.current.jump();
      for (let i = 0; i < 6; i++) {
        gs.particles.push({
          x: PLAYER_X + PLAYER_W / 2, y: GROUND_Y, vx: (Math.random() - 0.5) * 90, vy: -Math.random() * 60,
          life: 0.35, maxLife: 0.35, color: '#c9a876', size: 3 + Math.random() * 2,
        });
      }
    }
  }, [gs]);

  const startGame = useCallback(() => {
    resetGame();
    setPhase('playing');
  }, [resetGame]);

  const togglePause = useCallback(() => {
    if (phaseRef.current === 'playing') setPhase('paused');
    else if (phaseRef.current === 'paused') setPhase('playing');
  }, []);

  // Input handling
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (phaseRef.current === 'ready') startGame();
        else if (phaseRef.current === 'playing') doJump();
        else if (phaseRef.current === 'gameover' || phaseRef.current === 'win') startGame();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        togglePause();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doJump, startGame, togglePause]);

  const onTapCanvas = useCallback(() => {
    if (phaseRef.current === 'ready') startGame();
    else if (phaseRef.current === 'playing') doJump();
    else if (phaseRef.current === 'gameover' || phaseRef.current === 'win') { /* handled by buttons */ }
  }, [doJump, startGame]);

  // Setup canvas resolution once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = WORLD_W * dpr;
    canvas.height = WORLD_H * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  }, []);

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let lastZoneToastIdx = -1;
    let uiTick = 0;

    const spawnObstacle = () => {
      const kinds: ObstacleKind[] = ['pothole', 'cart', 'dog'];
      const kind = kinds[Math.floor(Math.random() * kinds.length)];
      const sizes: Record<ObstacleKind, [number, number]> = { pothole: [46, 12], cart: [58, 46], dog: [32, 26] };
      const [w, h] = sizes[kind];
      gs.obstacles.push({ id: idSeq++, x: WORLD_W + 40, kind, w, h, hit: false });
    };

    const spawnCollectible = () => {
      const kinds: CollectKind[] = ['flower', 'sweet', 'coin'];
      const kind = kinds[Math.floor(Math.random() * kinds.length)];
      const elevated = Math.random() < 0.45;
      const y = elevated ? GROUND_Y - 92 - Math.random() * 20 : GROUND_Y - 22;
      gs.collectibles.push({ id: idSeq++, x: WORLD_W + 40, y, kind, taken: false, bob: Math.random() * Math.PI * 2 });
    };

    const step = (ts: number) => {
      rafRef.current = requestAnimationFrame(step);
      if (!lastTsRef.current) lastTsRef.current = ts;
      let dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      dt = Math.min(dt, 0.05);

      const playing = phaseRef.current === 'playing';

      if (playing) {
        const progressFrac = Math.min(gs.distance / TOTAL_DISTANCE, 1);
        gs.speed = 300 + progressFrac * 260;

        // physics
        gs.velocityY += GRAVITY * dt;
        gs.playerY += gs.velocityY * dt;
        if (gs.playerY >= GROUND_Y - PLAYER_H) {
          gs.playerY = GROUND_Y - PLAYER_H;
          gs.velocityY = 0;
          gs.grounded = true;
        }
        gs.runCycle += dt * (gs.grounded ? 9 : 3);

        // distance & score
        gs.distance += gs.speed * dt;
        gs.score += gs.speed * dt * 0.03;

        // dust while running
        if (gs.grounded && Math.random() < dt * 14) {
          gs.particles.push({
            x: PLAYER_X + 4, y: GROUND_Y - 2, vx: -gs.speed * 0.35 - Math.random() * 30, vy: -Math.random() * 20,
            life: 0.4, maxLife: 0.4, color: '#00000022', size: 2 + Math.random() * 2,
          });
        }

        // spawn timers
        gs.obstacleTimer -= dt;
        if (gs.obstacleTimer <= 0) {
          spawnObstacle();
          const difficulty = Math.min(progressFrac, 1);
          gs.obstacleTimer = 1.5 - difficulty * 0.6 + Math.random() * 0.5;
        }
        gs.collectTimer -= dt;
        if (gs.collectTimer <= 0) {
          spawnCollectible();
          gs.collectTimer = 0.7 + Math.random() * 0.7;
        }

        // move obstacles, collide
        const playerRect = { x: PLAYER_X + 5, y: gs.playerY + 4, w: PLAYER_W - 10, h: PLAYER_H - 6 };
        gs.invincible = Math.max(0, gs.invincible - dt);

        for (const ob of gs.obstacles) {
          ob.x -= gs.speed * dt;
          if (!ob.hit && gs.invincible <= 0) {
            const obRect = { x: ob.x, y: GROUND_Y - ob.h, w: ob.w, h: ob.h };
            const overlap = playerRect.x < obRect.x + obRect.w && playerRect.x + playerRect.w > obRect.x &&
              playerRect.y < obRect.y + obRect.h && playerRect.y + playerRect.h > obRect.y;
            if (overlap) {
              ob.hit = true;
              gs.hearts -= 1;
              gs.invincible = 1.2;
              gs.shakeTime = 0.3;
              gs.shakeMag = 9;
              gs.flashRed = 0.35;
              beeperRef.current.hit();
              setHearts(gs.hearts);
              if (gs.hearts <= 0) {
                setPhase('gameover');
                beeperRef.current.gameover();
                setFinalStats({
                  score: Math.floor(gs.score), time: (performance.now() - gs.startTime) / 1000,
                  isRecord: false, distancePct: Math.round((gs.distance / TOTAL_DISTANCE) * 100),
                });
              }
            }
          }
        }
        gs.obstacles = gs.obstacles.filter(o => o.x > -80);

        for (const c of gs.collectibles) {
          c.x -= gs.speed * dt;
          c.bob += dt * 4;
          if (!c.taken) {
            const cRect = { x: c.x - 12, y: c.y - 12, w: 24, h: 24 };
            const overlap = playerRect.x < cRect.x + cRect.w && playerRect.x + playerRect.w > cRect.x &&
              playerRect.y < cRect.y + cRect.h && playerRect.y + playerRect.h > cRect.y;
            if (overlap) {
              c.taken = true;
              const pts = c.kind === 'sweet' ? 25 : c.kind === 'flower' ? 15 : 10;
              gs.score += pts;
              beeperRef.current.collect();
              const color = c.kind === 'sweet' ? '#f4a261' : c.kind === 'flower' ? '#e879b9' : '#ffd166';
              for (let i = 0; i < 8; i++) {
                const ang = (Math.PI * 2 * i) / 8;
                gs.particles.push({
                  x: c.x, y: c.y, vx: Math.cos(ang) * 90, vy: Math.sin(ang) * 90 - 30,
                  life: 0.45, maxLife: 0.45, color, size: 3,
                });
              }
            }
          }
        }
        gs.collectibles = gs.collectibles.filter(c => c.x > -40);

        // particles
        for (const p of gs.particles) {
          p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 220 * dt; p.life -= dt;
        }
        gs.particles = gs.particles.filter(p => p.life > 0);

        gs.shakeTime = Math.max(0, gs.shakeTime - dt);
        gs.flashRed = Math.max(0, gs.flashRed - dt * 2);

        // zone toast
        const { index } = zoneAt(progressFrac);
        if (index !== lastZoneToastIdx) {
          lastZoneToastIdx = index;
          gs.zoneIndex = index;
          if (index > 0 || progressFrac > 0.001) {
            setZoneToast(ZONES[index].name);
            window.setTimeout(() => setZoneToast(prev => (prev === ZONES[index].name ? null : prev)), 2400);
          }
        }

        // win condition
        if (gs.distance >= TOTAL_DISTANCE) {
          setPhase('win');
          beeperRef.current.win();
          const finalScore = Math.floor(gs.score) + 250; // arrival bonus
          const isRecord = finalScore > highScore;
          if (isRecord) {
            setHighScore(finalScore);
            try { localStorage.setItem(HIGH_SCORE_KEY, String(finalScore)); } catch { /* ignore */ }
          }
          setFinalStats({
            score: finalScore, time: (performance.now() - gs.startTime) / 1000, isRecord, distancePct: 100,
          });
          // celebratory confetti burst
          for (let i = 0; i < 60; i++) {
            gs.particles.push({
              x: WORLD_W / 2 + (Math.random() - 0.5) * 200, y: 60 + Math.random() * 40,
              vx: (Math.random() - 0.5) * 160, vy: -Math.random() * 60,
              life: 1.6 + Math.random(), maxLife: 2.2,
              color: ['#f4a261', '#e879b9', '#ffd166', '#6ee7b7', '#93c5fd'][i % 5], size: 4 + Math.random() * 3,
            });
          }
        }

        // throttled UI sync (score/progress) — every ~4 frames to limit re-renders
        uiTick++;
        if (uiTick % 4 === 0) {
          setScore(Math.floor(gs.score));
          setProgress(Math.min(gs.distance / TOTAL_DISTANCE, 1));
        }
      } else if (phaseRef.current === 'win') {
        // keep confetti alive briefly after win
        for (const p of gs.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 220 * dt; p.life -= dt; }
        gs.particles = gs.particles.filter(p => p.life > 0);
      }

      draw(ctx, gs, phaseRef.current);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highScore]);

  useEffect(() => { beeperRef.current.muted = muted; }, [muted]);

  const { zone: currentZone } = zoneAt(progress);
  const pct = Math.round(progress * 100);

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-900">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Footprints className="w-7 h-7 text-indigo-600" />
            Ume's Journey to Nani Ghar
          </h1>
          <p className="text-slate-500 text-sm">A little study-break adventure — run, jump and collect treats all the way from Home to Nani Ghar.</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-amber-700 text-xs font-bold">
          <Trophy className="w-4 h-4" />
          Best Score: {highScore}
        </div>
      </header>

      {/* Progress rail: Home -> Nani Ghar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-1 text-indigo-600">
            <HomeIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold text-slate-400">HOME</span>
          </div>
          <div className="relative flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-400 transition-all duration-150"
              style={{ width: `${pct}%` }}
            />
            <div
              className="absolute -top-2.5 transition-all duration-150"
              style={{ left: `calc(${pct}% - 10px)` }}
              title="Ume"
            >
              <span className="text-lg leading-none select-none">🏃</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 text-rose-600">
            <Flag className="w-5 h-5" />
            <span className="text-[10px] font-bold text-slate-400">NANI GHAR</span>
          </div>
        </div>
        <div className="text-center text-[11px] font-semibold text-slate-400 mt-1.5">
          {pct}% of the way there — currently in <span className="text-slate-600">{currentZone.name}</span>
        </div>
      </div>

      {/* Game canvas panel */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-black select-none">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: `${WORLD_W} / ${WORLD_H}`, cursor: 'pointer' }}
          onPointerDown={onTapCanvas}
        />

        {/* HUD: hearts + score + controls, shown while playing/paused */}
        {(phase === 'playing' || phase === 'paused') && (
          <div className="absolute top-0 inset-x-0 flex items-start justify-between p-3 sm:p-4 pointer-events-none">
            <div className="flex gap-1.5 bg-black/30 backdrop-blur px-3 py-1.5 rounded-full">
              {Array.from({ length: HEARTS_MAX }).map((_, i) => (
                <Heart key={i} className={`w-5 h-5 ${i < hearts ? 'text-rose-500 fill-rose-500' : 'text-white/25'}`} />
              ))}
            </div>
            <div className="flex items-center gap-2 pointer-events-auto">
              <div className="bg-black/30 backdrop-blur px-3 py-1.5 rounded-full text-white font-bold text-sm tabular-nums">
                {score} pts
              </div>
              <button
                onClick={() => setMuted(m => !m)}
                className="bg-black/30 backdrop-blur p-2 rounded-full text-white hover:bg-black/50 transition-colors"
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={togglePause}
                className="bg-black/30 backdrop-blur p-2 rounded-full text-white hover:bg-black/50 transition-colors"
              >
                {phase === 'playing' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Zone toast */}
        {zoneToast && (phase === 'playing') && (
          <div className="absolute top-16 inset-x-0 flex justify-center pointer-events-none">
            <div className="bg-black/45 backdrop-blur text-white text-xs sm:text-sm font-bold tracking-wide px-4 py-1.5 rounded-full animate-pulse">
              Entering {zoneToast}…
            </div>
          </div>
        )}

        {/* Mobile jump button */}
        {phase === 'playing' && (
          <button
            onPointerDown={(e) => { e.stopPropagation(); doJump(); }}
            className="absolute bottom-4 right-4 sm:hidden bg-white/90 text-indigo-700 font-extrabold text-sm px-5 py-3 rounded-full shadow-lg active:scale-95 transition-transform"
          >
            JUMP
          </button>
        )}

        {/* Ready overlay */}
        {phase === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-sky-400/90 via-sky-200/90 to-amber-100/90 text-center px-6">
            <div className="text-5xl">🧒🏡</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">Ready to head to Nani Ghar?</h2>
            <p className="text-slate-700 max-w-md text-sm sm:text-base">
              Jump over potholes, carts and stray dogs. Collect flowers, sweets and coins along the way.
              Reach the end with hearts to spare!
            </p>
            <button
              onClick={startGame}
              className="mt-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              Start Journey
            </button>
            <p className="text-[11px] text-slate-600 font-medium">
              Space / ↑ or tap to jump · P to pause
            </p>
          </div>
        )}

        {/* Paused overlay */}
        {phase === 'paused' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900/70 text-center px-6">
            <h2 className="text-2xl font-extrabold text-white">Paused</h2>
            <div className="flex gap-3">
              <button onClick={togglePause} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2">
                <Play className="w-4 h-4" /> Resume
              </button>
              <button onClick={startGame} className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Restart
              </button>
            </div>
          </div>
        )}

        {/* Game over overlay */}
        {phase === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/85 text-center px-6">
            <div className="text-4xl">🙈</div>
            <h2 className="text-2xl font-extrabold text-white">Ouch! The journey got bumpy.</h2>
            <p className="text-slate-300 text-sm">
              You made it {finalStats.distancePct}% of the way, scoring {finalStats.score} points.
            </p>
            <div className="flex gap-3 mt-2">
              <button onClick={startGame} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
            </div>
          </div>
        )}

        {/* Win overlay */}
        {phase === 'win' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-orange-400/90 to-amber-200/90 text-center px-6">
            <PartyPopper className="w-12 h-12 text-white drop-shadow" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow">You've reached Nani Ghar! 🏡💛</h2>
            <p className="text-slate-800 font-medium text-sm sm:text-base">
              Score: <span className="font-extrabold">{finalStats.score}</span> · Time: {finalStats.time.toFixed(1)}s
              {finalStats.isRecord && <span className="ml-2 inline-flex items-center gap-1 text-amber-900 font-extrabold"><Trophy className="w-4 h-4" /> New Best!</span>}
            </p>
            <button
              onClick={startGame}
              className="mt-1 bg-white text-orange-600 font-extrabold px-8 py-3 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function draw(ctx: CanvasRenderingContext2D, gs: any, phase: GamePhase) {
  const progressFrac = Math.min(gs.distance / TOTAL_DISTANCE, 1);
  const { zone, index } = zoneAt(progressFrac);
  const nextZone = ZONES[Math.min(index + 1, ZONES.length - 1)];
  const zoneLocalT = zone.to > zone.from ? Math.min(1, Math.max(0, (progressFrac - zone.from) / (zone.to - zone.from))) : 0;

  const skyTop = lerpColor(zone.sky[0], nextZone.sky[0], zoneLocalT * 0.3);
  const skyBot = lerpColor(zone.sky[1], nextZone.sky[1], zoneLocalT * 0.3);
  const groundColor = lerpColor(zone.ground, nextZone.ground, zoneLocalT * 0.3);
  const groundEdge = lerpColor(zone.groundEdge, nextZone.groundEdge, zoneLocalT * 0.3);
  const hillColor = lerpColor(zone.hill, nextZone.hill, zoneLocalT * 0.3);

  ctx.save();
  ctx.clearRect(0, 0, WORLD_W, WORLD_H);

  // camera shake
  if (gs.shakeTime > 0) {
    const m = gs.shakeMag * (gs.shakeTime / 0.3);
    ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
  }

  // sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  skyGrad.addColorStop(0, skyTop);
  skyGrad.addColorStop(1, skyBot);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(-20, 0, WORLD_W + 40, GROUND_Y);

  // sun
  ctx.beginPath();
  ctx.fillStyle = 'rgba(255,244,214,0.9)';
  ctx.arc(WORLD_W - 90, 70, 34, 0, Math.PI * 2);
  ctx.fill();

  // far hills (slow parallax)
  const hillOffset = -(gs.distance * 0.04) % 300;
  ctx.fillStyle = hillColor;
  for (let i = -1; i < 5; i++) {
    const bx = hillOffset + i * 300;
    ctx.beginPath();
    ctx.moveTo(bx, GROUND_Y - 30);
    ctx.quadraticCurveTo(bx + 90, GROUND_Y - 120, bx + 180, GROUND_Y - 30);
    ctx.quadraticCurveTo(bx + 240, GROUND_Y - 70, bx + 300, GROUND_Y - 30);
    ctx.fill();
  }

  // mid parallax silhouettes (buildings/trees depending on zone)
  const midOffset = -(gs.distance * 0.22) % 220;
  ctx.fillStyle = 'rgba(0,0,0,0.14)';
  for (let i = -1; i < 6; i++) {
    const bx = midOffset + i * 220;
    if (index <= 1) {
      // houses / buildings
      ctx.fillRect(bx, GROUND_Y - 90, 60, 90);
      ctx.fillRect(bx + 70, GROUND_Y - 130, 50, 130);
      ctx.beginPath(); ctx.moveTo(bx, GROUND_Y - 90); ctx.lineTo(bx + 30, GROUND_Y - 115); ctx.lineTo(bx + 60, GROUND_Y - 90); ctx.fill();
    } else if (index === 2) {
      // bazaar stalls with flag bunting
      ctx.fillRect(bx, GROUND_Y - 60, 70, 60);
      ctx.fillStyle = zone.accent + '99';
      ctx.beginPath(); ctx.moveTo(bx - 6, GROUND_Y - 60); ctx.lineTo(bx + 76, GROUND_Y - 60); ctx.lineTo(bx + 35, GROUND_Y - 85); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.14)';
    } else {
      // trees
      ctx.beginPath(); ctx.arc(bx + 20, GROUND_Y - 90, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(bx + 15, GROUND_Y - 66, 10, 40);
    }
  }

  // ground
  ctx.fillStyle = groundColor;
  ctx.fillRect(-20, GROUND_Y, WORLD_W + 40, WORLD_H - GROUND_Y);
  ctx.fillStyle = groundEdge;
  ctx.fillRect(-20, GROUND_Y, WORLD_W + 40, 4);
  // road markings / texture (fast parallax)
  const nearOffset = -(gs.distance * 1.0) % 60;
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  for (let i = -1; i < 20; i++) {
    ctx.fillRect(nearOffset + i * 60, GROUND_Y + 14, 26, 4);
  }

  // obstacles
  for (const ob of gs.obstacles) drawObstacle(ctx, ob, zone);

  // collectibles
  for (const c of gs.collectibles) if (!c.taken) drawCollectible(ctx, c);

  // particles
  for (const p of gs.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;

  // player (blink while invincible)
  const blinkHidden = gs.invincible > 0 && Math.floor(gs.invincible * 14) % 2 === 0;
  if (!blinkHidden) drawPlayer(ctx, gs);

  // red damage flash
  if (gs.flashRed > 0) {
    ctx.fillStyle = `rgba(220,38,38,${Math.min(0.35, gs.flashRed)})`;
    ctx.fillRect(-20, 0, WORLD_W + 40, WORLD_H);
  }

  // Nani Ghar house appears near the finish
  if (progressFrac > 0.9) {
    const houseX = WORLD_W - (progressFrac - 0.9) / 0.1 * (WORLD_W - 40) - 60;
    drawHouse(ctx, houseX, GROUND_Y);
  }

  ctx.restore();
}

function drawPlayer(ctx: CanvasRenderingContext2D, gs: any) {
  const x = PLAYER_X, y = gs.playerY;
  const legSwing = gs.grounded ? Math.sin(gs.runCycle) * 16 : 6;
  const armSwing = gs.grounded ? Math.sin(gs.runCycle + Math.PI) * 14 : -10;

  ctx.save();
  ctx.translate(x, y);

  // back leg
  ctx.strokeStyle = '#3b3b57'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(16, 34); ctx.lineTo(16 - legSwing * 0.5, 52); ctx.stroke();
  // front leg
  ctx.beginPath(); ctx.moveTo(16, 34); ctx.lineTo(16 + legSwing * 0.5, 52); ctx.stroke();

  // torso (kurta style tunic)
  ctx.fillStyle = '#f4a261';
  ctx.beginPath();
  ctx.moveTo(6, 16); ctx.lineTo(26, 16); ctx.lineTo(30, 38); ctx.lineTo(2, 38); ctx.closePath(); ctx.fill();

  // arms
  ctx.strokeStyle = '#e08a4f'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(8, 20); ctx.lineTo(8 - armSwing * 0.4, 34); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(24, 20); ctx.lineTo(24 + armSwing * 0.4, 34); ctx.stroke();

  // head
  ctx.fillStyle = '#3a2a1e';
  ctx.beginPath(); ctx.arc(16, 6, 5, Math.PI, 0); ctx.fill(); // hair
  ctx.fillStyle = '#f2c29a';
  ctx.beginPath(); ctx.arc(16, 8, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2a2a2a';
  ctx.beginPath(); ctx.arc(19.5, 7.5, 1.3, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}

function drawObstacle(ctx: CanvasRenderingContext2D, ob: Obstacle, zone: Zone) {
  const y = GROUND_Y;
  ctx.save();
  ctx.translate(ob.x, y);
  if (ob.kind === 'pothole') {
    ctx.fillStyle = '#00000055';
    ctx.beginPath();
    ctx.ellipse(ob.w / 2, -2, ob.w / 2, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (ob.kind === 'cart') {
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(0, -ob.h + 14, ob.w, ob.h - 14);
    ctx.fillStyle = zone.accent;
    ctx.fillRect(-4, -ob.h, ob.w + 8, 10);
    ctx.fillStyle = '#3b3b3b';
    ctx.beginPath(); ctx.arc(10, 0, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(ob.w - 10, 0, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#cbb994';
    ctx.beginPath(); ctx.arc(10, 0, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(ob.w - 10, 0, 3, 0, Math.PI * 2); ctx.fill();
  } else if (ob.kind === 'dog') {
    ctx.fillStyle = '#a8734a';
    ctx.beginPath(); ctx.ellipse(ob.w / 2, -ob.h / 2, ob.w / 2, ob.h / 2.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(ob.w - 6, -ob.h + 6, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7a5233';
    ctx.fillRect(4, -6, 5, 8);
    ctx.fillRect(ob.w - 12, -6, 5, 8);
  }
  ctx.restore();
}

function drawCollectible(ctx: CanvasRenderingContext2D, c: Collectible) {
  const bobY = c.y + Math.sin(c.bob) * 4;
  ctx.save();
  ctx.translate(c.x, bobY);
  if (c.kind === 'coin') {
    ctx.fillStyle = '#ffd166';
    ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#e0a422'; ctx.lineWidth = 2; ctx.stroke();
  } else if (c.kind === 'flower') {
    ctx.fillStyle = '#e879b9';
    for (let i = 0; i < 5; i++) {
      const ang = (Math.PI * 2 * i) / 5;
      ctx.beginPath(); ctx.ellipse(Math.cos(ang) * 6, Math.sin(ang) * 6, 4, 5, ang, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#ffd166';
    ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillStyle = '#f4a261';
    ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c97a30'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-6, -2); ctx.lineTo(6, -2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-6, 2); ctx.lineTo(6, 2); ctx.stroke();
  }
  ctx.restore();
}

function drawHouse(ctx: CanvasRenderingContext2D, x: number, groundY: number) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.fillStyle = '#e6c48a';
  ctx.fillRect(0, -70, 80, 70);
  ctx.fillStyle = '#c2452e';
  ctx.beginPath(); ctx.moveTo(-10, -70); ctx.lineTo(40, -110); ctx.lineTo(90, -70); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#7a4b2b';
  ctx.fillRect(32, -38, 18, 38);
  ctx.fillStyle = '#bfe3ff';
  ctx.fillRect(10, -55, 14, 14);
  ctx.fillRect(56, -55, 14, 14);
  ctx.restore();
}

export default JourneyGameView;

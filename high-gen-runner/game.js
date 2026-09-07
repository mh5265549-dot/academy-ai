(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const W = canvas.width;
  const H = canvas.height;
  const GROUND_Y = H - 56;

  const scoreEl = document.getElementById("score");
  const genEl = document.getElementById("gen");
  const bestEl = document.getElementById("best");
  const overlay = document.getElementById("overlay");
  const gameoverEl = document.getElementById("gameover");
  const finalStatsEl = document.getElementById("final-stats");
  const startBtn = document.getElementById("start-btn");
  const retryBtn = document.getElementById("retry-btn");
  const genBanner = document.getElementById("gen-banner");
  const btnJump = document.getElementById("btn-jump");
  const btnDuck = document.getElementById("btn-duck");
  const cabinet = document.getElementById("cabinet");

  const STORAGE_KEY = "highGenRunner.best";
  const GEN_SCORE_STEP = 500; // score needed per generation bump
  const BASE_SPEED = 5.2;
  const SPEED_PER_GEN = 0.55;
  const GRAVITY = 0.62;
  const JUMP_VELOCITY = -12.4;

  const PALETTES = [
    { top: "#0f1226", bottom: "#1c2148", accent: "#7dd3fc", ground: "#2a2f5c" },
    { top: "#141225", bottom: "#2a1440", accent: "#f472b6", ground: "#3a1d55" },
    { top: "#0c1a20", bottom: "#123a3a", accent: "#34d399", ground: "#0f2e2e" },
    { top: "#1a1206", bottom: "#3a230f", accent: "#fbbf24", ground: "#3f2a12" },
    { top: "#160c22", bottom: "#33123f", accent: "#c084fc", ground: "#2c1140" },
    { top: "#06121a", bottom: "#0f2b3d", accent: "#38bdf8", ground: "#0d2436" },
  ];

  function paletteFor(gen) {
    return PALETTES[(gen - 1) % PALETTES.length];
  }

  function syncCabinetGlow(g) {
    cabinet.style.setProperty("--accent-live", paletteFor(g).accent);
  }

  let state = "idle"; // idle | running | over

  let player, obstacles, particles;
  let speed, distance, score, gen, best;
  let spawnTimer, lastTime, elapsed;
  let duckHeld = false;

  function resetGame() {
    player = {
      x: 90,
      y: GROUND_Y - 46,
      w: 34,
      h: 46,
      vy: 0,
      ducking: false,
      onGround: true,
      legPhase: 0,
    };
    obstacles = [];
    particles = [];
    speed = BASE_SPEED;
    distance = 0;
    score = 0;
    gen = 1;
    spawnTimer = 60;
    elapsed = 0;
    best = Number(localStorage.getItem(STORAGE_KEY) || 0);
    bestEl.textContent = "BEST " + best;
    syncCabinetGlow(gen);
    updateHud();
  }

  function updateHud() {
    scoreEl.textContent = "SCORE " + Math.floor(score);
    genEl.textContent = "GEN " + gen;
  }

  function playerHitbox() {
    if (player.ducking) {
      return { x: player.x, y: GROUND_Y - 26, w: player.w + 10, h: 26 };
    }
    return { x: player.x, y: player.y, w: player.w, h: player.h };
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function spawnObstacle() {
    const flying = gen >= 2 && Math.random() < Math.min(0.2 + gen * 0.03, 0.45);
    if (flying) {
      const size = 30;
      obstacles.push({
        type: "flying",
        x: W + 20,
        y: GROUND_Y - 46 - 34, // height that only clears a ducking player
        w: size,
        h: size * 0.6,
        wingPhase: Math.random() * Math.PI * 2,
      });
    } else {
      const cluster = Math.random() < Math.min(0.15 + gen * 0.04, 0.5) ? 2 : 1;
      const size = 22 + Math.random() * 14;
      for (let i = 0; i < cluster; i++) {
        obstacles.push({
          type: "block",
          x: W + 20 + i * (size + 6),
          y: GROUND_Y - size,
          w: size,
          h: size,
        });
      }
    }
  }

  function maybeBumpGeneration() {
    const targetGen = 1 + Math.floor(score / GEN_SCORE_STEP);
    if (targetGen > gen) {
      gen = targetGen;
      speed = BASE_SPEED + (gen - 1) * SPEED_PER_GEN;
      syncCabinetGlow(gen);
      announceGen(gen);
    }
  }

  function announceGen(g) {
    genBanner.textContent = "GENERATION " + g;
    genBanner.classList.remove("hidden");
    void genBanner.offsetWidth; // restart CSS animation
    genBanner.style.animation = "none";
    requestAnimationFrame(() => {
      genBanner.style.animation = "";
    });
    setTimeout(() => genBanner.classList.add("hidden"), 1100);
  }

  function spawnDustParticle() {
    particles.push({
      x: player.x + player.w / 2,
      y: GROUND_Y - 2,
      vx: -speed * 0.4 - Math.random(),
      vy: -Math.random() * 0.6,
      life: 1,
    });
  }

  function jump() {
    if (state !== "running") return;
    if (player.onGround) {
      player.vy = JUMP_VELOCITY;
      player.onGround = false;
    }
  }

  function setDuck(down) {
    duckHeld = down;
  }

  function update(dt) {
    elapsed += dt;
    distance += speed * dt * 0.06;
    score += speed * dt * 0.06;
    maybeBumpGeneration();
    updateHud();

    // player physics
    player.ducking = duckHeld && player.onGround;
    player.vy += GRAVITY * dt;
    player.y += player.vy * dt;
    if (player.y >= GROUND_Y - player.h) {
      player.y = GROUND_Y - player.h;
      player.vy = 0;
      player.onGround = true;
    } else {
      player.onGround = false;
    }
    if (player.onGround && !player.ducking) {
      player.legPhase += dt * 0.35 * (speed / BASE_SPEED);
      if (Math.random() < 0.3) spawnDustParticle();
    }

    // obstacles
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnObstacle();
      const gap = Math.max(46 - gen * 1.5, 24);
      spawnTimer = gap + Math.random() * 30;
    }

    const hitbox = playerHitbox();
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const o = obstacles[i];
      o.x -= speed * dt;
      if (o.type === "flying") o.wingPhase += dt * 0.3;
      if (o.x + o.w < -20) {
        obstacles.splice(i, 1);
        continue;
      }
      if (rectsOverlap(hitbox, o)) {
        endGame();
        return;
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt * 0.03;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function drawBackground() {
    const pal = paletteFor(gen);
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, pal.top);
    grad.addColorStop(1, pal.bottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // parallax stars/dots
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    const starCount = 40;
    for (let i = 0; i < starCount; i++) {
      const sx = (i * 137 - distance * 0.15) % (W + 40);
      const x = sx < 0 ? sx + W + 40 : sx;
      const y = (i * 53) % (GROUND_Y - 20);
      ctx.globalAlpha = 0.15 + ((i * 29) % 10) / 40;
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1;

    // ground
    ctx.fillStyle = pal.ground;
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.strokeStyle = pal.accent;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(W, GROUND_Y);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // scrolling ground ticks
    ctx.fillStyle = pal.accent;
    ctx.globalAlpha = 0.35;
    const tickSpacing = 40;
    const offset = distance % tickSpacing;
    for (let x = -offset; x < W; x += tickSpacing) {
      ctx.fillRect(x, GROUND_Y + 8, 18, 3);
    }
    ctx.globalAlpha = 1;
  }

  function drawPlayer() {
    const pal = paletteFor(gen);
    const p = player;
    ctx.save();
    if (p.ducking) {
      const h = 26;
      const y = GROUND_Y - h;
      ctx.fillStyle = pal.accent;
      roundRect(ctx, p.x, y, p.w + 10, h, 8);
      ctx.fill();
      ctx.fillStyle = "#05060f";
      ctx.fillRect(p.x + p.w - 6, y + 6, 6, 6);
    } else {
      ctx.fillStyle = pal.accent;
      roundRect(ctx, p.x, p.y, p.w, p.h, 9);
      ctx.fill();
      // visor
      ctx.fillStyle = "#05060f";
      ctx.fillRect(p.x + 6, p.y + 8, p.w - 14, 8);
      // legs
      if (p.onGround) {
        const swing = Math.sin(p.legPhase) * 8;
        ctx.strokeStyle = pal.accent;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(p.x + 8, p.y + p.h);
        ctx.lineTo(p.x + 8 + swing, p.y + p.h + 10);
        ctx.moveTo(p.x + p.w - 8, p.y + p.h);
        ctx.lineTo(p.x + p.w - 8 - swing, p.y + p.h + 10);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawObstacles() {
    const pal = paletteFor(gen);
    for (const o of obstacles) {
      if (o.type === "flying") {
        ctx.fillStyle = pal.accent;
        ctx.save();
        ctx.translate(o.x + o.w / 2, o.y + o.h / 2);
        const flap = Math.sin(o.wingPhase) * 6;
        ctx.beginPath();
        ctx.ellipse(0, 0, o.w / 2, o.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = pal.accent;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-o.w / 2, 0);
        ctx.lineTo(-o.w / 2 - 10, -flap);
        ctx.moveTo(o.w / 2, 0);
        ctx.lineTo(o.w / 2 + 10, -flap);
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.fillStyle = "#f1f5f9";
        roundRect(ctx, o.x, o.y, o.w, o.h, 4);
        ctx.fill();
        ctx.strokeStyle = paletteFor(gen).accent;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.globalAlpha = Math.max(p.life, 0) * 0.5;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(p.x, p.y, 3, 3);
    }
    ctx.globalAlpha = 1;
  }

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    drawBackground();
    drawParticles();
    drawObstacles();
    drawPlayer();
  }

  function loop(t) {
    if (lastTime == null) lastTime = t;
    const dt = Math.min((t - lastTime) / 16.6667, 3); // normalized to ~60fps steps, capped
    lastTime = t;

    if (state === "running") {
      update(dt);
    }
    render();
    requestAnimationFrame(loop);
  }

  function startGame() {
    resetGame();
    state = "running";
    overlay.classList.remove("show");
    overlay.classList.add("hidden");
    gameoverEl.classList.add("hidden");
    lastTime = null;
  }

  function endGame() {
    state = "over";
    const finalScore = Math.floor(score);
    if (finalScore > best) {
      best = finalScore;
      localStorage.setItem(STORAGE_KEY, String(best));
    }
    bestEl.textContent = "BEST " + best;
    finalStatsEl.textContent =
      "Score " + finalScore + "  ·  Reached Generation " + gen + "  ·  Best " + best;
    gameoverEl.classList.remove("hidden");
  }

  // --- input ---
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "ArrowUp") {
      e.preventDefault();
      if (state === "idle") startGame();
      else if (state === "over") startGame();
      else jump();
    } else if (e.code === "ArrowDown") {
      e.preventDefault();
      setDuck(true);
    }
  });
  window.addEventListener("keyup", (e) => {
    if (e.code === "ArrowDown") setDuck(false);
  });

  startBtn.addEventListener("click", startGame);
  retryBtn.addEventListener("click", startGame);

  btnJump.addEventListener("click", () => {
    if (state !== "running") startGame();
    else jump();
  });
  btnJump.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      if (state !== "running") startGame();
      else jump();
    },
    { passive: false }
  );

  let duckTouchActive = false;
  const startDuck = (e) => {
    e.preventDefault();
    duckTouchActive = true;
    setDuck(true);
  };
  const endDuck = (e) => {
    if (e) e.preventDefault();
    duckTouchActive = false;
    setDuck(false);
  };
  btnDuck.addEventListener("mousedown", startDuck);
  btnDuck.addEventListener("mouseup", endDuck);
  btnDuck.addEventListener("mouseleave", endDuck);
  btnDuck.addEventListener("touchstart", startDuck, { passive: false });
  btnDuck.addEventListener("touchend", endDuck, { passive: false });

  // tap canvas: top half = jump, bottom half held = duck
  canvas.addEventListener(
    "touchstart",
    (e) => {
      if (state !== "running") {
        startGame();
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const y = e.touches[0].clientY - rect.top;
      if (y < rect.height * 0.55) {
        jump();
      } else {
        setDuck(true);
      }
    },
    { passive: true }
  );
  canvas.addEventListener("touchend", () => setDuck(false), { passive: true });

  canvas.addEventListener("click", () => {
    if (state !== "running") startGame();
    else jump();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state === "running") {
      // soft-pause by treating as if time didn't pass much; simplest: leave running,
      // browser throttles rAF anyway. No action needed.
    }
  });

  resetGame();
  requestAnimationFrame(loop);
})();

import React, { useEffect, useRef, useState, useCallback } from 'react';

const W = 420;
const H = 680;

function rand(a, b) { return a + Math.random() * (b - a); }
function randInt(a, b) { return Math.floor(rand(a, b + 1)); }
function choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const NEBULA_COLORS = [
  'rgba(180, 80, 255,',
  'rgba(255, 80, 160,',
  'rgba(80, 200, 255,',
  'rgba(255, 140, 40,',
  'rgba(80, 255, 180,',
  'rgba(255, 255, 120,',
];

function buildMilkyWay() {
  const stars = [];
  for (let i = 0; i < 800; i++) {
    const t    = Math.random();
    const bx   = W * 0.10 + t * W * 0.80;
    const by   = H * 0.02 + t * H * 0.95;
    const perp = rand(-80, 80);
    stars.push({
      x:   bx + perp * 0.5,
      y:   by - perp * 0.9,
      r:   rand(0.5, 3.0),
      a:   rand(0.4, 1.0),
      col: Math.random() < 0.35 ? choice(NEBULA_COLORS) : 'rgba(220, 225, 255,',
    });
  }
  for (let i = 0; i < 40; i++) {
    const t  = Math.random();
    const bx = W * 0.10 + t * W * 0.80;
    const by = H * 0.02 + t * H * 0.95;
    stars.push({
      x: bx + rand(-40, 40), y: by + rand(-40, 40),
      r: rand(2.5, 5.0), a: rand(0.7, 1.0),
      col: 'rgba(255, 255, 255,',
    });
  }
  for (let i = 0; i < 150; i++) {
    stars.push({
      x: rand(0, W), y: rand(0, H),
      r: rand(0.3, 1.8), a: rand(0.2, 0.7),
      col: Math.random() < 0.2 ? choice(NEBULA_COLORS) : 'rgba(200, 210, 255,',
    });
  }
  return stars;
}

function buildNebulaClouds() {
  return [
    { x: W * 0.4,  y: H * 0.35, r: 200, col: 'rgba(140, 40, 255,',  a: 0.22 },
    { x: W * 0.6,  y: H * 0.25, r: 150, col: 'rgba(180, 80, 255,',  a: 0.18 },
    { x: W * 0.3,  y: H * 0.55, r: 130, col: 'rgba(255, 60, 180,',  a: 0.14 },
    { x: W * 0.7,  y: H * 0.65, r: 120, col: 'rgba(60, 160, 255,',  a: 0.13 },
    { x: W * 0.45, y: H * 0.42, r: 100, col: 'rgba(255, 180, 255,', a: 0.16 },
    { x: W * 0.2,  y: H * 0.75, r: 90,  col: 'rgba(40, 220, 200,',  a: 0.10 },
  ];
}

// ── Factories — all objects reset themselves when they leave the screen ────────

function makeStar() {
  const angle = rand(-0.6, -0.3);
  const speed = rand(280, 480);
  return {
    x: rand(-50, W + 50), y: rand(-20, H * 0.5),
    vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
    len: rand(80, 160), width: rand(1.5, 3.0), a: rand(0.7, 1.0),
    col: Math.random() < 0.4 ? choice(NEBULA_COLORS) : 'rgba(255, 255, 255,',
    born: null, life: rand(0.8, 1.6),
  };
}

function resetStar(st, now) {
  const angle  = rand(-0.6, -0.3);
  const speed  = rand(280, 480);
  st.x     = rand(-50, W + 50);
  st.y     = rand(-20, H * 0.3);
  st.vx    = Math.cos(angle) * speed;
  st.vy    = Math.sin(angle) * speed;
  st.len   = rand(80, 160);
  st.width = rand(1.5, 3.0);
  st.a     = rand(0.7, 1.0);
  st.col   = Math.random() < 0.4 ? choice(NEBULA_COLORS) : 'rgba(255, 255, 255,';
  st.born  = now + rand(200, 2000); // stagger respawn
  st.life  = rand(0.8, 1.6);
}

function makeComet() {
  const fromLeft = Math.random() < 0.5;
  const angle    = fromLeft ? rand(-0.25, 0.25) : rand(Math.PI - 0.25, Math.PI + 0.25);
  const speed    = rand(80, 140);
  return {
    x: fromLeft ? -60 : W + 60,
    y: rand(H * 0.1, H * 0.7),
    vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
    len: rand(160, 280), width: rand(6, 12),
    col: choice(NEBULA_COLORS), a: rand(0.7, 1.0),
    born: null, life: rand(3.0, 5.0), angle,
    fromLeft,
  };
}

function resetComet(c, now) {
  c.fromLeft = Math.random() < 0.5;
  const angle  = c.fromLeft ? rand(-0.25, 0.25) : rand(Math.PI - 0.25, Math.PI + 0.25);
  const speed  = rand(80, 140);
  c.x     = c.fromLeft ? -60 : W + 60;
  c.y     = rand(H * 0.1, H * 0.7);
  c.vx    = Math.cos(angle) * speed;
  c.vy    = Math.sin(angle) * speed;
  c.len   = rand(160, 280);
  c.width = rand(6, 12);
  c.col   = choice(NEBULA_COLORS);
  c.a     = rand(0.7, 1.0);
  c.angle = angle;
  c.born  = now + rand(500, 3000);
  c.life  = rand(3.0, 5.0);
}

const ASTEROID_EMOJI = ['🪨', '🪨', '🌑'];
function makeAsteroid() {
  const fromLeft = Math.random() < 0.5;
  return {
    x: fromLeft ? -40 : W + 40,
    y: rand(H * 0.05, H * 0.85),
    vx: (fromLeft ? 1 : -1) * rand(35, 70),
    vy: rand(-20, 20),
    size: rand(28, 52), rot: 0, rotSpd: rand(-1.5, 1.5),
    emoji: choice(ASTEROID_EMOJI),
    born: null, life: rand(4, 7), fromLeft,
  };
}

function resetAsteroid(a, now) {
  a.fromLeft = Math.random() < 0.5;
  a.x        = a.fromLeft ? -40 : W + 40;
  a.y        = rand(H * 0.05, H * 0.85);
  a.vx       = (a.fromLeft ? 1 : -1) * rand(35, 70);
  a.vy       = rand(-20, 20);
  a.size     = rand(28, 52);
  a.rot      = 0;
  a.rotSpd   = rand(-1.5, 1.5);
  a.emoji    = choice(ASTEROID_EMOJI);
  a.born     = now + rand(300, 2000);
  a.life     = rand(4, 7);
}

const DEBRIS_EMOJI = ['🛸', '🛰️', '⚙️', '🔩', '💫'];
function makeDebris() {
  const fromLeft = Math.random() < 0.5;
  return {
    x: fromLeft ? -40 : W + 40,
    y: rand(H * 0.1, H * 0.9),
    vx: (fromLeft ? 1 : -1) * rand(15, 35),
    vy: rand(-10, 10),
    size: rand(14, 28), rot: rand(0, Math.PI * 2), rotSpd: rand(-0.8, 0.8),
    emoji: choice(DEBRIS_EMOJI), born: null, life: rand(6, 10), a: rand(0.5, 0.9),
    fromLeft,
  };
}

function resetDebris(d, now) {
  d.fromLeft = Math.random() < 0.5;
  d.x        = d.fromLeft ? -40 : W + 40;
  d.y        = rand(H * 0.1, H * 0.9);
  d.vx       = (d.fromLeft ? 1 : -1) * rand(15, 35);
  d.vy       = rand(-10, 10);
  d.size     = rand(14, 28);
  d.rot      = rand(0, Math.PI * 2);
  d.rotSpd   = rand(-0.8, 0.8);
  d.emoji    = choice(DEBRIS_EMOJI);
  d.born     = now + rand(500, 3000);
  d.life     = rand(6, 10);
  d.a        = rand(0.5, 0.9);
}

function makeSpaceship() {
  return {
    x:    W * rand(0.25, 0.65),
    y:    H + 80,
    vy:   -rand(55, 75),
    vx:   rand(-8, 8),
    size: H * 0.25,
    born: null,
    life: 8.0,
  };
}

function resetSpaceship(sh, now) {
  sh.x    = W * rand(0.25, 0.65);
  sh.y    = H + 80;
  sh.vy   = -rand(55, 75);
  sh.vx   = rand(-8, 8);
  sh.born = now + rand(500, 1500);
}

// ── Main Component ────────────────────────────────────────────────────────────
function MilkyWayCelebration({ score, total, onComplete, speak }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef(null);
  const rafRef    = useRef(null);

  const [showCard,    setShowCard]    = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
  const perf = accuracy === 100 ? { emoji:'👑', text:'PERFECT!',   color:'#FFD700' }
             : accuracy >= 80   ? { emoji:'🌟', text:'EXCELLENT!',  color:'#4CAF50' }
             : accuracy >= 60   ? { emoji:'⭐', text:'GREAT JOB!',  color:'#2196F3' }
             :                    { emoji:'💪', text:'KEEP GOING!', color:'#FF9800' };

  const handleComplete = useCallback((action) => {
    onComplete && onComplete(action);
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const milkyWay     = buildMilkyWay();
    const nebulaClouds = buildNebulaClouds();

    const now0 = performance.now();

    // Pre-populate with staggered born times so objects appear immediately
    const shootingStars = Array.from({ length: 6 },  (_, i) => { const s = makeStar();     s.born = now0 + i * 400;  return s; });
    const comets        = Array.from({ length: 4 },  (_, i) => { const c = makeComet();    c.born = now0 + i * 900;  return c; });
    const asteroids     = Array.from({ length: 5 },  (_, i) => { const a = makeAsteroid(); a.born = now0 + i * 600;  return a; });
    const debrisItems   = Array.from({ length: 4 },  (_, i) => { const d = makeDebris();   d.born = now0 + i * 800;  return d; });
    const spaceships    = Array.from({ length: 1 },  ()     => { const s = makeSpaceship(); s.born = now0 + 400;      return s; });

    const CARD_DELAY = 4000;

    stateRef.current = {
      startTime: now0,
      milkyWay, nebulaClouds,
      shootingStars, comets, asteroids, debrisItems, spaceships,
    };

    function drawFrame(now) {
      const s = stateRef.current;
      if (!s) return;

      ctx.clearRect(0, 0, W, H);

      // ── Nebula clouds ──
      for (const c of s.nebulaClouds) {
        const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
        grad.addColorStop(0,   `${c.col}${c.a})`);
        grad.addColorStop(0.4, `${c.col}${c.a * 0.6})`);
        grad.addColorStop(1,   `${c.col}0)`);
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fill();
      }

      // ── Milky Way stars ──
      for (const star of s.milkyWay) {
        ctx.beginPath(); ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `${star.col}${star.a})`; ctx.fill();
      }

      // ── Shooting stars ──
      for (const st of s.shootingStars) {
        if (!st.born || now < st.born) continue;
        const age  = (now - st.born) / 1000;
        const frac = age / st.life;
        if (frac > 1) { resetStar(st, now); continue; }
        const alpha = st.a * (1 - frac);
        const x  = st.x + st.vx * age;
        const y  = st.y + st.vy * age;
        const tx = x - Math.cos(Math.atan2(st.vy, st.vx)) * st.len;
        const ty = y - Math.sin(Math.atan2(st.vy, st.vx)) * st.len;
        // Also reset if off screen
        if (x < -200 || x > W + 200 || y > H + 100) { resetStar(st, now); continue; }
        const grad = ctx.createLinearGradient(tx, ty, x, y);
        grad.addColorStop(0, `${st.col}0)`);
        grad.addColorStop(1, `${st.col}${alpha})`);
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y);
        ctx.strokeStyle = grad; ctx.lineWidth = st.width; ctx.lineCap = 'round'; ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, st.width * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `${st.col}${alpha})`; ctx.fill();
      }

      // ── Comets ──
      for (const c of s.comets) {
        if (!c.born || now < c.born) continue;
        const age  = (now - c.born) / 1000;
        const x    = c.x + c.vx * age;
        const y    = c.y + c.vy * age;
        // Reset when off screen
        if (x < -300 || x > W + 300 || y < -200 || y > H + 200) { resetComet(c, now); continue; }
        const frac  = age / c.life;
        const alpha = c.a * Math.min(frac * 4, 1) * Math.min((1 - frac) * 4, 1);
        const tx    = x - Math.cos(c.angle) * c.len;
        const ty    = y - Math.sin(c.angle) * c.len;
        for (let layer = 0; layer < 3; layer++) {
          const w    = c.width * (3 - layer) * 1.2;
          const a    = alpha * (0.15 + layer * 0.12);
          const grad = ctx.createLinearGradient(tx, ty, x, y);
          grad.addColorStop(0, `${c.col}0)`);
          grad.addColorStop(1, `${c.col}${a})`);
          ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y);
          ctx.strokeStyle = grad; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.stroke();
        }
        const headGrad = ctx.createRadialGradient(x, y, 0, x, y, c.width * 4);
        headGrad.addColorStop(0, `${c.col}${alpha})`);
        headGrad.addColorStop(1, `${c.col}0)`);
        ctx.beginPath(); ctx.arc(x, y, c.width * 4, 0, Math.PI * 2);
        ctx.fillStyle = headGrad; ctx.fill();
      }

      // ── Asteroids ──
      for (const a of s.asteroids) {
        if (!a.born || now < a.born) continue;
        const age = (now - a.born) / 1000;
        const x   = a.x + a.vx * age;
        const y   = a.y + a.vy * age;
        // Reset when off screen
        if (x < -100 || x > W + 100 || y < -100 || y > H + 100) { resetAsteroid(a, now); continue; }
        const frac  = age / a.life;
        const alpha = Math.min(frac * 3, 1) * Math.min((1 - frac) * 3, 1);
        const rot   = a.rot + a.rotSpd * age;
        ctx.save();
        ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = alpha;
        ctx.font = `${a.size}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(a.emoji, 0, 0);
        ctx.globalAlpha = 1; ctx.restore();
      }

      // ── Space debris ──
      for (const d of s.debrisItems) {
        if (!d.born || now < d.born) continue;
        const age = (now - d.born) / 1000;
        const x   = d.x + d.vx * age;
        const y   = d.y + d.vy * age;
        // Reset when off screen
        if (x < -100 || x > W + 100 || y < -100 || y > H + 100) { resetDebris(d, now); continue; }
        const frac  = age / d.life;
        const alpha = d.a * Math.min(frac * 2, 1) * Math.min((1 - frac) * 2, 1);
        const rot   = d.rot + d.rotSpd * age;
        ctx.save();
        ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = alpha;
        ctx.font = `${d.size}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(d.emoji, 0, 0);
        ctx.globalAlpha = 1; ctx.restore();
      }

      // ── NASA Spaceship — upright, loops from bottom to top ──
for (const sh of s.spaceships) {
  if (!sh.born || now < sh.born) continue;
  const age = (now - sh.born) / 1000;
  const x   = sh.x + sh.vx * age;
  const y   = sh.y + sh.vy * age;
  if (y < -sh.size) { resetSpaceship(sh, now); continue; }
  const progress = Math.max(0, (H + 80 - y) / (H + 80 + sh.size));
  const alpha    = Math.min(progress * 3, 1);

  // ── Animated fire particles below rocket ──
  const flameCount = 8;
  for (let fi = 0; fi < flameCount; fi++) {
    const flicker  = rand(0.3, 1.0);
    const fOffX    = rand(-sh.size * 0.12, sh.size * 0.12);
    const fOffY    = sh.size * 0.38 + rand(0, sh.size * 0.35) * flicker;
    const fSize    = rand(sh.size * 0.08, sh.size * 0.22) * flicker;
    const fAlpha   = rand(0.5, 0.9) * alpha * flicker;
    // Colour cycles through orange → yellow → white core
    const fireCol  = fi < 3
      ? `rgba(255, 255, 180, ${fAlpha})`   // white-hot core
      : fi < 6
      ? `rgba(255, 160, 20, ${fAlpha})`    // orange mid
      : `rgba(255, 60, 0, ${fAlpha * 0.7})`; // red outer
    const fg = ctx.createRadialGradient(
      x + fOffX, y + fOffY, 0,
      x + fOffX, y + fOffY, fSize
    );
    fg.addColorStop(0, fireCol);
    fg.addColorStop(1, 'rgba(255,40,0,0)');
    ctx.beginPath();
    ctx.arc(x + fOffX, y + fOffY, fSize, 0, Math.PI * 2);
    ctx.fillStyle = fg;
    ctx.fill();
  }

  // ── Rocket — counter-rotated 45° to stand upright ──
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 4); // correct for emoji's natural upper-left tilt
  ctx.globalAlpha = alpha;
  ctx.font = `${sh.size}px serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🚀', 0, 0);
  ctx.globalAlpha = 1;
  ctx.restore();
}

      // ── Milky Way twinkle ──
      if (Math.random() < 0.15) {
        const star     = s.milkyWay[randInt(0, s.milkyWay.length - 1)];
        const twinkleA = Math.min(1, star.a + rand(0.2, 0.5));
        ctx.beginPath(); ctx.arc(star.x, star.y, star.r * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `${star.col}${twinkleA})`; ctx.fill();
      }

      rafRef.current = requestAnimationFrame(drawFrame);
    }

    rafRef.current = requestAnimationFrame(drawFrame);

    const cardT = setTimeout(() => {
      setShowCard(true);
      if (speak) {
        let msg = "Good try! Keep practicing!";
        if (accuracy === 100) msg = "Perfect! You got them all!";
        else if (accuracy >= 80) msg = "Excellent! Almost perfect!";
        else if (accuracy >= 60) msg = "Great job! You're getting there!";
        speak(msg);
      }
    }, CARD_DELAY);

    const btnT = setTimeout(() => setShowButtons(true), CARD_DELAY + 1500);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(cardT);
      clearTimeout(btnT);
      stateRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      position:'fixed', top:0, left:0, width:'100vw', height:'100vh',
      display:'flex', alignItems:'center', justifyContent:'center',
      background:'#000', zIndex:9999,
    }}>
      <div style={{
        position:'relative', width:W, height:H,
        background:'radial-gradient(ellipse at 35% 35%, #2a0060 0%, #150030 35%, #080018 70%, #020008 100%)',
        borderRadius:40, overflow:'hidden',
      }}>

        <canvas ref={canvasRef} width={W} height={H}
          style={{ position:'absolute', top:0, left:0, zIndex:1 }} />

        <div style={{
          position:'absolute', inset:0, zIndex:10,
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          gap:16, padding:'0 24px',
          pointerEvents: showCard ? 'auto' : 'none',
        }}>
          {showCard && (
            <div style={{
              background:'rgba(255,255,255,0.97)',
border:'5px solid #FFD700',
borderRadius:40, padding:'20px 28px 24px',
textAlign:'center', width:'100%', maxWidth:310,
boxShadow:'0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,215,0,0.45)',
animation:'cardPop 0.55s cubic-bezier(0.68,-0.55,0.265,1.55) forwards',
            }}>
              <div style={{ fontSize:'3em', marginBottom:6 }}>{perf.emoji}</div>
              <div style={{
                fontSize:'1.9em', fontWeight:900, letterSpacing:2,
                color:perf.color, fontFamily:'Arial,sans-serif', marginBottom:10,
              }}>{perf.text}</div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:6 }}>
                <span style={{ fontSize:'3em', fontWeight:900, color:'#e0e0ff', fontFamily:'Arial,sans-serif', lineHeight:1 }}>{score}</span>
                <span style={{ fontSize:'2.2em', color:'#8888aa', fontWeight:300, fontFamily:'Arial,sans-serif' }}>/</span>
                <span style={{ fontSize:'3em', fontWeight:900, color:'#8888aa', fontFamily:'Arial,sans-serif', lineHeight:1 }}>{total}</span>
              </div>
              <div style={{ fontSize:'1em', fontWeight:700, color:'#9999bb', fontFamily:'Arial,sans-serif' }}>{accuracy}% Accuracy</div>
            </div>
          )}

          <div style={{
            display:'flex', flexDirection:'column', gap:10,
            width:'100%', maxWidth:310,
            opacity: showButtons ? 1 : 0,
            transform: showButtons ? 'translateY(0)' : 'translateY(14px)',
            transition:'opacity 0.5s ease, transform 0.5s ease',
            pointerEvents: showButtons ? 'auto' : 'none',
          }}>
            {[
              { label:'🔁 Try Again',   action:'again',  bg:'linear-gradient(135deg,#4CAF50,#388E3C)', border:'#2E7D32' },
              { label:'🔀 Change Quiz', action:'change', bg:'linear-gradient(135deg,#42A5F5,#1976D2)', border:'#1565C0' },
              { label:'🏠 Main Menu',   action:'menu',   bg:'linear-gradient(135deg,#FF9800,#F57C00)', border:'#E65100' },
            ].map(btn => (
              <button key={btn.action}
                onClick={() => handleComplete(btn.action)}
                style={{
                  width:'100%', padding:'15px 20px',
                  border:`3px solid ${btn.border}`,
                  borderRadius:16, background:btn.bg, color:'white',
                  fontFamily:'Arial,sans-serif', fontSize:'1.05em', fontWeight:800,
                  cursor:'pointer', boxShadow:'0 5px 16px rgba(0,0,0,0.4)',
                }}
              >{btn.label}</button>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes cardPop {
            0%   { opacity:0; transform:scale(0.3) rotate(-10deg); }
            70%  { transform:scale(1.08) rotate(2deg); opacity:1; }
            100% { transform:scale(1) rotate(0deg); opacity:1; }
          }
        `}</style>
      </div>
    </div>
  );
}

export default MilkyWayCelebration;
import React, { useEffect, useRef, useState, useCallback } from 'react';

const W = 420;
const H = 680;

// ── Helpers ───────────────────────────────────────────────────────────────────
function rand(a, b) { return a + Math.random() * (b - a); }
function randInt(a, b) { return Math.floor(rand(a, b + 1)); }
function choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Nebula color palette ──────────────────────────────────────────────────────
const NEBULA_COLORS = [
  'rgba(180, 80, 255,',   // violet
  'rgba(255, 80, 160,',   // pink
  'rgba(80, 200, 255,',   // cyan
  'rgba(255, 140, 40,',   // amber
  'rgba(80, 255, 180,',   // teal
  'rgba(255, 255, 120,',  // pale yellow
];

// ── Milky Way band: dense star field along a diagonal ────────────────────────
function buildMilkyWay() {
  const stars = [];
  // Band runs top-right to bottom-left diagonally
  for (let i = 0; i < 320; i++) {
    const t  = Math.random();
    const bx = W * 0.15 + t * W * 0.7;
    const by = H * 0.05 + t * H * 0.9;
    // Scatter perpendicular to the band
    const perp = rand(-60, 60);
    stars.push({
      x:    bx + perp * 0.6,
      y:    by - perp * 0.8,
      r:    rand(0.4, 2.2),
      a:    rand(0.15, 0.85),
      col:  Math.random() < 0.25 ? choice(NEBULA_COLORS) : 'rgba(200, 210, 255,',
    });
  }
  // Extra sparse background stars
  for (let i = 0; i < 80; i++) {
    stars.push({
      x: rand(0, W), y: rand(0, H),
      r: rand(0.3, 1.2), a: rand(0.1, 0.4),
      col: 'rgba(200, 210, 255,',
    });
  }
  return stars;
}

// ── Nebula clouds: soft blobs of color ───────────────────────────────────────
function buildNebulaClouds() {
  return Array.from({ length: 6 }, () => ({
    x:   rand(20, W - 20),
    y:   rand(20, H - 20),
    r:   rand(40, 120),
    col: choice(NEBULA_COLORS),
    a:   rand(0.04, 0.10),
  }));
}

// ── Shooting star factory ─────────────────────────────────────────────────────
function makeStar() {
  const angle = rand(-0.6, -0.3); // shallow downward diagonal
  const speed = rand(280, 480);   // px/s — slow and cinematic
  const len   = rand(80, 160);
  return {
    x:     rand(-50, W + 50),
    y:     rand(-20, H * 0.5),
    vx:    Math.cos(angle) * speed,
    vy:    Math.sin(angle) * speed,
    len,
    width: rand(1.5, 3.0),
    a:     rand(0.7, 1.0),
    col:   Math.random() < 0.4 ? choice(NEBULA_COLORS) : 'rgba(255, 255, 255,',
    born:  null,
    life:  rand(0.8, 1.6), // seconds
  };
}

// ── Comet factory ─────────────────────────────────────────────────────────────
function makeComet() {
  const fromLeft = Math.random() < 0.5;
  const angle    = fromLeft ? rand(-0.25, 0.25) : rand(Math.PI - 0.25, Math.PI + 0.25);
  const speed    = rand(60, 110); // slow drift
  return {
    x:      fromLeft ? -60 : W + 60,
    y:      rand(H * 0.1, H * 0.7),
    vx:     Math.cos(angle) * speed,
    vy:     Math.sin(angle) * speed,
    len:    rand(100, 200),
    width:  rand(3, 6),
    col:    choice(NEBULA_COLORS),
    a:      rand(0.6, 0.9),
    born:   null,
    life:   rand(3.5, 6.0),
    angle,
  };
}

// ── Asteroid factory ──────────────────────────────────────────────────────────
const ASTEROID_EMOJI = ['🪨', '🪨', '🌑'];
function makeAsteroid() {
  const fromLeft = Math.random() < 0.5;
  return {
    x:      fromLeft ? -40 : W + 40,
    y:      rand(H * 0.05, H * 0.85),
    vx:     (fromLeft ? 1 : -1) * rand(25, 55),
    vy:     rand(-15, 15),
    size:   rand(18, 36),
    rot:    0,
    rotSpd: rand(-1.2, 1.2), // rad/s
    born:   null,
    life:   rand(5, 9),
  };
}

// ── Debris factory ────────────────────────────────────────────────────────────
const DEBRIS_EMOJI = ['🛸', '🛰️', '⚙️', '🔩', '💫', '🚀'];
function makeDebris() {
  const fromLeft = Math.random() < 0.5;
  return {
    x:      fromLeft ? -40 : W + 40,
    y:      rand(H * 0.1, H * 0.9),
    vx:     (fromLeft ? 1 : -1) * rand(15, 35),
    vy:     rand(-10, 10),
    size:   rand(14, 28),
    rot:    rand(0, Math.PI * 2),
    rotSpd: rand(-0.8, 0.8),
    emoji:  choice(DEBRIS_EMOJI),
    born:   null,
    life:   rand(6, 12),
    a:      rand(0.5, 0.9),
  };
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

    const milkyWay    = buildMilkyWay();
    const nebulaClouds = buildNebulaClouds();

    // Spawn schedule — staggered cinematic reveals
    const shootingStars = [];
    const comets        = [];
    const asteroids     = [];
    const debrisItems   = [];

    // Pre-schedule spawn times
    const starSchedule    = [0.3, 1.5, 2.8, 4.2, 6.0, 7.5, 9.0, 11.0].map(t => ({ t, spawned: false }));
    const cometSchedule   = [1.0, 5.0, 10.0].map(t => ({ t, spawned: false }));
    const asteroidSchedule = [2.0, 6.5, 12.0].map(t => ({ t, spawned: false }));
    const debrisSchedule  = [3.5, 8.0, 13.0].map(t => ({ t, spawned: false }));

    const CARD_DELAY = 5000;

    stateRef.current = {
      startTime: performance.now(),
      milkyWay, nebulaClouds,
      shootingStars, comets, asteroids, debrisItems,
      starSchedule, cometSchedule, asteroidSchedule, debrisSchedule,
    };

    let lastTime = null;

    function drawFrame(now) {
      const s = stateRef.current;
      if (!s) return;
      const elapsed = (now - s.startTime) / 1000; // seconds
      const dt      = lastTime ? (now - lastTime) / 1000 : 0;
      lastTime = now;

      ctx.clearRect(0, 0, W, H);

      // ── Nebula clouds ──
      for (const c of s.nebulaClouds) {
        const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
        grad.addColorStop(0,   `${c.col}${c.a})`);
        grad.addColorStop(0.5, `${c.col}${c.a * 0.5})`);
        grad.addColorStop(1,   `${c.col}0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Milky Way stars ──
      for (const star of s.milkyWay) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `${star.col}${star.a})`;
        ctx.fill();
      }

      // ── Spawn scheduled objects ──
      for (const sched of s.starSchedule) {
        if (!sched.spawned && elapsed >= sched.t) {
          sched.spawned = true;
          const st = makeStar();
          st.born = now;
          s.shootingStars.push(st);
        }
      }
      for (const sched of s.cometSchedule) {
        if (!sched.spawned && elapsed >= sched.t) {
          sched.spawned = true;
          const c = makeComet();
          c.born = now;
          s.comets.push(c);
        }
      }
      for (const sched of s.asteroidSchedule) {
        if (!sched.spawned && elapsed >= sched.t) {
          sched.spawned = true;
          const a = makeAsteroid();
          a.born = now;
          s.asteroids.push(a);
        }
      }
      for (const sched of s.debrisSchedule) {
        if (!sched.spawned && elapsed >= sched.t) {
          sched.spawned = true;
          const d = makeDebris();
          d.born = now;
          s.debrisItems.push(d);
        }
      }

      // ── Shooting stars ──
      for (const st of s.shootingStars) {
        if (!st.born) continue;
        const age   = (now - st.born) / 1000;
        const frac  = age / st.life;
        if (frac > 1) continue;
        const alpha = st.a * (1 - frac);
        const x     = st.x + st.vx * age;
        const y     = st.y + st.vy * age;
        const tx    = x - Math.cos(Math.atan2(st.vy, st.vx)) * st.len;
        const ty    = y - Math.sin(Math.atan2(st.vy, st.vx)) * st.len;

        const grad = ctx.createLinearGradient(tx, ty, x, y);
        grad.addColorStop(0, `${st.col}0)`);
        grad.addColorStop(1, `${st.col}${alpha})`);
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(x, y);
        ctx.strokeStyle = grad;
        ctx.lineWidth   = st.width;
        ctx.lineCap     = 'round';
        ctx.stroke();

        // Bright head
        ctx.beginPath();
        ctx.arc(x, y, st.width * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `${st.col}${alpha})`;
        ctx.fill();
      }

      // ── Comets ──
      for (const c of s.comets) {
        if (!c.born) continue;
        const age  = (now - c.born) / 1000;
        const frac = age / c.life;
        if (frac > 1) continue;
        // Fade in then out
        const alpha = c.a * Math.min(frac * 4, 1) * Math.min((1 - frac) * 4, 1);
        const x    = c.x + c.vx * age;
        const y    = c.y + c.vy * age;
        const tx   = x - Math.cos(c.angle) * c.len;
        const ty   = y - Math.sin(c.angle) * c.len;

        // Wide glowing tail
        for (let layer = 0; layer < 3; layer++) {
          const w    = c.width * (3 - layer) * 1.2;
          const a    = alpha * (0.15 + layer * 0.12);
          const grad = ctx.createLinearGradient(tx, ty, x, y);
          grad.addColorStop(0, `${c.col}0)`);
          grad.addColorStop(1, `${c.col}${a})`);
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(x, y);
          ctx.strokeStyle = grad;
          ctx.lineWidth   = w;
          ctx.lineCap     = 'round';
          ctx.stroke();
        }

        // Comet head glow
        const headGrad = ctx.createRadialGradient(x, y, 0, x, y, c.width * 4);
        headGrad.addColorStop(0, `${c.col}${alpha})`);
        headGrad.addColorStop(1, `${c.col}0)`);
        ctx.beginPath();
        ctx.arc(x, y, c.width * 4, 0, Math.PI * 2);
        ctx.fillStyle = headGrad;
        ctx.fill();
      }

      // ── Asteroids ──
      for (const a of s.asteroids) {
        if (!a.born) continue;
        const age  = (now - a.born) / 1000;
        const frac = age / a.life;
        if (frac > 1) continue;
        const alpha = Math.min(frac * 3, 1) * Math.min((1 - frac) * 3, 1);
        const x    = a.x + a.vx * age;
        const y    = a.y + a.vy * age;
        const rot  = a.rot + a.rotSpd * age;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.globalAlpha = alpha;
        ctx.font         = `${a.size}px serif`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(choice(ASTEROID_EMOJI), 0, 0);
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      // ── Space debris ──
      for (const d of s.debrisItems) {
        if (!d.born) continue;
        const age  = (now - d.born) / 1000;
        const frac = age / d.life;
        if (frac > 1) continue;
        const alpha = d.a * Math.min(frac * 2, 1) * Math.min((1 - frac) * 2, 1);
        const x    = d.x + d.vx * age;
        const y    = d.y + d.vy * age;
        const rot  = d.rot + d.rotSpd * age;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.globalAlpha = alpha;
        ctx.font         = `${d.size}px serif`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(d.emoji, 0, 0);
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      // ── Milky Way twinkle ── (subtle alpha pulse on random stars)
      if (Math.random() < 0.15) {
        const star = s.milkyWay[randInt(0, s.milkyWay.length - 1)];
        const twinkleA = Math.min(1, star.a + rand(0.2, 0.5));
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `${star.col}${twinkleA})`;
        ctx.fill();
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
        background:'radial-gradient(ellipse at 30% 40%, #1a0035 0%, #0a0020 40%, #000510 100%)',
        borderRadius:40, overflow:'hidden',
      }}>

        {/* Canvas — space scene */}
        <canvas ref={canvasRef} width={W} height={H}
          style={{ position:'absolute', top:0, left:0, zIndex:1 }} />

        {/* Score card + buttons */}
        <div style={{
          position:'absolute', inset:0, zIndex:10,
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          gap:16, padding:'0 24px',
          pointerEvents: showCard ? 'auto' : 'none',
        }}>
          {showCard && (
            <div style={{
              background:'rgba(10, 0, 30, 0.82)',
              border:'2px solid rgba(180, 80, 255, 0.6)',
              borderRadius:40, padding:'20px 28px 24px',
              textAlign:'center', width:'100%', maxWidth:310,
              boxShadow:'0 0 60px rgba(180,80,255,0.3), 0 0 120px rgba(80,200,255,0.15), inset 0 0 30px rgba(180,80,255,0.05)',
              animation:'cardPop 0.55s cubic-bezier(0.68,-0.55,0.265,1.55) forwards',
              backdropFilter:'blur(6px)',
            }}>
              <div style={{ fontSize:'3em', marginBottom:6 }}>{perf.emoji}</div>
              <div style={{
                fontSize:'1.9em', fontWeight:900, letterSpacing:2,
                color: perf.color, fontFamily:'Arial,sans-serif', marginBottom:10,
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
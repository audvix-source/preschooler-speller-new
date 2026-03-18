import React, { useEffect, useRef, useState, useCallback } from 'react';

const W = 420;
const H = 680;

const ZONE_TOP    = H * 0.25;
const ZONE_BOTTOM = H * 0.75;
const ZONE_H      = ZONE_BOTTOM - ZONE_TOP;
const CX          = W / 2;
const R           = 75;

function getRingCenters() {
  const usable = ZONE_H - R * 2;
  return [0, 1, 2, 3].map(i => ZONE_TOP + R + usable * (i / 3));
}

const JET_CONFIGS = [
  { id: 'red',    trailColor: 'rgba(255, 30,  30,'  },
  { id: 'green',  trailColor: 'rgba(30,  220, 80,'  },
  { id: 'yellow', trailColor: 'rgba(255, 210, 0,'   },
  { id: 'white',  trailColor: 'rgba(210, 210, 255,' },
];

const DRAW_ORDER = [0, 2, 1, 3];
// Exit directions per draw sequence
const EXIT_DIRS  = ['top', 'bottom', 'left', 'right'];

function buildCirclePath(ringIdx, seqIdx) {
  const centers    = getRingCenters();
  const cy         = centers[ringIdx];
  const fromRight  = seqIdx % 2 === 0;
  const startAngle = fromRight ? 0 : Math.PI;
  const direction  = fromRight ? 1 : -1;
  const exitDir    = EXIT_DIRS[seqIdx];

  const N = 120;
  const points = [];
  for (let i = 0; i <= N; i++) {
    const angle = startAngle + direction * 2 * Math.PI * (i / N);
    points.push([CX + R * Math.cos(angle), cy + R * Math.sin(angle)]);
  }

  // Exit: shoot off in designated compass direction
  const last      = points[points.length - 1];
  const exitSteps = 30;
  for (let i = 1; i <= exitSteps; i++) {
    const t = i / exitSteps;
    switch (exitDir) {
      case 'top':    points.push([last[0],                   last[1] - t * H * 0.35]); break;
      case 'bottom': points.push([last[0],                   last[1] + t * H * 0.35]); break;
      case 'left':   points.push([last[0] - t * W * 0.7,    last[1]               ]); break;
      case 'right':  points.push([last[0] + t * W * 0.7,    last[1]               ]); break;
      default: break;
    }
  }
  return points;
}

function AirshowCelebration({ score, total, onComplete, speak }) {
  const canvasRef    = useRef(null);
  const stateRef     = useRef(null);
  const rafRef       = useRef(null);

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
    const ctx   = canvas.getContext('2d');
    const paths = DRAW_ORDER.map((ringIdx, seqIdx) => buildCirclePath(ringIdx, seqIdx));

    const JET_FLIGHT_DURATION = 1800; // fast — full circle in 1.8s
    const STAGGER             = 400;  // 400ms between jets
    const CARD_DELAY          = 3200; // card at ~3s
    const ANIMATION_END       = JET_FLIGHT_DURATION + STAGGER * 3 + 200; // ~3s

    const trails = [[], [], [], []];
    stateRef.current = {
      startTime: performance.now(),
      paths,
      trails,
      animDone: false,
      pulseStart: null,
    };

    function drawTrails(s, now, pulseAlpha) {
      for (let ji = 0; ji < 4; ji++) {
        const ringIdx = DRAW_ORDER[ji];
        const cfg     = JET_CONFIGS[ringIdx];
        const trail   = s.trails[ji];

        for (let pi = 1; pi < trail.length; pi++) {
          const prev = trail[pi - 1];
          const pt   = trail[pi];
          const dx   = pt[0] - prev[0];
          const dy   = pt[1] - prev[1];
          if (Math.sqrt(dx*dx + dy*dy) < 0.5) continue;

          const layers = [
            { w: 70, a: 0.07 },
            { w: 52, a: 0.14 },
            { w: 36, a: 0.23 },
            { w: 22, a: 0.34 },
            { w: 12, a: 0.48 },
            { w:  5, a: 0.70 },
          ];
          for (const layer of layers) {
            ctx.beginPath();
            ctx.moveTo(prev[0], prev[1]);
            ctx.lineTo(pt[0],   pt[1]);
            ctx.strokeStyle = `${cfg.trailColor}${layer.a * pulseAlpha})`;
            ctx.lineWidth   = layer.w * pulseAlpha;
            ctx.lineCap     = 'round';
            ctx.lineJoin    = 'round';
            ctx.stroke();
          }
        }
      }
    }

    function drawFrame(now) {
      const s = stateRef.current;
      if (!s) return;
      const elapsed = now - s.startTime;

      ctx.clearRect(0, 0, W, H);

      // After animation ends, switch to pulsing mode
      if (elapsed > ANIMATION_END && !s.animDone) {
        s.animDone  = true;
        s.pulseStart = now;
      }

      // Pulse alpha: sine wave between 0.6 and 1.0 with period ~2s
      let pulseAlpha = 1.0;
      if (s.animDone && s.pulseStart) {
        const pt = (now - s.pulseStart) / 1000; // seconds since done
        pulseAlpha = 0.7 + 0.3 * Math.sin(pt * Math.PI); // 0.7–1.0, period 2s
      }

      drawTrails(s, now, pulseAlpha);

      // Draw jets (only during animation phase)
      if (!s.animDone) {
        for (let ji = 0; ji < 4; ji++) {
          const ringIdx    = DRAW_ORDER[ji];
          const cfg        = JET_CONFIGS[ringIdx];
          const jetElapsed = elapsed - ji * STAGGER;
          if (jetElapsed < 0) continue;

          const path  = paths[ji];
          const t     = Math.min(jetElapsed / JET_FLIGHT_DURATION, 1);
          const ptIdx = Math.min(Math.floor(t * (path.length - 1)), path.length - 1);
          const [x, y] = path[ptIdx];

          if (t < 1) s.trails[ji].push([x, y]);

          if (t < 1) {
            // Direction: look ahead a few points for accurate nose angle
            const lookAhead = Math.min(ptIdx + 3, path.length - 1);
            const [x2, y2]  = path[lookAhead];
            const angle     = Math.atan2(y2 - y, x2 - x);

            // Determine if we're in the exit segment (last 30 of path)
            const inExit    = ptIdx >= path.length - 31;
            const exitDir   = EXIT_DIRS[ji];

            // Flip horizontally only when jet is genuinely flying leftward
            const flyingLeft = Math.cos(angle) < -0.3;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            if (flyingLeft) ctx.scale(-1, 1);
            ctx.font         = '78px serif';
            ctx.textAlign    = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✈️', 0, 0);
            ctx.restore();
          }
        }
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
        background:'linear-gradient(170deg,#03001C 0%,#06004a 40%,#0a0060 70%,#050030 100%)',
        borderRadius:40, overflow:'hidden',
      }}>

        {/* Stars */}
        <div style={{ position:'absolute', inset:0, zIndex:0, pointerEvents:'none' }}>
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} style={{
              position:'absolute',
              left:`${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width:  Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              borderRadius:'50%',
              background:'white',
              opacity: Math.random() * 0.7 + 0.3,
            }} />
          ))}
        </div>

        {/* Canvas */}
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
              background:'rgba(255,255,255,0.96)',
              border:'5px solid #FFD700',
              borderRadius:40, padding:'20px 28px 24px',
              textAlign:'center', width:'100%', maxWidth:310,
              boxShadow:'0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(255,215,0,0.4)',
              animation:'cardPop 0.55s cubic-bezier(0.68,-0.55,0.265,1.55) forwards',
            }}>
              <div style={{ fontSize:'3em', marginBottom:6 }}>{perf.emoji}</div>
              <div style={{
                fontSize:'1.9em', fontWeight:900, letterSpacing:2,
                color:perf.color, fontFamily:'Arial,sans-serif', marginBottom:10,
              }}>{perf.text}</div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:6 }}>
                <span style={{ fontSize:'3em', fontWeight:900, color:'#2C3E50', fontFamily:'Arial,sans-serif', lineHeight:1 }}>{score}</span>
                <span style={{ fontSize:'2.2em', color:'#95A5A6', fontWeight:300, fontFamily:'Arial,sans-serif' }}>/</span>
                <span style={{ fontSize:'3em', fontWeight:900, color:'#95A5A6', fontFamily:'Arial,sans-serif', lineHeight:1 }}>{total}</span>
              </div>
              <div style={{ fontSize:'1em', fontWeight:700, color:'#7F8C8D', fontFamily:'Arial,sans-serif' }}>{accuracy}% Accuracy</div>
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
                  cursor:'pointer', boxShadow:'0 5px 16px rgba(0,0,0,0.3)',
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

export default AirshowCelebration;
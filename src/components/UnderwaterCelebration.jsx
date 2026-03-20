import React, { useEffect, useRef, useState, useCallback } from 'react';
import sharkImg from '../assets/shark-transparent.png';

const QUIZ_TYPE_CONFIG = {
  'mixed':     { icon: '✏️',  label: 'Mixed',       bg: 'linear-gradient(135deg,#42A5F5,#1976D2)' },
  'mc-only':   { icon: '🖼️',  label: 'Picture Quiz', bg: 'linear-gradient(135deg,#66BB6A,#388E3C)' },
  'listening': { icon: '🔊',  label: 'Listening',    bg: 'linear-gradient(135deg,#FF4081,#C2185B)' },
  'reading':   { icon: '📖',  label: 'Reading',      bg: 'linear-gradient(135deg,#AB47BC,#7B1FA2)' },
};

function getSizeBadge(total) {
  if (total <= 5)  return { icon:'⚡', label:'Warm Up Quiz',   bg:'linear-gradient(135deg,#F57C00,#E65100)' };
  if (total <= 10) return { icon:'🌱', label:'Starter Quiz',   bg:'linear-gradient(135deg,#388E3C,#1B5E20)' };
  if (total <= 15) return { icon:'⭐', label:'Solid Mastery',  bg:'linear-gradient(135deg,#1976D2,#0D47A1)' };
  if (total <= 20) return { icon:'💪', label:'Strong Mastery', bg:'linear-gradient(135deg,#7B1FA2,#4A148C)' };
  if (total <= 25) return { icon:'🔥', label:'Deep Mastery',   bg:'linear-gradient(135deg,#C62828,#B71C1C)' };
  return               { icon:'👑', label:'Grand Mastery',  bg:'linear-gradient(135deg,#F9A825,#F57F17)' };
}

const W = 420;
const H = 680;

function rand(a, b) { return a + Math.random() * (b - a); }
function choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function lerp(a, b, t) { return a + (b - a) * Math.min(1, Math.max(0, t)); }
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
function easeIn(t) { return t * t; }

function buildReef() {
  const corals = Array.from({ length: 22 }, () => ({
    x: rand(W * 0.15, W), y: H - rand(20, 130),
    emoji: choice(['🪸','🪸','🪸','🌿','🌾','🐚','🪸']),
    size: rand(30, 54), phase: rand(0, Math.PI * 2),
  }));
  const starfish = Array.from({ length: 7 }, () => ({
    x: rand(W * 0.15, W - 10), y: H - rand(8, 32),
    size: rand(18, 32), rot: rand(0, Math.PI * 2),
    emoji: choice(['⭐','🌟']),
  }));
  const schoolCenter = { x: rand(W * 0.3, W * 0.8), y: rand(H * 0.2, H * 0.45) };
  const school = Array.from({ length: 14 }, () => ({
    offX: rand(-50, 50), offY: rand(-25, 25),
    emoji: choice(['🐠','🐟','🐡']),
    size: rand(12, 20), phase: rand(0, Math.PI * 2),
  }));
  const schoolState = {
    x: schoolCenter.x, y: schoolCenter.y,
    vx: rand(20, 35) * (Math.random() < 0.5 ? 1 : -1), vy: rand(-8, 8),
  };
  const fish = Array.from({ length: 10 }, () => ({
    x: rand(0, W), y: rand(H * 0.1, H * 0.72),
    vx: rand(-22, 22) || 15, vy: rand(-4, 4),
    emoji: choice(['🐠','🐟','🐡','🐟']),
    size: rand(14, 24), phase: rand(0, Math.PI * 2),
  }));
  const jellies = Array.from({ length: 4 }, () => ({
    x: rand(W * 0.2, W - 20), y: rand(H * 0.05, H * 0.6),
    vy: rand(-13, -6), phase: rand(0, Math.PI * 2), size: rand(20, 34),
  }));
  const bubbles = Array.from({ length: 28 }, () => ({
    x: rand(0, W), y: rand(0, H),
    vy: rand(-20, -8), r: rand(2, 7), phase: rand(0, Math.PI * 2),
  }));
  const seaweed = Array.from({ length: 12 }, () => ({
    x: rand(W * 0.15, W), y: H - rand(5, 22),
    size: rand(32, 58), phase: rand(0, Math.PI * 2),
  }));
  const turtles = Array.from({ length: 2 }, () => ({
    x: rand(W * 0.2, W), y: rand(H * 0.15, H * 0.52),
    vx: rand(-12, 12) || 8, vy: rand(-3, 3),
    size: rand(26, 38), phase: rand(0, Math.PI * 2),
  }));
  return { corals, starfish, school, schoolState, fish, jellies, bubbles, seaweed, turtles };
}

function makeInkParticle(cx, cy) {
  const angle = rand(0, Math.PI * 2);
  const speed = rand(6, 45);
  return {
    x: cx, y: cy,
    vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
    r: rand(12, 28), a: rand(0.55, 0.90), born: null,
  };
}

function UnderwaterCelebration({ score, total, quizType = 'mixed', onComplete, speak }) {
  const qtCfg     = QUIZ_TYPE_CONFIG[quizType] || QUIZ_TYPE_CONFIG['mixed'];
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

    const reef = buildReef();
    const inkParticles = [];

    const SQUID_START_X = W * 0.62;
    const SQUID_START_Y = H * 0.42;
    const BIG_CORAL_X   = 45;
    const BIG_CORAL_Y   = H - 80;

    const story = {
      camX: 0, camTargetX: 0,
      squid: {
        x: SQUID_START_X, y: SQUID_START_Y,
        size: W * 0.20, state: 'idle',
        escapeStartX: 0, escapeStartY: 0,
      },
      shark: {
        x: W + 140, y: H * 0.40, size: W * 0.36,
        state: 'entering', chaseStartX: 0,
        confuseAngle: 0, confuseCenterX: 0, confuseCenterY: 0,
        roamVx: -28, roamVy: 5,
      },
      ink: { x: 0, y: 0, active: false, radius: 0, targetRadius: 90, alpha: 0.90 },
      inkFired: false,
      startTime: performance.now(),
    };

    const sharkImage = new Image();
    sharkImage.src = sharkImg;
    story.sharkImage = sharkImage;
    stateRef.current = { story, reef, inkParticles };

    function drawFrame(now) {
      const s = stateRef.current;
      if (!s) return;
      const elapsed = (now - s.story.startTime) / 1000;
      const st      = s.story;

      ctx.clearRect(0, 0, W, H);

      if (elapsed > 1.5) st.camTargetX = lerp(0, -30, easeOut((elapsed - 1.5) / 3.0));
      st.camX = lerp(st.camX, st.camTargetX, 0.03);
      ctx.save();
      ctx.translate(st.camX, 0);

      // Water background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#005f87'); bgGrad.addColorStop(0.3, '#0090b0');
      bgGrad.addColorStop(0.6, '#00a896'); bgGrad.addColorStop(1, '#004f60');
      ctx.fillStyle = bgGrad; ctx.fillRect(-60, 0, W + 120, H);

      const sandGrad = ctx.createLinearGradient(0, H - 55, 0, H);
      sandGrad.addColorStop(0, 'rgba(210,175,90,0)');
      sandGrad.addColorStop(1, 'rgba(210,175,90,0.75)');
      ctx.fillStyle = sandGrad; ctx.fillRect(-60, H - 55, W + 120, 55);

      for (let i = 0; i < 6; i++) {
        const rx = -20 + i * (W + 40) / 5;
        const flick = 0.03 + 0.025 * Math.sin(now / 900 + i * 1.5);
        const rg = ctx.createLinearGradient(rx, 0, rx + 50, H * 0.72);
        rg.addColorStop(0, `rgba(150,230,255,${flick})`);
        rg.addColorStop(1, 'rgba(150,230,255,0)');
        ctx.beginPath(); ctx.moveTo(rx, 0); ctx.lineTo(rx + 70, H * 0.72); ctx.lineTo(rx - 15, H * 0.72);
        ctx.closePath(); ctx.fillStyle = rg; ctx.fill();
      }

      for (const sw of s.reef.seaweed) {
        const sway = Math.sin(now / 950 + sw.phase) * 9;
        ctx.save(); ctx.translate(sw.x + sway, sw.y);
        ctx.font = `${sw.size}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillText('🌿', 0, 0); ctx.restore();
      }
      for (const c of s.reef.corals) {
        const sway = Math.sin(now / 1100 + c.phase) * 4;
        ctx.save(); ctx.translate(c.x + sway, c.y);
        ctx.font = `${c.size}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(c.emoji, 0, 0); ctx.restore();
      }
      for (const sf of s.reef.starfish) {
        ctx.save(); ctx.translate(sf.x, sf.y); ctx.rotate(sf.rot);
        ctx.font = `${sf.size}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(sf.emoji, 0, 0); ctx.restore();
      }

      ctx.save(); ctx.translate(BIG_CORAL_X, BIG_CORAL_Y);
      ctx.rotate(Math.sin(now / 1200) * 5 * 0.015);
      ctx.font = '110px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText('🪸', 0, 0); ctx.restore();
      ctx.save(); ctx.translate(BIG_CORAL_X - 20, BIG_CORAL_Y + 10);
      ctx.font = '80px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText('🌿', 0, 0); ctx.restore();

      for (const b of s.reef.bubbles) {
        b.y += b.vy * 0.016;
        if (b.y < -20) b.y = H + 10;
        const wobble = Math.sin(now / 420 + b.phase) * 3;
        ctx.beginPath(); ctx.arc(b.x + wobble, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(200,245,255,0.55)'; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.fillStyle = 'rgba(220,250,255,0.10)'; ctx.fill();
      }
      for (const j of s.reef.jellies) {
        j.y += j.vy * 0.016;
        if (j.y < -40) j.y = H + 40;
        const pulse = 1 + 0.09 * Math.sin(now / 650 + j.phase);
        ctx.save(); ctx.translate(j.x, j.y); ctx.scale(pulse, pulse); ctx.globalAlpha = 0.88;
        ctx.font = `${j.size}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('🪼', 0, 0); ctx.globalAlpha = 1; ctx.restore();
      }
      for (const t of s.reef.turtles) {
        t.x += t.vx * 0.016; t.y += Math.sin(now / 1200 + t.phase) * 0.2;
        if (t.x > W + 60) t.x = -60; if (t.x < -60) t.x = W + 60;
        ctx.save(); ctx.translate(t.x, t.y);
        if (t.vx < 0) ctx.scale(-1, 1);
        ctx.font = `${t.size}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('🐢', 0, 0); ctx.restore();
      }
      const sc = s.reef.schoolState;
      sc.x += sc.vx * 0.016; sc.y += sc.vy * 0.016;
      if (sc.x > W + 80 || sc.x < -80) sc.vx *= -1;
      if (sc.y > H * 0.68 || sc.y < H * 0.1) sc.vy *= -1;
      for (const f of s.reef.school) {
        const fx = sc.x + f.offX + Math.sin(now / 500 + f.phase) * 5;
        const fy = sc.y + f.offY + Math.cos(now / 700 + f.phase) * 3;
        ctx.save(); ctx.translate(fx, fy);
        if (sc.vx < 0) ctx.scale(-1, 1);
        ctx.font = `${f.size}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(f.emoji, 0, 0); ctx.restore();
      }
      for (const f of s.reef.fish) {
        f.x += f.vx * 0.016; f.y += Math.sin(now / 750 + f.phase) * 0.3;
        if (f.x > W + 60) f.x = -60; if (f.x < -60) f.x = W + 60;
        ctx.save(); ctx.translate(f.x, f.y);
        if (f.vx < 0) ctx.scale(-1, 1);
        ctx.font = `${f.size}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(f.emoji, 0, 0); ctx.restore();
      }

      // Story beats
      if (st.squid.state === 'idle') {
        st.squid.x += Math.sin(now / 820) * 0.35;
        st.squid.y += Math.cos(now / 1050) * 0.28;
      }
      if (elapsed >= 0.8 && st.shark.state === 'entering') {
        const p = easeOut((elapsed - 0.8) / 0.7);
        st.shark.x = lerp(W + 140, SQUID_START_X + st.squid.size * 1.2, p);
        st.shark.y = lerp(H * 0.40, SQUID_START_Y, p * 0.6);
        if (p >= 1) { st.shark.state = 'chasing'; st.shark.chaseStartX = st.shark.x; st.squid.state = 'chased'; }
      }
      if (st.squid.state === 'chased' || st.shark.state === 'chasing') {
        const chaseElapsed = elapsed - 1.5;
        if (chaseElapsed >= 0) {
          st.squid.x -= 55 * 0.016;
          st.squid.y += Math.sin(now / 400) * 0.5;
          st.shark.x = st.squid.x + st.squid.size * 1.1;
          st.shark.y = lerp(st.shark.y, st.squid.y, 0.04);
        }
      }
      if (elapsed >= 3.0 && !st.inkFired) {
        st.inkFired = true; st.ink.active = true;
        st.ink.x = st.squid.x + st.squid.size * 0.3; st.ink.y = st.squid.y;
        for (let i = 0; i < 50; i++) { const p = makeInkParticle(st.ink.x, st.ink.y); p.born = now; inkParticles.push(p); }
        st.squid.state = 'escaping'; st.shark.state = 'confused';
        st.shark.confuseCenterX = st.shark.x; st.shark.confuseCenterY = st.shark.y;
        st.shark.confuseAngle = 0;
        st.squid.escapeStartX = st.squid.x; st.squid.escapeStartY = st.squid.y;
      }
      if (st.squid.state === 'escaping') {
        const p = easeIn((elapsed - 3.0) / 2.0);
        st.squid.x = lerp(st.squid.escapeStartX, BIG_CORAL_X, p);
        st.squid.y = lerp(st.squid.escapeStartY, BIG_CORAL_Y - 60, p);
        if (p >= 1) st.squid.state = 'hidden';
      }
      if (st.shark.state === 'confused') {
        st.shark.confuseAngle += 0.020;
        st.shark.x = st.shark.confuseCenterX + Math.cos(st.shark.confuseAngle) * 40;
        st.shark.y = st.shark.confuseCenterY + Math.sin(st.shark.confuseAngle) * 20;
        if (elapsed >= 5.2) { st.shark.state = 'roaming'; st.shark.roamVx = -45; st.shark.roamVy = rand(-10, 10); }
      }
      if (st.shark.state === 'roaming') {
        st.shark.x += st.shark.roamVx * 0.016; st.shark.y += st.shark.roamVy * 0.016;
        if (Math.random() < 0.005) st.shark.roamVy = rand(-15, 15);
        if (st.shark.x > W + 80)   st.shark.roamVx = -Math.abs(st.shark.roamVx);
        if (st.shark.x < -80)      st.shark.roamVx =  Math.abs(st.shark.roamVx);
        if (st.shark.y > H * 0.72) st.shark.roamVy = -Math.abs(st.shark.roamVy);
        if (st.shark.y < H * 0.08) st.shark.roamVy =  Math.abs(st.shark.roamVy);
      }

      // Ink cloud
      if (st.ink.active) {
        st.ink.radius = Math.min(st.ink.targetRadius, st.ink.radius + 1.4);
        for (const p of inkParticles) {
          if (!p.born) continue;
          const age = (now - p.born) / 1000;
          const px = p.x + p.vx * age * 0.3; const py = p.y + p.vy * age * 0.3;
          const pg = ctx.createRadialGradient(px, py, 0, px, py, p.r);
          pg.addColorStop(0, `rgba(15,5,35,${p.a})`); pg.addColorStop(1, 'rgba(10,4,25,0)');
          ctx.beginPath(); ctx.arc(px, py, p.r, 0, Math.PI * 2); ctx.fillStyle = pg; ctx.fill();
        }
        const ig = ctx.createRadialGradient(st.ink.x, st.ink.y, 0, st.ink.x, st.ink.y, st.ink.radius);
        ig.addColorStop(0, `rgba(15,5,35,${st.ink.alpha})`);
        ig.addColorStop(0.5, `rgba(20,8,45,${st.ink.alpha * 0.7})`);
        ig.addColorStop(1, 'rgba(10,4,25,0)');
        ctx.beginPath(); ctx.arc(st.ink.x, st.ink.y, st.ink.radius, 0, Math.PI * 2);
        ctx.fillStyle = ig; ctx.fill();
      }

      // Squid
      if (st.squid.state !== 'hidden') {
        const bobY = st.squid.state === 'idle' ? st.squid.y + Math.sin(now / 600) * 4 : st.squid.y;
        ctx.save(); ctx.translate(st.squid.x, bobY);
        if (st.squid.state !== 'idle') ctx.scale(-1, 1);
        if (st.squid.state === 'chased') ctx.translate(Math.sin(now / 55) * 2, 0);
        ctx.font = `${st.squid.size}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.globalAlpha = 1.0; ctx.fillText('🦑', 0, 0); ctx.globalAlpha = 1; ctx.restore();
      }

      // Shark
      if (st.shark.x > -200 && st.shark.x < W + 200) {
        ctx.save(); ctx.translate(st.shark.x, st.shark.y);
        const facingRight = (st.shark.state === 'roaming' && st.shark.roamVx > 0);
        if (!facingRight) ctx.scale(-1, 1);
        if (st.shark.state === 'confused' || st.shark.state === 'roaming') ctx.rotate(Math.sin(now / 160) * 0.18);
        const sw = st.shark.size * 1.4; const sh = sw * 0.52;
        if (st.sharkImage && st.sharkImage.complete) ctx.drawImage(st.sharkImage, -sw / 2, -sh / 2, sw, sh);
        ctx.restore();
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(drawFrame);
    }

    rafRef.current = requestAnimationFrame(drawFrame);

    const CARD_DELAY = 5000;
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
      clearTimeout(cardT); clearTimeout(btnT);
      stateRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const badgeStyle = {
    display:'inline-flex', alignItems:'center', gap:5,
    padding:'4px 12px', borderRadius:20, color:'white',
    fontFamily:'Arial,sans-serif', fontSize:'0.75em', fontWeight:800,
    boxShadow:'0 2px 8px rgba(0,0,0,0.2)',
  };

  return (
    <div style={{ position:'fixed', top:0, left:0, width:'100vw', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#000', zIndex:9999 }}>
      <div style={{ position:'relative', width:W, height:H, borderRadius:40, overflow:'hidden', background:'linear-gradient(180deg,#005f87 0%,#0090b0 40%,#007a96 100%)' }}>
        <canvas ref={canvasRef} width={W} height={H} style={{ position:'absolute', top:0, left:0, zIndex:1 }} />

        <div style={{ position:'absolute', inset:0, zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:'0 24px', pointerEvents: showCard ? 'auto' : 'none' }}>
          {showCard && (
            <div style={{ background:'rgba(255,255,255,0.97)', border:'5px solid #FFD700', borderRadius:40, padding:'20px 28px 24px', textAlign:'center', width:'100%', maxWidth:310, boxShadow:'0 20px 60px rgba(0,0,0,0.5),0 0 40px rgba(255,215,0,0.45)', animation:'cardPop 0.55s cubic-bezier(0.68,-0.55,0.265,1.55) forwards' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:4, alignItems:'center', marginBottom:8 }}>
                <div style={{ ...badgeStyle, background: qtCfg.bg }}>{qtCfg.icon} {qtCfg.label}</div>
                <div style={{ ...badgeStyle, background: getSizeBadge(total).bg }}>{getSizeBadge(total).icon} {getSizeBadge(total).label}</div>
              </div>
              <div style={{ fontSize:'3em', marginBottom:6 }}>{perf.emoji}</div>
              <div style={{ fontSize:'1.9em', fontWeight:900, letterSpacing:2, color:perf.color, fontFamily:'Arial,sans-serif', marginBottom:10 }}>{perf.text}</div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:6 }}>
                <span style={{ fontSize:'3em', fontWeight:900, color:'#2C3E50', fontFamily:'Arial,sans-serif', lineHeight:1 }}>{score}</span>
                <span style={{ fontSize:'2.2em', color:'#95A5A6', fontWeight:300, fontFamily:'Arial,sans-serif' }}>/</span>
                <span style={{ fontSize:'3em', fontWeight:900, color:'#95A5A6', fontFamily:'Arial,sans-serif', lineHeight:1 }}>{total}</span>
              </div>
              <div style={{ fontSize:'1em', fontWeight:700, color:'#7F8C8D', fontFamily:'Arial,sans-serif' }}>{accuracy}% Accuracy</div>
            </div>
          )}
          <div style={{ display:'flex', flexDirection:'column', gap:10, width:'100%', maxWidth:310, opacity: showButtons ? 1 : 0, transform: showButtons ? 'translateY(0)' : 'translateY(14px)', transition:'opacity 0.5s ease,transform 0.5s ease', pointerEvents: showButtons ? 'auto' : 'none' }}>
            {[
              { label:'🔁 Try Again',   action:'again',  bg:'linear-gradient(135deg,#4CAF50,#388E3C)', border:'#2E7D32' },
              { label:'🔀 Change Quiz', action:'change', bg:'linear-gradient(135deg,#42A5F5,#1976D2)', border:'#1565C0' },
              { label:'🏠 Main Menu',   action:'menu',   bg:'linear-gradient(135deg,#FF9800,#F57C00)', border:'#E65100' },
            ].map(btn => (
              <button key={btn.action} onClick={() => handleComplete(btn.action)}
                style={{ width:'100%', padding:'15px 20px', border:`3px solid ${btn.border}`, borderRadius:16, background:btn.bg, color:'white', fontFamily:'Arial,sans-serif', fontSize:'1.05em', fontWeight:800, cursor:'pointer', boxShadow:'0 5px 16px rgba(0,0,0,0.3)' }}
              >{btn.label}</button>
            ))}
          </div>
        </div>

        <style>{`@keyframes cardPop { 0%{opacity:0;transform:scale(0.3) rotate(-10deg);} 70%{transform:scale(1.08) rotate(2deg);opacity:1;} 100%{transform:scale(1) rotate(0deg);opacity:1;} }`}</style>
      </div>
    </div>
  );
}

export default UnderwaterCelebration;
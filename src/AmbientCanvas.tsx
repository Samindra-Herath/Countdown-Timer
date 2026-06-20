import React, { useEffect, useRef } from 'react';

type AnimationType = 'none' | 'music_notes' | 'matrix' | 'cyberpunk' | 'geometry';

interface AmbientCanvasProps {
  type: AnimationType;
  speed: number;
  density: number;
  colorHex: string;
  isPaused?: boolean;
}

export function AmbientCanvas({ type, speed, density, colorHex, isPaused = false }: AmbientCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Helper to parse hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    let r = 255, g = 255, b = 255;
    const cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      r = parseInt(cleanHex.charAt(0) + cleanHex.charAt(0), 16);
      g = parseInt(cleanHex.charAt(1) + cleanHex.charAt(1), 16);
      b = parseInt(cleanHex.charAt(2) + cleanHex.charAt(2), 16);
    } else if (cleanHex.length === 6) {
      r = parseInt(cleanHex.substring(0, 2), 16);
      g = parseInt(cleanHex.substring(2, 4), 16);
      b = parseInt(cleanHex.substring(4, 6), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || type === 'none') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationFrameId: number;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      initParticles();
    };

    let particles: any[] = [];
    const notesChars = ['♪', '♫', '♬', '♭', '♮'];
    const matrixChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');

    const initParticles = () => {
      particles = [];
      const particleCount = Math.floor(density);

      if (type === 'music_notes') {
        for (let i = 0; i < particleCount / 2; i++) {
          const size = 32 + Math.random() * 32; // 32px to 64px
          const isLarge = size >= 50;
          particles.push({
            initialX: Math.random() * width,
            y: Math.random() * height,
            char: notesChars[Math.floor(Math.random() * notesChars.length)],
            size: size,
            speedY: isLarge ? 1 + Math.random() * 1 : 0.4 + Math.random() * 0.5,
            baseOpacity: isLarge ? 0.15 : 0.05,
            frequency: 0.001 + Math.random() * 0.002, // 0.001 to 0.003
            amplitude: 20 + Math.random() * 20, // 20 to 40
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.02,
            timePhase: Math.random() * 10000
          });
        }
      } else if (type === 'matrix') {
        const columns = Math.max(10, Math.floor(width / 30));
        for (let i = 0; i < columns; i++) {
          particles.push({
            x: i * (width / columns),
            y: Math.random() * -height,
            speedY: 2 + Math.random() * 3,
            history: [] // { y, char, alpha }
          });
        }
      } else if (type === 'geometry') {
        for (let i = 0; i < particleCount / 2; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            radius: 2 + Math.random() * 8,
            shape: Math.random() > 0.5 ? 'circle' : 'triangle',
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.02
          });
        }
      } else if (type === 'cyberpunk') {
        particles = [{ yOffset: 0 }];
      }
    };

    const draw = (timeNow: number) => {
      animationFrameId = requestAnimationFrame(draw);
      if (isPaused) return;

      ctx.clearRect(0, 0, width, height);
      const vMultiplier = speed;

      if (type === 'music_notes') {
        ctx.fillStyle = hexToRgba(colorHex, 1);
        particles.forEach(p => {
          p.y -= p.speedY * vMultiplier;
          p.x = p.initialX + Math.sin((timeNow + p.timePhase) * p.frequency) * p.amplitude;
          p.rotation += p.rotSpeed * vMultiplier;

          let currentOpacity = p.baseOpacity;
          const topThreshold = height * 0.15;
          if (p.y < topThreshold) {
            currentOpacity = p.baseOpacity * Math.max(0, p.y / topThreshold);
          }

          if (p.y < -50) {
            p.y = height + 50;
            p.initialX = Math.random() * width;
            p.timePhase = Math.random() * 10000;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = currentOpacity;
          ctx.font = `${Math.floor(p.size)}px sans-serif`;
          ctx.fillText(p.char, 0, 0);
          ctx.restore();
        });
      } else if (type === 'matrix') {
        particles.forEach(p => {
          p.y += p.speedY * vMultiplier;
          if (Math.random() < 0.2 * vMultiplier) {
            p.history.unshift({
               y: p.y, 
               char: matrixChars[Math.floor(Math.random() * matrixChars.length)], 
               alpha: 0.15 
            });
          }
          if (p.y > height + 200) {
            p.y = Math.random() * -100;
            p.history = [];
          }

          if (p.history.length > 20) p.history.pop();

          p.history.forEach((h: any, i: number) => {
            h.alpha -= 0.005 * vMultiplier;
            if (h.alpha < 0) h.alpha = 0;
            ctx.fillStyle = hexToRgba(colorHex, i === 0 ? 0.3 : Math.min(0.15, h.alpha));
            ctx.font = "20px monospace";
            ctx.fillText(h.char, p.x, h.y);
          });
        });
      } else if (type === 'geometry') {
        ctx.fillStyle = hexToRgba(colorHex, 0.1);
        ctx.strokeStyle = hexToRgba(colorHex, 0.08);
        ctx.lineWidth = 1;

        particles.forEach(p => {
          p.x += p.vx * vMultiplier;
          p.y += p.vy * vMultiplier;
          p.rotation += p.rotSpeed * vMultiplier;

          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.beginPath();
          if (p.shape === 'circle') {
            ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          } else {
            ctx.moveTo(0, -p.radius);
            ctx.lineTo(p.radius * 0.866, p.radius * 0.5);
            ctx.lineTo(-p.radius * 0.866, p.radius * 0.5);
            ctx.closePath();
          }
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        });

        // lines
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
              ctx.beginPath();
              ctx.strokeStyle = hexToRgba(colorHex, 0.15 * (1 - dist / 150));
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      } else if (type === 'cyberpunk') {
        const state = particles[0];
        state.yOffset += 2 * vMultiplier;
        const spacing = 40;
        if (state.yOffset > spacing) state.yOffset -= spacing;

        const horizonY = height * 0.4;
        const cx = width / 2;
        
        ctx.strokeStyle = hexToRgba(colorHex, 0.15);
        ctx.lineWidth = 1;

        // vertical perspective lines
        for (let i = -10; i <= 10; i++) {
          ctx.beginPath();
          ctx.moveTo(cx, horizonY);
          const endX = cx + (i * width * 0.2);
          ctx.lineTo(endX, height);
          ctx.stroke();
        }

        // horizontal moving lines
        for (let i = 0; i < 25; i++) {
          const rawY = horizonY + Math.pow(i, 2.5) + state.yOffset * (i * 0.1);
          if (rawY > horizonY && rawY < height) {
            ctx.beginPath();
            ctx.moveTo(0, rawY);
            ctx.lineTo(width, rawY);
            ctx.stroke();
          }
        }
      }
    };

    window.addEventListener('resize', resize);
    resize();
    draw(performance.now());

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [type, speed, density, colorHex, isPaused]);

  if (type === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0 // Above background color, below UI
      }}
    />
  );
}

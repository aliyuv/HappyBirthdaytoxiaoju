
import React, { useEffect, useRef } from 'react';

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  twinkleDir: number;

  constructor(w: number, h: number) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.vx = (Math.random() - 0.5) * 0.25;
    this.vy = (Math.random() - 0.5) * 0.25;
    this.size = Math.random() * 1.5 + 0.5;
    this.alpha = Math.random() * 0.5 + 0.2;
    this.twinkleDir = Math.random() > 0.5 ? 1 : -1;
    
    // 10% Warm Amber, 90% Pale Blue/Purple
    this.color = Math.random() > 0.9 
      ? `245, 158, 11` // Amber
      : `180, 190, 255`; // Indigo/Blue
  }

  update(w: number, h: number, mouseX: number, mouseY: number) {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0) this.x = w;
    if (this.x > w) this.x = 0;
    if (this.y < 0) this.y = h;
    if (this.y > h) this.y = 0;

    // Subtle twinkle
    this.alpha += this.twinkleDir * 0.005;
    if (this.alpha > 0.7 || this.alpha < 0.2) this.twinkleDir *= -1;

    // Mouse Influence
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 100) {
      this.x -= dx * 0.01;
      this.y -= dy * 0.01;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

const ParticlesBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const count = Math.min(Math.floor(w / 10), isReduced ? 40 : 120);
    const particles: Particle[] = Array.from({ length: count }, () => new Particle(w, h));

    let frameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      
      // Draw Connections
      if (!isReduced) {
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = dx * dx + dy * dy;
            if (dist < 8000) {
              const alpha = (1 - dist / 8000) * 0.12;
              ctx.strokeStyle = `rgba(180, 190, 255, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      particles.forEach(p => {
        p.update(w, h, mousePos.current.x, mousePos.current.y);
        p.draw(ctx);
      });

      frameId = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 pointer-events-none w-full h-full"
      style={{ filter: 'blur(0.5px)' }}
    />
  );
};

export default ParticlesBackground;

'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ParticleTextEffectProps {
  text: string;
  className?: string;
}

export default function ParticleTextEffect({ text, className = '' }: ParticleTextEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Particle class
    class Particle {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      
      constructor(targetX: number, targetY: number, color: string) {
        // Start from random positions outside or near the edges
        const side = Math.floor(Math.random() * 4);
        if (side === 0) { // Top
          this.x = Math.random() * canvas!.width;
          this.y = -20;
        } else if (side === 1) { // Right
          this.x = canvas!.width + 20;
          this.y = Math.random() * canvas!.height;
        } else if (side === 2) { // Bottom
          this.x = Math.random() * canvas!.width;
          this.y = canvas!.height + 20;
        } else { // Left
          this.x = -20;
          this.y = Math.random() * canvas!.height;
        }

        this.targetX = targetX;
        this.targetY = targetY;
        this.vx = 0;
        this.vy = 0;
        this.color = color;
        this.size = 1.5; // Particle size
      }

      update() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        
        // Simple easing
        this.x += dx * 0.04;
        this.y += dy * 0.04;

        // Add some noise/wobble for organic feel
        // this.x += (Math.random() - 0.5) * 0.2;
        // this.y += (Math.random() - 0.5) * 0.2;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
    }

    let particles: Particle[] = [];
    
    // Draw text to get pixel data
    const init = () => {
      particles = [];
      ctx.fillStyle = 'white';
      // Match the font style from HomeHeroSection
      // text-5xl md:text-7xl lg:text-8xl -> approx 60px - 100px
      const fontSize = window.innerWidth < 768 ? 48 : window.innerWidth < 1024 ? 72 : 96;
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Handle multiline "La Palabra en" \n "Nueva Luz"
      const lines = ["La Palabra en", "Nueva Luz"];
      const lineHeight = fontSize * 1.2;
      const totalHeight = lines.length * lineHeight;
      const startY = (canvas.height - totalHeight) / 2 + lineHeight / 2;

      // Create gradient for "La Palabra en"
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, 'white');
      gradient.addColorStop(0.5, '#dbeafe'); // blue-100
      gradient.addColorStop(1, '#bfdbfe'); // blue-200
      
      lines.forEach((line, i) => {
        const y = startY + i * lineHeight;
        
        // Draw text
        if (i === 0) ctx.fillStyle = gradient; // Gradient for first line
        else ctx.fillStyle = 'white'; // White for second line
        
        ctx.fillText(line, canvas.width / 2, y);
      });

      // Scan for pixels
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the text

      // Sampling step (skip pixels to reduce count)
      const step = window.innerWidth < 768 ? 3 : 4; 

      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const index = (y * canvas.width + x) * 4;
          const alpha = data[index + 3];
          
          if (alpha > 0) {
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const color = `rgba(${r}, ${g}, ${b}, ${alpha / 255})`;
            
            particles.push(new Particle(x, y, color));
          }
        }
      }
    };

    init();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      
      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animId);

  }, [dimensions, text]);

  return (
    <div ref={containerRef} className={`w-full h-[160px] md:h-[260px] relative ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}

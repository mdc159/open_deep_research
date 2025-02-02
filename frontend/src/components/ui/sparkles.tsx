"use client";
import { useEffect, useRef } from "react";
import { useMousePosition } from "@/hooks/use-mouse-position";

interface SparklesCoreProps {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  className?: string;
  particleDensity?: number;
}

export const SparklesCore = (props: SparklesCoreProps) => {
  const {
    id = "tsparticles",
    background = "transparent",
    minSize = 0.6,
    maxSize = 1.4,
    speed = 1,
    particleColor = "#FFFFFF",
    className = "",
    particleDensity = 100,
  } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosition = useMousePosition();
  const particlesRef = useRef<Array<Particle>>([]);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    contextRef.current = ctx;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<Particle> = [];
    const particleCount = particleDensity;

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * (maxSize - minSize) + minSize,
        speedX: (Math.random() - 0.5) * speed,
        speedY: (Math.random() - 0.5) * speed,
        color: particleColor,
      }));
    }
    particlesRef.current = particles;

    const animate = () => {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle) => {
        particle.update(canvas.width, canvas.height);
        particle.draw(ctx);

        // Add interactivity with mouse
        if (mousePosition.x !== null && mousePosition.y !== null) {
          const dx = mousePosition.x - particle.x;
          const dy = mousePosition.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const angle = Math.atan2(dy, dx);
            const force = (100 - distance) / 100;
            
            particle.x -= Math.cos(angle) * force * speed;
            particle.y -= Math.sin(angle) * force * speed;
          }
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [maxSize, minSize, particleColor, particleDensity, speed]);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      className={className}
      style={{
        background: background,
      }}
    />
  );
};

class Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;

  constructor({
    x,
    y,
    size,
    speedX,
    speedY,
    color,
  }: {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    color: string;
  }) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speedX = speedX;
    this.speedY = speedY;
    this.color = color;
  }

  update(width: number, height: number) {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x > width) {
      this.x = 0;
    } else if (this.x < 0) {
      this.x = width;
    }

    if (this.y > height) {
      this.y = 0;
    } else if (this.y < 0) {
      this.y = height;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
} 
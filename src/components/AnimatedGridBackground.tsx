"use client";

import { useEffect, useRef } from "react";

export default function AnimatedGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 获取当前主题
      const isDark = document.documentElement.classList.contains('dark');
      
      // 设置网格参数
      const gridSize = 40;
      const perspective = 0.8;
      const waveSpeed = 0.01;
      const waveAmplitude = 5;
      
      // 设置线条样式
      ctx.strokeStyle = isDark 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 1;
      
      // 绘制垂直线
      for (let x = 0; x < canvas.width + gridSize; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        
        // 添加波浪效果和透视
        for (let y = 0; y < canvas.height; y += 5) {
          const wave = Math.sin((y + time * 100) * waveSpeed) * waveAmplitude;
          const perspectiveX = x + wave + (y * perspective * 0.1);
          ctx.lineTo(perspectiveX, y);
        }
        
        ctx.stroke();
      }
      
      // 绘制水平线
      for (let y = 0; y < canvas.height + gridSize; y += gridSize) {
        ctx.beginPath();
        
        // 添加透视效果
        const perspectiveY = y + (y * perspective * 0.05);
        ctx.moveTo(0, perspectiveY);
        
        for (let x = 0; x < canvas.width; x += 5) {
          const wave = Math.sin((x + time * 80) * waveSpeed * 1.2) * (waveAmplitude * 0.7);
          const finalY = perspectiveY + wave;
          ctx.lineTo(x, finalY);
        }
        
        ctx.stroke();
      }
      
      // 添加渐变叠加
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
      );
      
      if (isDark) {
        gradient.addColorStop(0, 'rgba(15, 23, 42, 0)');
        gradient.addColorStop(0.5, 'rgba(15, 23, 42, 0.3)');
        gradient.addColorStop(1, 'rgba(15, 23, 42, 0.8)');
      } else {
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const animate = () => {
      time += 0.01;
      drawGrid();
      animationFrameId = requestAnimationFrame(animate);
    };

    // 初始化
    resizeCanvas();
    animate();

    // 监听窗口大小变化
    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    // 监听主题变化
    const observer = new MutationObserver(() => {
      drawGrid();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: 'transparent' }}
      />
      
      {/* 额外的渐变叠加层 */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/80 pointer-events-none" />
      
      {/* 径向渐变中心点 */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/50 pointer-events-none" />
    </div>
  );
}
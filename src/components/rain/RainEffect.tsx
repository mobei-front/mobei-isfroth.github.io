import { useEffect, useRef } from 'react';

// 雨滴
interface Raindrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  thickness: number;
}

// 涟漪
interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  speed: number;
}

// 溅射小水珠
interface Splash {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  life: number;
  maxLife: number;
}

interface RainEffectProps {
  interactiveElements?: HTMLElement[];
}

export default function RainEffect({ interactiveElements = [] }: RainEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raindropsRef = useRef<Raindrop[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const splashesRef = useRef<Splash[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const animationRef = useRef<number>(0);
  const interactiveRectsRef = useRef<DOMRect[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 画布尺寸跟随窗口
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initRaindrops();
    };

    // 初始化雨滴，数量随屏幕大小自动调整
    const initRaindrops = () => {
      const count = Math.floor((canvas.width * canvas.height) / 12000);
      raindropsRef.current = [];
      for (let i = 0; i < count; i++) {
        raindropsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          length: Math.random() * 20 + 10,
          speed: Math.random() * 15 + 10,
          opacity: Math.random() * 0.4 + 0.1,
          thickness: Math.random() * 1.5 + 0.5,
        });
      }
    };

    // 更新交互元素的位置，用于碰撞检测
    const updateInteractiveRects = () => {
      interactiveRectsRef.current = interactiveElements
        .filter(el => el && el.getBoundingClientRect)
        .map(el => el.getBoundingClientRect());
    };

    // 生成一个涟漪
    const createRipple = (x: number, y: number, size: number = 1) => {
      ripplesRef.current.push({
        x,
        y,
        radius: 0,
        maxRadius: 30 + Math.random() * 20 * size,
        opacity: 0.6,
        speed: 2 + Math.random() * 1,
      });
    };

    // 生成溅射的小水珠
    const createSplash = (x: number, y: number, count: number = 3) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.PI + (Math.random() - 0.5) * Math.PI;
        const speed = 2 + Math.random() * 3;
        splashesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          opacity: 0.8,
          life: 0,
          maxLife: 30 + Math.random() * 20,
        });
      }
    };

    // 检查雨滴是否落在了卡片上
    const checkCollision = (x: number, y: number): boolean => {
      for (const rect of interactiveRectsRef.current) {
        if (
          x >= rect.left &&
          x <= rect.right &&
          y >= rect.top &&
          y <= rect.bottom
        ) {
          return true;
        }
      }
      return false;
    };

    // 逐帧动画
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 背景渐变（淡淡的）
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0, 10, 26, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 20, 51, 0.3)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 处理雨滴
      for (let i = raindropsRef.current.length - 1; i >= 0; i--) {
        const drop = raindropsRef.current[i];

        // 鼠标附近的雨滴会被轻微"推开"，有种引力场的感觉
        const mouseDist = Math.sqrt(
          Math.pow(drop.x - mouseRef.current.x, 2) +
          Math.pow(drop.y - mouseRef.current.y, 2)
        );

        if (mouseDist < 80 && mouseRef.current.active) {
          const angle = Math.atan2(drop.y - mouseRef.current.y, drop.x - mouseRef.current.x);
          const force = (80 - mouseDist) / 80 * 2;
          drop.x += Math.cos(angle) * force;
          drop.y += Math.sin(angle) * force * 0.5;
        }

        drop.y += drop.speed;

        // 碰到卡片了
        const hitElement = checkCollision(drop.x, drop.y);
        if (hitElement && drop.speed > 0) {
          createRipple(drop.x, drop.y, 0.5);
          createSplash(drop.x, drop.y, 2);
          drop.y = -drop.length;
          drop.x = Math.random() * canvas.width;
          continue;
        }

        // 掉到底部了
        if (drop.y > canvas.height) {
          createRipple(drop.x, canvas.height - 5, 1);
          createSplash(drop.x, canvas.height - 5, 3);
          drop.y = -drop.length;
          drop.x = Math.random() * canvas.width;
        }

        // 画雨滴（带渐变尾迹）
        const dropGradient = ctx.createLinearGradient(
          drop.x,
          drop.y - drop.length,
          drop.x,
          drop.y
        );
        dropGradient.addColorStop(0, 'rgba(150, 200, 255, 0)');
        dropGradient.addColorStop(1, `rgba(150, 200, 255, ${drop.opacity})`);

        ctx.beginPath();
        ctx.strokeStyle = dropGradient;
        ctx.lineWidth = drop.thickness;
        ctx.lineCap = 'round';
        ctx.moveTo(drop.x, drop.y - drop.length);
        ctx.lineTo(drop.x, drop.y);
        ctx.stroke();
      }

      // 处理涟漪
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const ripple = ripplesRef.current[i];
        ripple.radius += ripple.speed;
        ripple.opacity -= 0.02;

        if (ripple.opacity <= 0 || ripple.radius >= ripple.maxRadius) {
          ripplesRef.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.ellipse(
          ripple.x,
          ripple.y,
          ripple.radius,
          ripple.radius * 0.3,
          0,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = `rgba(150, 200, 255, ${ripple.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 处理溅射水珠
      for (let i = splashesRef.current.length - 1; i >= 0; i--) {
        const splash = splashesRef.current[i];
        splash.life++;
        splash.vy += 0.15;
        splash.x += splash.vx;
        splash.y += splash.vy;
        splash.opacity = 1 - splash.life / splash.maxLife;

        if (splash.opacity <= 0 || splash.life >= splash.maxLife) {
          splashesRef.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(splash.x, splash.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150, 200, 255, ${splash.opacity * 0.8})`;
        ctx.fill();
      }

      // 鼠标光晕
      if (mouseRef.current.active) {
        const mouseGradient = ctx.createRadialGradient(
          mouseRef.current.x,
          mouseRef.current.y,
          0,
          mouseRef.current.x,
          mouseRef.current.y,
          60
        );
        mouseGradient.addColorStop(0, 'rgba(0, 240, 255, 0.1)');
        mouseGradient.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx.fillStyle = mouseGradient;
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 60, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // 鼠标移动
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;

      // 偶尔在鼠标位置生成小涟漪
      if (Math.random() < 0.1) {
        createRipple(e.clientX, e.clientY, 0.3);
      }
    };

    // 鼠标离开
    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    // 点击产生大水花
    const handleClick = (e: MouseEvent) => {
      createRipple(e.clientX, e.clientY, 1.5);
      createSplash(e.clientX, e.clientY, 8);
    };

    // 初始化
    resizeCanvas();
    updateInteractiveRects();
    animate();

    // 监听事件
    window.addEventListener('resize', () => {
      resizeCanvas();
      updateInteractiveRects();
    });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    // 定期更新交互元素位置，防止布局变化后碰撞检测不准
    const rectInterval = setInterval(updateInteractiveRects, 500);

    // 清理
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
      clearInterval(rectInterval);
    };
  }, [interactiveElements]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-10"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

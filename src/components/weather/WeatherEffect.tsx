import { useEffect, useRef } from 'react';
import { useWeatherStore, getWeatherType } from '@/store/weather';

interface Particle {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  thickness: number;
  wobble: number;
  wobbleSpeed: number;
}

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  wobble: number;
  wobbleSpeed: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  speed: number;
}

interface Splash {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  life: number;
  maxLife: number;
}

interface Explosion {
  x: number;
  y: number;
  particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; opacity: number; size: number }[];
}

interface FogParticle {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speedX: number;
  speedY: number;
  wobble: number;
}

interface WeatherEffectProps {
  interactiveElements?: HTMLElement[];
}

function getWindAngle(direction: string): number {
  const directions: Record<string, number> = {
    '北风': 0,
    '东北风': 45,
    '东风': 90,
    '东南风': 135,
    '南风': 180,
    '西南风': 225,
    '西风': 270,
    '西北风': 315,
  };
  for (const key of Object.keys(directions)) {
    if (direction.includes(key)) {
      return directions[key];
    }
  }
  return 0;
}

class RainAudio {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private sourceNodes: AudioBufferSourceNode[] = [];
  private volume = 0.3;

  private createNoiseBuffer(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized');
    const bufferSize = this.audioContext.sampleRate * 2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private createFilteredNoise(type: 'light' | 'heavy'): AudioBufferSourceNode {
    if (!this.audioContext) throw new Error('AudioContext not initialized');
    
    const source = this.audioContext.createBufferSource();
    source.buffer = this.createNoiseBuffer();
    source.loop = true;

    const filter = this.audioContext.createBiquadFilter();
    if (type === 'light') {
      filter.type = 'lowpass';
      filter.frequency.value = 800;
    } else {
      filter.type = 'lowpass';
      filter.frequency.value = 1500;
    }

    const gain = this.audioContext.createGain();
    gain.gain.value = type === 'light' ? 0.15 : 0.3;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNode!);

    return source;
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.volume;
      this.gainNode.connect(this.audioContext.destination);
    }
  }

  play(type: 'light' | 'heavy') {
    if (this.isPlaying) return;
    
    this.init();
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }

    const noiseSource = this.createFilteredNoise(type);
    noiseSource.start();
    this.sourceNodes.push(noiseSource);
    this.isPlaying = true;
  }

  stop() {
    this.sourceNodes.forEach(node => {
      try {
        node.stop();
        node.disconnect();
      } catch (e) {}
    });
    this.sourceNodes = [];
    this.isPlaying = false;
  }

  setVolume(value: number) {
    this.volume = value;
    if (this.gainNode) {
      this.gainNode.gain.value = value;
    }
  }

  get isActive() {
    return this.isPlaying;
  }
}

const rainAudio = new RainAudio();

export default function WeatherEffect({ interactiveElements = [] }: WeatherEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const snowflakesRef = useRef<Snowflake[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const splashesRef = useRef<Splash[]>([]);
  const explosionsRef = useRef<Explosion[]>([]);
  const fogParticlesRef = useRef<FogParticle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const animationRef = useRef<number>(0);
  const interactiveRectsRef = useRef<DOMRect[]>([]);
  
  const { data: weatherData } = useWeatherStore();
  const weatherType = weatherData ? getWeatherType(weatherData) : 'sunny';
  const windAngle = weatherData ? getWindAngle(weatherData.windDirection) : 0;
  const windForce = weatherData ? Math.min(weatherData.windLevel * 0.3, 2) : 0.5;

  useEffect(() => {
    const shouldPlayRain = weatherType === 'rain' || weatherType === 'heavy_rain' || weatherType === 'thunder';
    const rainIntensity = weatherType === 'heavy_rain' || weatherType === 'thunder' ? 'heavy' : 'light';

    if (shouldPlayRain && !rainAudio.isActive) {
      rainAudio.play(rainIntensity);
    } else if (!shouldPlayRain && rainAudio.isActive) {
      rainAudio.stop();
    }

    return () => {
      rainAudio.stop();
    };
  }, [weatherType]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particlesRef.current = [];
      snowflakesRef.current = [];
      fogParticlesRef.current = [];

      if (weatherType === 'rain' || weatherType === 'heavy_rain' || weatherType === 'thunder') {
        const count = Math.floor((canvas.width * canvas.height) / (weatherType === 'heavy_rain' ? 4000 : 10000));
        for (let i = 0; i < count; i++) {
          particlesRef.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            length: Math.random() * 30 + 15,
            speed: Math.random() * 25 + 20,
            opacity: Math.random() * 0.6 + 0.2,
            thickness: Math.random() * 2.5 + 0.8,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.15 + 0.05,
          });
        }
      } else if (weatherType === 'snow' || weatherType === 'heavy_snow') {
        const count = Math.floor((canvas.width * canvas.height) / (weatherType === 'heavy_snow' ? 6000 : 12000));
        for (let i = 0; i < count; i++) {
          snowflakesRef.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 4 + 1.5,
            speed: Math.random() * 2.5 + 0.8,
            opacity: Math.random() * 0.7 + 0.4,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.05 + 0.02,
          });
        }
      } else if (weatherType === 'fog') {
        const count = Math.floor((canvas.width * canvas.height) / 8000);
        for (let i = 0; i < count; i++) {
          fogParticlesRef.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 150 + 80,
            opacity: Math.random() * 0.15 + 0.05,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.2,
            wobble: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    const updateInteractiveRects = () => {
      interactiveRectsRef.current = interactiveElements
        .filter(el => el && el.getBoundingClientRect)
        .map(el => el.getBoundingClientRect());
    };

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

    const createExplosion = (x: number, y: number, count: number = 12) => {
      const particles = [];
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const speed = 3 + Math.random() * 5;
        particles.push({
          x: 0,
          y: 0,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 40 + Math.random() * 20,
          opacity: 0.8 + Math.random() * 0.2,
          size: 1 + Math.random() * 2,
        });
      }
      explosionsRef.current.push({ x, y, particles });
    };

    const checkCollision = (x: number, y: number): boolean => {
      for (const rect of interactiveRectsRef.current) {
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          return true;
        }
      }
      return false;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (weatherType === 'fog') {
        const gradient = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, 0,
          canvas.width / 2, canvas.height / 2, canvas.width * 0.8
        );
        gradient.addColorStop(0, 'rgba(100, 120, 140, 0.2)');
        gradient.addColorStop(0.5, 'rgba(80, 100, 120, 0.35)');
        gradient.addColorStop(1, 'rgba(60, 80, 100, 0.5)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (const fog of fogParticlesRef.current) {
          fog.wobble += 0.005;
          fog.x += fog.speedX + Math.sin(fog.wobble) * 0.2;
          fog.y += fog.speedY;

          if (fog.x < -fog.radius) fog.x = canvas.width + fog.radius;
          if (fog.x > canvas.width + fog.radius) fog.x = -fog.radius;
          if (fog.y < -fog.radius) fog.y = canvas.height + fog.radius;
          if (fog.y > canvas.height + fog.radius) fog.y = -fog.radius;

          const fogGradient = ctx.createRadialGradient(
            fog.x, fog.y, 0,
            fog.x, fog.y, fog.radius
          );
          fogGradient.addColorStop(0, `rgba(180, 190, 200, ${fog.opacity})`);
          fogGradient.addColorStop(1, 'rgba(180, 190, 200, 0)');
          ctx.fillStyle = fogGradient;
          ctx.beginPath();
          ctx.arc(fog.x, fog.y, fog.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (weatherType === 'sunny') {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(0, 10, 26, 0.03)');
        gradient.addColorStop(1, 'rgba(0, 20, 51, 0.1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (weatherType === 'cloudy') {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(0, 10, 26, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 20, 51, 0.5)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        if (weatherType === 'thunder') {
          gradient.addColorStop(0, 'rgba(20, 30, 50, 0.3)');
          gradient.addColorStop(1, 'rgba(10, 20, 40, 0.5)');
        } else {
          gradient.addColorStop(0, 'rgba(0, 10, 26, 0.15)');
          gradient.addColorStop(1, 'rgba(0, 20, 51, 0.4)');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const windRad = (windAngle * Math.PI) / 180;
      const windX = Math.cos(windRad) * windForce;
      const windY = Math.sin(windRad) * windForce * 0.3;

      if ((weatherType === 'rain' || weatherType === 'heavy_rain' || weatherType === 'thunder') && particlesRef.current.length > 0) {
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const drop = particlesRef.current[i];

          const mouseDist = Math.sqrt(
            Math.pow(drop.x - mouseRef.current.x, 2) +
            Math.pow(drop.y - mouseRef.current.y, 2)
          );

          if (mouseDist < 50 && mouseRef.current.active) {
            createExplosion(drop.x, drop.y, 6);
            drop.y = -drop.length;
            drop.x = Math.random() * canvas.width;
            continue;
          }

          drop.wobble += drop.wobbleSpeed;
          const wobbleOffset = Math.sin(drop.wobble) * 2;

          drop.x += drop.speed * windX * 0.5 + wobbleOffset * 0.1;
          drop.y += drop.speed * (1 + windY);

          const hitElement = checkCollision(drop.x, drop.y);
          if (hitElement && drop.speed > 0) {
            createRipple(drop.x, drop.y, 0.5);
            createSplash(drop.x, drop.y, 2);
            drop.y = -drop.length;
            drop.x = Math.random() * canvas.width;
            continue;
          }

          if (drop.y > canvas.height) {
            createRipple(drop.x, canvas.height - 5, 1);
            createSplash(drop.x, canvas.height - 5, 3);
            drop.y = -drop.length;
            drop.x = Math.random() * canvas.width;
          }

          if (drop.x < -50) drop.x = canvas.width + 50;
          if (drop.x > canvas.width + 50) drop.x = -50;

          const angle = Math.atan2(drop.speed * (1 + windY), drop.speed * windX * 0.5);
          const endX = drop.x + Math.cos(angle) * drop.length;
          const endY = drop.y + Math.sin(angle) * drop.length;

          const dropGradient = ctx.createLinearGradient(drop.x, drop.y, endX, endY);
          dropGradient.addColorStop(0, 'rgba(150, 200, 255, 0)');
          dropGradient.addColorStop(1, `rgba(150, 200, 255, ${drop.opacity})`);

          ctx.beginPath();
          ctx.strokeStyle = dropGradient;
          ctx.lineWidth = drop.thickness;
          ctx.lineCap = 'round';
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      }

      if ((weatherType === 'snow' || weatherType === 'heavy_snow') && snowflakesRef.current.length > 0) {
        for (let i = snowflakesRef.current.length - 1; i >= 0; i--) {
          const snow = snowflakesRef.current[i];

          const mouseDist = Math.sqrt(
            Math.pow(snow.x - mouseRef.current.x, 2) +
            Math.pow(snow.y - mouseRef.current.y, 2)
          );

          if (mouseDist < 50 && mouseRef.current.active) {
            createExplosion(snow.x, snow.y, 8);
            snowflakesRef.current.splice(i, 1);
            continue;
          }

          snow.wobble += snow.wobbleSpeed;
          const wobbleOffset = Math.sin(snow.wobble) * 5;

          snow.x += windX * snow.speed * 2 + wobbleOffset;
          snow.y += snow.speed;

          if (snow.y > canvas.height) {
            snow.y = -10;
            snow.x = Math.random() * canvas.width;
          }

          if (snow.x < -10) snow.x = canvas.width + 10;
          if (snow.x > canvas.width + 10) snow.x = -10;

          ctx.beginPath();
          ctx.arc(snow.x, snow.y, snow.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${snow.opacity})`;
          ctx.fill();
        }
      }

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

      for (let i = explosionsRef.current.length - 1; i >= 0; i--) {
        const explosion = explosionsRef.current[i];
        let allDead = true;

        for (let j = explosion.particles.length - 1; j >= 0; j--) {
          const particle = explosion.particles[j];
          particle.life++;
          particle.vy += 0.1;
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.opacity = 1 - particle.life / particle.maxLife;

          if (particle.opacity > 0) {
            allDead = false;
            ctx.beginPath();
            ctx.arc(explosion.x + particle.x, explosion.y + particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            ctx.fill();
          }
        }

        if (allDead) {
          explosionsRef.current.splice(i, 1);
        }
      }

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

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;

      if ((weatherType === 'rain' || weatherType === 'heavy_rain') && Math.random() < 0.1) {
        createRipple(e.clientX, e.clientY, 0.3);
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    const handleClick = (e: MouseEvent) => {
      if (weatherType === 'rain' || weatherType === 'heavy_rain') {
        createRipple(e.clientX, e.clientY, 1.5);
        createSplash(e.clientX, e.clientY, 8);
        
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const drop = particlesRef.current[i];
          const dist = Math.sqrt(
            Math.pow(drop.x - e.clientX, 2) +
            Math.pow(drop.y - e.clientY, 2)
          );
          if (dist < 80) {
            createExplosion(drop.x, drop.y, 6);
            drop.y = -drop.length;
            drop.x = Math.random() * canvas.width;
          }
        }
      }

      if (weatherType === 'snow' || weatherType === 'heavy_snow') {
        createExplosion(e.clientX, e.clientY, 15);
        
        for (let i = snowflakesRef.current.length - 1; i >= 0; i--) {
          const snow = snowflakesRef.current[i];
          const dist = Math.sqrt(
            Math.pow(snow.x - e.clientX, 2) +
            Math.pow(snow.y - e.clientY, 2)
          );
          if (dist < 80) {
            createExplosion(snow.x, snow.y, 6);
            snowflakesRef.current.splice(i, 1);
          }
        }
      }
    };

    resizeCanvas();
    updateInteractiveRects();
    animate();

    window.addEventListener('resize', () => {
      resizeCanvas();
      updateInteractiveRects();
    });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    const rectInterval = setInterval(updateInteractiveRects, 500);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
      clearInterval(rectInterval);
    };
  }, [interactiveElements, weatherType, windAngle, windForce]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-10"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
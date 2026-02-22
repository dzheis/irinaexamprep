"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import Lottie from 'lottie-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import calendarAnimation from '@/../public/lottie/calendar_default.json';
import clockAnimation from '@/../public/lottie/clock_default.json';
import consultationAnimation from '@/../public/lottie/consultation_default.json';

gsap.registerPlugin(ScrollTrigger);

const MAX_TILT_DEG = 5;
const TILT_SOFTEN = 0.75;
const TILT_SMOOTH = 0.15;

type Feature = {
  title: string;
  description: string;
  animation: object;
};

const features: Feature[] = [
  {
    title: 'Индивидуальные планы обучения',
    description: 'Каждый ученик получает персональную программу обучения, адаптированную под его уровень и цели.',
    animation: calendarAnimation,
  },
  {
    title: 'Эффективное управление временем',
    description: 'Вы научитесь правильно распределять время и готовиться к экзаменам максимально эффективно.',
    animation: clockAnimation,
  },
  {
    title: 'Экспертная подготовка к экзаменам',
    description: 'Опытные преподаватель с многолетним опытом подготовки к экзаменам различного уровня.',
    animation: consultationAnimation,
  },
];

function TiltCard({
  feature,
  cardRef,
}: {
  feature: Feature;
  cardRef: (el: HTMLDivElement | null) => void;
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const innerRef = useRef<HTMLDivElement>(null);
  const targetTiltRef = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const inner = innerRef.current;
    if (!inner) return;
    const rect = inner.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const halfW = Math.max(rect.width / 2, 1);
    const halfH = Math.max(rect.height / 2, 1);
    const xRatio = Math.max(-1, Math.min(1, (e.clientX - centerX) / halfW)) * TILT_SOFTEN;
    const yRatio = Math.max(-1, Math.min(1, (e.clientY - centerY) / halfH)) * TILT_SOFTEN;
    targetTiltRef.current = {
      x: -yRatio * MAX_TILT_DEG,
      y: xRatio * MAX_TILT_DEG,
    };
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    targetTiltRef.current = { x: 0, y: 0 };
    setTilt({ x: 0, y: 0 });
    setIsHovering(false);
  }, []);

  useEffect(() => {
    let rafId: number;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const tick = () => {
      const target = targetTiltRef.current;
      setTilt((prev) => {
        const next = {
          x: lerp(prev.x, target.x, TILT_SMOOTH),
          y: lerp(prev.y, target.y, TILT_SMOOTH),
        };
        if (Math.abs(next.x - target.x) < 0.01 && Math.abs(next.y - target.y) < 0.01) {
          return target;
        }
        return next;
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      ref={cardRef}
      className="flex p-3 cursor-pointer"
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={innerRef}
        className={`glass rounded-2xl p-8 flex flex-col items-center text-center h-full transition-[transform,box-shadow] ${isHovering ? 'duration-25' : 'duration-500 ease-in-out'} ${isHovering ? 'shadow-xl' : ''}`}
        style={{
          transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovering ? 1.02 : 1})`,
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 overflow-hidden bg-theme-secondary-accent">
          <Lottie
            animationData={feature.animation}
            loop={true}
            autoplay={true}
            className="w-12 h-12"
          />
        </div>
        <h3 className="text-xl md:text-2xl font-bold mb-4 text-theme">
          {feature.title}
        </h3>
        <p className="text-base md:text-lg leading-relaxed text-theme-accent">
          {feature.description}
        </p>
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsWrapperRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    let ctx: ReturnType<typeof gsap.context> | null = null;
    const rafId = requestAnimationFrame(() => {
      const section = sectionRef.current;
      const header = headerRef.current;
      const cardsWrapper = cardsWrapperRef.current;
      const cards = cardsRef.current.filter(Boolean);
      if (!section || !header || !cardsWrapper || cards.length === 0) return;

      ctx = gsap.context(() => {
        gsap.set(header, { opacity: 0, x: 60 });
        gsap.set(cards, { opacity: 0, x: 60 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: cardsWrapper,
            start: 'top 70%',
            once: true,
          },
        });

        tl.to(header, {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power2.out',
        }).to(cards, {
          opacity: 1,
          x: 0,
          duration: 0.7,
          stagger: 0.2,
          ease: 'power2.out',
        });
      }, section);
    });

    return () => {
      cancelAnimationFrame(rafId);
      ctx?.revert();
    };
  }, []);

  return (
    <section className="section py-16 md:py-24" ref={sectionRef}>
      <div className="max-w-7xl mx-auto">
        <div ref={headerRef} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-theme">
            Индивидуальный подход
          </h2>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto text-theme">
            Большой опыт преподавания и современная методика обучения.
          </p>
        </div>
        <div ref={cardsWrapperRef} className="grid grid-cols-1 md:grid-cols-3 gap-8" style={{ perspective: '1000px' }}>
          {features.map((feature, i) => (
            <TiltCard
              key={feature.title}
              feature={feature}
              cardRef={(el) => {
                if (el) cardsRef.current[i] = el;
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

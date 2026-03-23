"use client";

import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useScrollLock } from '@/components/ui/SmoothScroll';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import type { TestimonialsBlockContent } from '@/lib/storyblok-types';

const BASE_DURATION_SEC = 20;
const DECAY = 0.035;
const VELOCITY_SAMPLE_MS = 80;
const MAX_VELOCITY = 2500;

type Testimonial = {
  id: number;
  name: string;
  role: string;
  text: string;
  avatar: string;
  certificateImage?: string;
};

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Анна Смирнова',
    role: 'Студентка МГУ',
    text: 'Просто лучший преподаватель!',
    avatar: '/icons/placeholder-avatar.svg',
    certificateImage: '/icons/placeholder-certificate.svg',
  },
  {
    id: 2,
    name: 'Михаил Петров',
    role: 'Выпускник 2024',
    text: 'Отличный преподаватель! За полгода подготовки мой уровень вырос с B1 до C1. Рекомендую всем, кто хочет реальных результатов.',
    avatar: '/icons/placeholder-avatar.svg',
    certificateImage: '/icons/placeholder-certificate.svg',
  },
  {
    id: 3,
    name: 'Елена Козлова',
    role: 'Студентка ВШЭ',
    text: 'Ирина помогла мне не только подготовиться к экзамену, но и полюбить английский язык. Уроки всегда интересные и продуктивные!',
    avatar: '/icons/placeholder-avatar.svg',
    certificateImage: '/icons/placeholder-certificate.svg',
  },
  {
    id: 4,
    name: 'Дмитрий Волков',
    role: 'Выпускник 2023',
    text: 'Сдал IELTS на 7.5 после курса подготовки. Очень благодарен за индивидуальный подход и постоянную поддержку!',
    avatar: '/icons/placeholder-avatar.svg',
    certificateImage: '/icons/placeholder-certificate.svg',
  },
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
  const scrollLock = useScrollLock();

  useBodyScrollLock(certModalOpen);

  useEffect(() => {
    if (!certModalOpen) return;
    const id = requestAnimationFrame(() => {
      setModalVisible(true);
    });
    return () => cancelAnimationFrame(id);
  }, [certModalOpen]);

  useEffect(() => {
    if (!certModalOpen || !scrollLock) return;
    scrollLock.lockScroll();
    return () => {
      scrollLock.unlockScroll();
    };
  }, [certModalOpen, scrollLock]);

  const handleCloseModal = useCallback(() => {
    if (modalClosing) return;
    setModalClosing(true);
  }, [modalClosing]);

  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent) => {
      if (e.propertyName === 'opacity' && modalClosing) {
        setCertModalOpen(false);
        setModalClosing(false);
        setModalVisible(false);
      }
    },
    [modalClosing]
  );

  return (
    <>
      <div
        className="glass rounded-2xl p-6 flex-shrink-0 flex flex-col min-h-0 transition-shadow duration-300 ease-in-out hover:shadow-xl testimonial-card"
      >
        <div className="flex items-start gap-4 mb-4 flex-shrink-0">
          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-theme-secondary-accent select-none aspect-square">
            <Image
              src={testimonial.avatar || '/icons/placeholder-avatar.svg'}
              alt={testimonial.name}
              fill
              className="object-cover object-center pointer-events-none"
              draggable={false}
              sizes="48px"
            />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <p className="font-semibold text-base min-[1200px]:text-xl text-theme truncate">
              {testimonial.name}
            </p>
            <p className="text-xs min-[1200px]:text-base text-theme-accent truncate">
              {testimonial.role}
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
          {testimonial.certificateImage && (
            <div
              className="relative w-[40%] max-w-[40%] min-w-20 aspect-[3/4] float-right ml-4 mb-2 rounded-lg overflow-hidden flex-shrink-0 cursor-zoom-in select-none transition-[filter,box-shadow] duration-200 hover:brightness-105 hover:shadow-lg active:brightness-100"
              role="button"
              tabIndex={0}
              onClick={() => setCertModalOpen(true)}
              onKeyDown={(e) => e.key === 'Enter' && setCertModalOpen(true)}
              aria-label="Открыть сертификат в полном размере"
            >
              <Image
                src={testimonial.certificateImage}
                alt={`Сертификат ${testimonial.name}`}
                fill
                className="object-contain object-center pointer-events-none"
                draggable={false}
                sizes="152px"
              />
            </div>
          )}
          <p className="text-sm min-[1200px]:text-lg leading-relaxed text-justify text-theme break-words hyphens-auto">
            &ldquo;{testimonial.text}&rdquo;
          </p>
        </div>
      </div>

      {certModalOpen &&
        testimonial.certificateImage &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 transition-opacity duration-500 ease-out ${
              modalVisible && !modalClosing ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleCloseModal}
            onTransitionEnd={handleTransitionEnd}
            onWheel={(e) => {
              if (e.target === e.currentTarget) e.preventDefault();
              e.stopPropagation();
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Сертификат в полном размере"
          >
            <div
              className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none p-4"
              aria-hidden
            >
              <div
                className={`relative w-full h-full max-w-[80vw] max-h-[80vh] origin-center transition-transform duration-500 ease-out ${
                  modalVisible && !modalClosing ? 'scale-100' : 'scale-[0.85]'
                }`}
              >
                <Image
                  src={testimonial.certificateImage}
                  alt={`Сертификат ${testimonial.name} — полный размер`}
                  fill
                  className="object-contain"
                  sizes="80vw"
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

type TestimonialsSectionProps = { data?: TestimonialsBlockContent | null };

function testimonialsFromData(data: TestimonialsBlockContent | null | undefined): Testimonial[] {
  const items = data?.items?.filter((i) => i.name?.trim() && i.text?.trim());
  if (!items?.length) return DEFAULT_TESTIMONIALS;
  return items.map((item, i) => ({
    id: i + 1,
    name: item.name!.trim(),
    role: (item.role?.trim() ?? ''),
    text: item.text!.trim(),
    avatar: (item.avatar?.filename && item.avatar.filename.trim()) ? item.avatar.filename.trim() : '/icons/placeholder-avatar.svg',
    certificateImage: (item.certificate_image?.filename && item.certificate_image.filename.trim()) ? item.certificate_image.filename.trim() : undefined,
  }));
}

export default function TestimonialsSection({ data }: TestimonialsSectionProps) {
  const testimonials = useMemo(() => testimonialsFromData(data), [data]);
  const sectionTitle = data?.title?.trim() || 'Отзывы студентов';

  const trackRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const translateX = useRef(0);
  const velocity = useRef(0);
  const baseSpeed = useRef(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startTranslateX = useRef(0);
  const pointerId = useRef<number | null>(null);
  const lastMove = useRef<{ x: number; t: number }[]>([]);
  const rafId = useRef<number | null>(null);
  const lastTime = useRef(0);

  // Две копии списка отзывов в strip — бесконечная прокрутка; segment = половина ширины strip, работает при любом количестве отзывов (1, 2, … N).
  const getSegmentWidth = useCallback(() => {
    if (stripRef.current) return stripRef.current.offsetWidth / 2;
    if (trackRef.current) return trackRef.current.offsetWidth;
    return 0;
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const strip = stripRef.current;
    if (!track || !strip) return;

    const tick = (time: number) => {
      const dt = (time - lastTime.current) / 1000;
      lastTime.current = time;
      const seg = getSegmentWidth();
      if (seg > 0) baseSpeed.current = -seg / BASE_DURATION_SEC;

      if (!isDragging.current) {
        translateX.current += velocity.current * dt;
        if (seg > 0) {
          while (translateX.current > 0) translateX.current -= seg;
          while (translateX.current < -seg) translateX.current += seg;
        }
        velocity.current += (baseSpeed.current - velocity.current) * DECAY;
        if (strip) strip.style.setProperty('--strip-tx', `${translateX.current}px`);
      }

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame((time) => {
      lastTime.current = time;
      tick(time);
    });

    return () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, [getSegmentWidth]);

  const pushMove = useCallback((x: number) => {
    const t = Date.now();
    const arr = lastMove.current;
    arr.push({ x, t });
    while (arr.length > 0 && t - arr[0].t > VELOCITY_SAMPLE_MS) arr.shift();
  }, []);

  const getReleaseVelocity = useCallback(() => {
    const arr = lastMove.current;
    if (arr.length < 2) return 0;
    const a = arr[0];
    const b = arr[arr.length - 1];
    const dt = (b.t - a.t) / 1000;
    if (dt <= 0) return 0;
    const v = (b.x - a.x) / dt;
    return Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, v));
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!trackRef.current || !stripRef.current) return;
      isDragging.current = true;
      pointerId.current = e.pointerId;
      startX.current = e.clientX;
      startTranslateX.current = translateX.current;
      lastMove.current = [];
      pushMove(e.clientX);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [pushMove],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (pointerId.current !== e.pointerId) return;
      if (isDragging.current && trackRef.current && stripRef.current) {
        const dx = e.clientX - startX.current;
        translateX.current = startTranslateX.current + dx;
        stripRef.current.style.setProperty('--strip-tx', `${translateX.current}px`);
        pushMove(e.clientX);
      }
    },
    [pushMove],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (pointerId.current !== e.pointerId) return;
      isDragging.current = false;
      pointerId.current = null;
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      const v = getReleaseVelocity();
      velocity.current = v;
    },
    [getReleaseVelocity],
  );

  const handlePointerLeave = useCallback(
    (e: React.PointerEvent) => {
      if (pointerId.current === e.pointerId) {
        isDragging.current = false;
        pointerId.current = null;
        velocity.current = getReleaseVelocity();
      }
    },
    [getReleaseVelocity],
  );

  return (
    <section className="section py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <h2 className="text-2xl md:text-3xl min-[1200px]:text-4xl min-[1200px]:md:text-5xl font-bold text-center text-theme">
          {sectionTitle}
        </h2>
      </div>
      <div
        ref={trackRef}
        className="relative w-full overflow-hidden py-10 cursor-grab active:cursor-grabbing select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        <div
          ref={stripRef}
          className="strip-translate flex gap-6 items-stretch w-max will-change-transform"
        >
          {testimonials.map((testimonial) => (
            <TestimonialCard key={`first-${testimonial.id}`} testimonial={testimonial} />
          ))}
          {testimonials.map((testimonial) => (
            <TestimonialCard key={`second-${testimonial.id}`} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

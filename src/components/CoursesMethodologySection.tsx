"use client";


import Link from 'next/link';
import { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';

import pcAnimation from '@/../public/lottie/pc_default.json';
import bookAnimation from '@/../public/lottie/book_default.json';
import pencilAnimation from '@/../public/lottie/pencil_default.json';
import chartAnimation from '@/../public/lottie/chart_default.json';

gsap.registerPlugin(ScrollTrigger);

type LottieIconData = {
  animation: object;
  position: 'left' | 'right';
  top: string;
  progressRange: [number, number];
};

const lottieIconsData: LottieIconData[] = [
  { animation: pcAnimation, position: 'left', top: '15%', progressRange: [0, 0.78] },
  { animation: bookAnimation, position: 'right', top: '35%', progressRange: [0.02, 0.88] },
  { animation: pencilAnimation, position: 'left', top: '55%', progressRange: [0.12, 0.96] },
  { animation: chartAnimation, position: 'right', top: '75%', progressRange: [0.22, 0.98] },
];

function rectsOverlap(a: DOMRect, b: DOMRect, iconPadding = 12): boolean {
  return !(
    a.right + iconPadding < b.left ||
    a.left - iconPadding > b.right ||
    a.bottom + iconPadding < b.top ||
    a.top - iconPadding > b.bottom
  );
}

export default function CoursesMethodologySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsWrapperRef = useRef<HTMLDivElement>(null);
  const coursesCardRef = useRef<HTMLDivElement>(null);
  const methodologyCardRef = useRef<HTMLDivElement>(null);
  const freeResourcesCardRef = useRef<HTMLDivElement>(null);

  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const PIN_SCROLL_END = "+=150%";

  const lottieContainer0 = useRef<HTMLDivElement>(null);
  const lottieContainer1 = useRef<HTMLDivElement>(null);
  const lottieContainer2 = useRef<HTMLDivElement>(null);
  const lottieContainer3 = useRef<HTMLDivElement>(null);
  
  const lottiePlayer0 = useRef<LottieRefCurrentProps>(null);
  const lottiePlayer1 = useRef<LottieRefCurrentProps>(null);
  const lottiePlayer2 = useRef<LottieRefCurrentProps>(null);
  const lottiePlayer3 = useRef<LottieRefCurrentProps>(null);

  const lottieContainerRefsArray = useMemo(() => [lottieContainer0, lottieContainer1, lottieContainer2, lottieContainer3], []);
  const lottiePlayerRefsArray = useMemo(() => [lottiePlayer0, lottiePlayer1, lottiePlayer2, lottiePlayer3], []);

  const hoverDuration = 0.3;
  const hoverEase = 'power2.out';
  const cardShadowDefault = '0 8px 32px rgba(47, 52, 64, 0.1)';
  const cardShadowHover = '0 20px 40px rgba(47, 52, 64, 0.12)';

  const onCardMouseEnter = (el: HTMLDivElement | null) => {
    if (!el || !sectionRef.current?.classList.contains('section-cards-hover-ready')) return;
    gsap.to(el, { scale: 1.02, boxShadow: cardShadowHover, duration: hoverDuration, ease: hoverEase, overwrite: true });
  };
  const onCardMouseLeave = (el: HTMLDivElement | null) => {
    if (!el) return;
    gsap.to(el, { scale: 1, boxShadow: cardShadowDefault, duration: hoverDuration, ease: hoverEase, overwrite: true });
  };

  const onLinkMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, { scale: 1.08, transformOrigin: 'left center', duration: 0.25, ease: hoverEase, overwrite: true });
  };
  const onLinkMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, { scale: 1, duration: 0.25, ease: hoverEase, overwrite: true });
  };

  const cardRefsArray = useMemo(
    () => [coursesCardRef, methodologyCardRef, freeResourcesCardRef],
    []
  );

  const checkOverlap = useCallback((considerOverlap: boolean): Set<number> => {
    if (!considerOverlap) return new Set();

    const cardRects: DOMRect[] = [];
    cardRefsArray.forEach((ref) => {
      const el = ref.current;
      if (el) cardRects.push(el.getBoundingClientRect());
    });
    if (cardRects.length === 0) return new Set();

    const toHide = new Set<number>();

    lottieContainerRefsArray.forEach((ref, i) => {
      const el = ref.current;
      if (!el) return;
      const iconRect = el.getBoundingClientRect();
      if (iconRect.width <= 0 || iconRect.height <= 0) return;

      const overlapsAnyCard = cardRects.some((cardRect) => rectsOverlap(iconRect, cardRect));
      if (overlapsAnyCard) toHide.add(i);
    });

    return toHide;
  }, [cardRefsArray, lottieContainerRefsArray]);

  const cardsCompletedRef = useRef(false);

  useEffect(() => {
    const cardsWrapper = cardsWrapperRef.current;
    if (!cardsWrapper) return;

    const onResize = () => {
      ScrollTrigger.refresh();
    };

    requestAnimationFrame(onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(cardsWrapper);

    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (isDesktop === null) return;

    const section = sectionRef.current;
    const container = containerRef.current;
    const coursesCard = coursesCardRef.current;
    const methodologyCard = methodologyCardRef.current;
    const freeResourcesCard = freeResourcesCardRef.current;

    if (!section || !container || !coursesCard || !methodologyCard || !freeResourcesCard) return;

    const ctx = gsap.context(() => {
      if (!isDesktop) {
        gsap.set(coursesCard, { opacity: 0, x: -80 });
        gsap.set(methodologyCard, { opacity: 0, x: 80 });
        gsap.set(freeResourcesCard, { opacity: 0, y: 60 });
        section.classList.add('section-cards-hover-ready');
        lottieContainerRefsArray.forEach((ref) => {
          const el = ref.current;
          if (el) gsap.set(el, { opacity: 0, x: 0 });
        });

        gsap.fromTo(
          coursesCard,
          { opacity: 0, x: -80 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: { trigger: coursesCard, start: 'top 88%', end: 'top 50%', scrub: 0.8 },
          }
        );
        gsap.fromTo(
          methodologyCard,
          { opacity: 0, x: 80 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: { trigger: methodologyCard, start: 'top 88%', end: 'top 50%', scrub: 0.8 },
          }
        );
        gsap.fromTo(
          freeResourcesCard,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: { trigger: freeResourcesCard, start: 'top 88%', end: 'top 50%', scrub: 0.8 },
          }
        );
        return;
      }

      gsap.set(coursesCard, { opacity: 0, y: 80, scale: 0.92 });
      gsap.set(methodologyCard, { opacity: 0, x: 120, y: 40, scale: 0.92 });
      gsap.set(freeResourcesCard, { opacity: 0, y: 80, scale: 0.92 });

      lottieContainerRefsArray.forEach((ref, i) => {
        const el = ref.current;
        if (el) {
          const isLeft = lottieIconsData[i].position === 'left';
          gsap.set(el, { opacity: 0, x: isLeft ? -60 : 60 });
        }
      });

      let cardsCompleted = false;
      cardsCompletedRef.current = false;
      const inertiaDuration = 0.8;

      // Иконки: сглаживание progress — плавно при смене направления (вверх/вниз)
      const ICON_FADE_ZONE = 0.08;
      const ICON_PROGRESS_SMOOTH = 0.18;
      let iconProgress = 0;

      ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: PIN_SCROLL_END,
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        const rawProgress = self.progress;
        iconProgress += (rawProgress - iconProgress) * ICON_PROGRESS_SMOOTH;
        cardsCompletedRef.current = cardsCompleted;
        const iconsToHide = checkOverlap(cardsCompleted);

        // Cards — rawProgress
        if (!cardsCompleted) {
          const coursesProgress = Math.min(1, rawProgress / 0.4);
          gsap.to(coursesCard, {
            opacity: coursesProgress,
            y: 80 * (1 - coursesProgress),
            scale: 0.92 + 0.08 * coursesProgress,
            duration: inertiaDuration,
            ease: "power2.out",
            overwrite: true
          });
          
          const methodologyProgress = Math.max(0, Math.min(1, (rawProgress - 0.35) / 0.65));
          gsap.to(methodologyCard, {
            opacity: methodologyProgress,
            x: 120 * (1 - methodologyProgress),
            y: 40 * (1 - methodologyProgress),
            scale: 0.92 + 0.08 * methodologyProgress,
            duration: inertiaDuration,
            ease: "power2.out",
            overwrite: true
          });

          const freeResourcesProgress = Math.max(0, Math.min(1, (rawProgress - 0.65) / 0.35));
          gsap.to(freeResourcesCard, {
            opacity: freeResourcesProgress,
            y: 80 * (1 - freeResourcesProgress),
            scale: 0.92 + 0.08 * freeResourcesProgress,
            duration: inertiaDuration,
            ease: "power2.out",
            overwrite: true
          });

          if (rawProgress >= 0.99) {
            cardsCompleted = true;
            gsap.to(coursesCard, { opacity: 1, y: 0, scale: 1, duration: inertiaDuration, ease: "power2.out", overwrite: true });
            gsap.to(methodologyCard, {
              opacity: 1, x: 0, y: 0, scale: 1,
              duration: inertiaDuration,
              ease: "power2.out",
              overwrite: true
            });
            gsap.to(freeResourcesCard, {
              opacity: 1, y: 0, scale: 1,
              duration: inertiaDuration,
              ease: "power2.out",
              overwrite: true,
              onComplete: () => section.classList.add('section-cards-hover-ready')
            });
          }
        }

        // Lottie icons: iconProgress (сглажен) — плавно в обе стороны при любом направлении
        const progress = iconProgress;
        lottieContainerRefsArray.forEach((ref, i) => {
          const el = ref.current;
          if (!el) return;

          const [start, end] = lottieIconsData[i].progressRange;
          const isLeft = lottieIconsData[i].position === 'left';
          const startX = isLeft ? -60 : 60;
          const fadeZone = ICON_FADE_ZONE;

          // На границах: rawProgress гарантирует полное скрытие (iconProgress сглажен и может запаздывать)
          const forceHide = rawProgress < start || rawProgress > end;

          let opacity: number;
          let x: number;

          if (forceHide || progress < start || progress > end) {
            opacity = 0;
            x = startX;
          } else if (progress < start + fadeZone) {
            const t = (progress - start) / fadeZone;
            opacity = t;
            x = startX * (1 - t);
          } else if (progress <= end - fadeZone) {
            opacity = 1;
            x = 0;
          } else {
            const t = (end - progress) / fadeZone;
            opacity = t;
            x = startX * (1 - t);
          }

          // Overlap: скрывать только когда иконка полностью видна — не обрывать fade in/out
          const isFullyVisible = progress >= start + fadeZone && progress <= end - fadeZone;
          const isHidden = iconsToHide.has(i) && isFullyVisible;
          gsap.set(el, {
            opacity: isHidden ? 0 : opacity,
            visibility: isHidden ? "hidden" : "visible",
            x,
          });

          const localProgress = Math.max(0, Math.min(1, (progress - start) / (end - start)));
          const player = lottiePlayerRefsArray[i].current;
          if (player && opacity > 0 && !isHidden) {
            const totalFrames = player.getDuration(true);
            if (totalFrames && totalFrames > 0) {
              player.goToAndStop(Math.floor(localProgress * totalFrames), true);
            }
          }
        });
      }
    });
    }, section);

    return () => {
      const triggers = ScrollTrigger.getAll().filter((st) => st.trigger === section);
      triggers.forEach((st) => st.kill(true));
      requestAnimationFrame(() => ctx.revert());
    };
  }, [lottieContainerRefsArray, lottiePlayerRefsArray, checkOverlap, isDesktop]);

  const loremText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";

  return (
    <div id="courses-methodology" ref={sectionRef} className="relative scroll-mt-20">
      {lottieIconsData.map((icon, index) => (
        <div
          key={index}
          ref={lottieContainerRefsArray[index]}
          className={`absolute pointer-events-none
            hidden min-[1280px]:block
            w-20 h-20 xl:w-24 xl:h-24
            ${icon.position === 'left' 
              ? 'left-4 xl:left-[max(1rem,calc((100vw-80rem)/4))]' 
              : 'right-4 xl:right-[max(1rem,calc((100vw-80rem)/4))]'
            } z-10
          `}
          style={{ top: icon.top }}
        >
          <Lottie
            lottieRef={lottiePlayerRefsArray[index]}
            animationData={icon.animation}
            loop={false}
            autoplay={false}
            className="w-full h-full"
          />
        </div>
      ))}

      <div ref={containerRef} className="section w-full py-16 md:py-24 lg:pt-28 lg:pb-12">
        <div ref={cardsWrapperRef} className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div
              ref={coursesCardRef}
              className="card"
              onMouseEnter={() => onCardMouseEnter(coursesCardRef.current)}
              onMouseLeave={() => onCardMouseLeave(coursesCardRef.current)}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-theme">
                Language Courses
              </h2>
              <Link 
                href="/courses" 
                className="inline-block mb-6 text-lg font-semibold transition-colors duration-300 hover:opacity-80 text-theme-accent"
                onMouseEnter={onLinkMouseEnter}
                onMouseLeave={onLinkMouseLeave}
              >
                Подробнее →
              </Link>
              <p className="text-base md:text-lg leading-relaxed text-justify text-theme">
                {loremText}
              </p>
            </div>

            <div
              ref={methodologyCardRef}
              className="card"
              onMouseEnter={() => onCardMouseEnter(methodologyCardRef.current)}
              onMouseLeave={() => onCardMouseLeave(methodologyCardRef.current)}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-theme">
                Methodology
              </h2>
              <Link 
                href="/methodology" 
                className="inline-block mb-6 text-lg font-semibold transition-colors duration-300 hover:opacity-80 text-theme-accent"
                onMouseEnter={onLinkMouseEnter}
                onMouseLeave={onLinkMouseLeave}
              >
                Подробнее →
              </Link>
              <p className="text-base md:text-lg leading-relaxed text-justify text-theme">
                {loremText}
              </p>
            </div>

            <div
              ref={freeResourcesCardRef}
              className="card lg:col-span-2"
              onMouseEnter={() => onCardMouseEnter(freeResourcesCardRef.current)}
              onMouseLeave={() => onCardMouseLeave(freeResourcesCardRef.current)}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-theme">
                Free resources
              </h2>
              <Link 
                href="/free-resources" 
                className="inline-block mb-6 text-lg font-semibold transition-colors duration-300 hover:opacity-80 text-theme-accent"
                onMouseEnter={onLinkMouseEnter}
                onMouseLeave={onLinkMouseLeave}
              >
                Подробнее →
              </Link>
              <p className="text-base md:text-lg leading-relaxed text-justify text-theme">
                {loremText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

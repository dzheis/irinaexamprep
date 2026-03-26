"use client";

import Link from 'next/link';
import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { CoursesSectionBlockContent } from '@/lib/storyblok-types';

gsap.registerPlugin(ScrollTrigger);

const PIN_SCROLL_END = '+=150%';
const HOVER_DURATION = 0.3;
const HOVER_EASE = 'power2.out';
const CARD_SHADOW_DEFAULT = '0 8px 32px rgba(47, 52, 64, 0.1)';
const CARD_SHADOW_HOVER = '0 20px 40px rgba(47, 52, 64, 0.12)';

const DEFAULT_LANGUAGE_COURSES_DESCRIPTION =
  'Курсы, которые помогут вам перейти с уровня B2 на C1 или с C1 на C2 в процессе подготовки к экзаменам Cambridge.\nВы развиваете все ключевые навыки, осваиваете стратегии выполнения заданий и выходите на уровень, необходимый для успешной сдачи экзамена.';

const DEFAULT_METHODOLOGY_DESCRIPTION =
  'Практические вебинары для преподавателей английского, направленные на повышение эффективности занятий. Вы научитесь выстраивать уроки, развивать speaking, грамотно использовать ресурсы и применять принципы усвоения языка на практике.';

const DEFAULT_FREE_RESOURCES_DESCRIPTION =
  'Подборка бесплатных материалов для студентов и преподавателей уровней B2–C2. Практика speaking, работа со сложной грамматикой и развитие более точного, естественного и продвинутого английского.';

const DEFAULT_CARDS = [
  { title: 'Language Courses', link: '/courses', description: DEFAULT_LANGUAGE_COURSES_DESCRIPTION },
  { title: 'Methodology', link: '/methodology', description: DEFAULT_METHODOLOGY_DESCRIPTION },
  { title: 'Free resources', link: '/free-resources', description: DEFAULT_FREE_RESOURCES_DESCRIPTION, wide: true },
];

type CoursesMethodologySectionProps = { data?: CoursesSectionBlockContent | null };

/** Storyblok link field can be either a string or an object: `{ url?, cached_url? }`. */
function linkToHref(link: unknown): string {
  if (typeof link === 'string') return link.trim();
  if (link && typeof link === 'object' && 'url' in link && typeof (link as { url?: string }).url === 'string') return (link as { url: string }).url;
  if (link && typeof link === 'object' && 'cached_url' in link && typeof (link as { cached_url?: string }).cached_url === 'string') return (link as { cached_url: string }).cached_url;
  return '';
}

export default function CoursesMethodologySection({ data }: CoursesMethodologySectionProps) {
  const cards = useMemo(() => {
    const items = data?.cards?.filter((c) => c.title?.trim());
    if (!items || items.length === 0) return DEFAULT_CARDS;

    // Storyblok has priority: use its cards when present, but fill missing ones from defaults.
    return DEFAULT_CARDS.map((baseCard, idx) => {
      const item = items[idx];
      if (!item) return baseCard;

      const description =
        (typeof item.description === "string" ? item.description : "").trim() || baseCard.description;

      return {
        ...baseCard,
        title: item.title!.trim(),
        link: linkToHref(item.link) || baseCard.link,
        description,
      };
    });
  }, [data?.cards]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsWrapperRef = useRef<HTMLDivElement>(null);
  const coursesCardRef = useRef<HTMLDivElement>(null);
  const methodologyCardRef = useRef<HTMLDivElement>(null);
  const freeResourcesCardRef = useRef<HTMLDivElement>(null);

  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  const onCardMouseEnter = useCallback((el: HTMLDivElement | null) => {
    if (!el || !sectionRef.current?.classList.contains('section-cards-hover-ready')) return;
    gsap.to(el, {
      scale: 1.02,
      boxShadow: CARD_SHADOW_HOVER,
      duration: HOVER_DURATION,
      ease: HOVER_EASE,
      overwrite: true,
    });
  }, []);

  const onCardMouseLeave = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    gsap.to(el, {
      scale: 1,
      boxShadow: CARD_SHADOW_DEFAULT,
      duration: HOVER_DURATION,
      ease: HOVER_EASE,
      overwrite: true,
    });
  }, []);

  const onLinkMouseEnter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.08,
      transformOrigin: 'left center',
      duration: 0.25,
      ease: HOVER_EASE,
      overwrite: true,
    });
  }, []);

  const onLinkMouseLeave = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, { scale: 1, duration: 0.25, ease: HOVER_EASE, overwrite: true });
  }, []);

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
    const mq = window.matchMedia('(min-width: 1280px)');
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

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: PIN_SCROLL_END,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;
          const coursesProgress = Math.min(1, p / 0.4);
          const methodologyProgress = Math.max(0, Math.min(1, (p - 0.35) / 0.65));
          const freeResourcesProgress = Math.max(0, Math.min(1, (p - 0.65) / 0.35));

          gsap.set(coursesCard, {
            opacity: coursesProgress,
            y: 80 * (1 - coursesProgress),
            scale: 0.92 + 0.08 * coursesProgress,
          });
          gsap.set(methodologyCard, {
            opacity: methodologyProgress,
            x: 120 * (1 - methodologyProgress),
            y: 40 * (1 - methodologyProgress),
            scale: 0.92 + 0.08 * methodologyProgress,
          });
          gsap.set(freeResourcesCard, {
            opacity: freeResourcesProgress,
            y: 80 * (1 - freeResourcesProgress),
            scale: 0.92 + 0.08 * freeResourcesProgress,
          });

          if (p >= 0.95) {
            section.classList.add('section-cards-hover-ready');
          } else {
            section.classList.remove('section-cards-hover-ready');
          }
        }
      });
    }, section);

    return () => {
      const triggers = ScrollTrigger.getAll().filter((st) => st.trigger === section);
      triggers.forEach((st) => st.kill(true));
      requestAnimationFrame(() => ctx.revert());
    };
  }, [isDesktop]);

  return (
    <div id="courses-methodology" ref={sectionRef} className="relative scroll-mt-20 pt-8 lg:pt-12">
      <div ref={containerRef} className="section w-full py-16 md:py-24">
        <div ref={cardsWrapperRef} className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div
              ref={coursesCardRef}
              className="card"
              onMouseEnter={() => onCardMouseEnter(coursesCardRef.current)}
              onMouseLeave={() => onCardMouseLeave(coursesCardRef.current)}
            >
              <h2 className="text-2xl md:text-3xl min-[1200px]:text-4xl min-[1200px]:md:text-5xl font-bold mb-6 text-theme">
                {cards[0].title}
              </h2>
              <Link
                href={cards[0].link}
                className="inline-block mb-6 text-base min-[1200px]:text-xl font-semibold transition-colors duration-300 hover:opacity-80 text-theme-accent"
                onMouseEnter={onLinkMouseEnter}
                onMouseLeave={onLinkMouseLeave}
              >
                Подробнее →
              </Link>
              <p className="text-sm md:text-base min-[1200px]:text-lg min-[1200px]:md:text-xl leading-relaxed text-justify text-theme">
                {cards[0].description}
              </p>
            </div>

            <div
              ref={methodologyCardRef}
              className="card"
              onMouseEnter={() => onCardMouseEnter(methodologyCardRef.current)}
              onMouseLeave={() => onCardMouseLeave(methodologyCardRef.current)}
            >
              <h2 className="text-2xl md:text-3xl min-[1200px]:text-4xl min-[1200px]:md:text-5xl font-bold mb-6 text-theme">
                {cards[1].title}
              </h2>
              <Link
                href={cards[1].link}
                className="inline-block mb-6 text-base min-[1200px]:text-xl font-semibold transition-colors duration-300 hover:opacity-80 text-theme-accent"
                onMouseEnter={onLinkMouseEnter}
                onMouseLeave={onLinkMouseLeave}
              >
                Подробнее →
              </Link>
              <p className="text-sm md:text-base min-[1200px]:text-lg min-[1200px]:md:text-xl leading-relaxed text-justify text-theme">
                {cards[1].description}
              </p>
            </div>

            <div
              ref={freeResourcesCardRef}
              className="card lg:col-span-2"
              onMouseEnter={() => onCardMouseEnter(freeResourcesCardRef.current)}
              onMouseLeave={() => onCardMouseLeave(freeResourcesCardRef.current)}
            >
              <h2 className="text-2xl md:text-3xl min-[1200px]:text-4xl min-[1200px]:md:text-5xl font-bold mb-6 text-theme">
                {cards[2].title}
              </h2>
              <Link
                href={cards[2].link}
                className="inline-block mb-6 text-base min-[1200px]:text-xl font-semibold transition-colors duration-300 hover:opacity-80 text-theme-accent"
                onMouseEnter={onLinkMouseEnter}
                onMouseLeave={onLinkMouseLeave}
              >
                Подробнее →
              </Link>
              <p className="text-sm md:text-base min-[1200px]:text-lg min-[1200px]:md:text-xl leading-relaxed text-justify text-theme">
                {cards[2].description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

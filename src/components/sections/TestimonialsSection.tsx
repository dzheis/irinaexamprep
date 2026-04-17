"use client";

import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import gsap from "gsap";
import { useScrollLock } from "@/components/ui/SmoothScroll";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import type { TestimonialsBlockContent } from "@/lib/storyblok-types";

const BASE_SPEED_PX_SEC = -90;
const DECAY = 0.035;
const VELOCITY_SAMPLE_MS = 80;
const MAX_VELOCITY = 2500;
const COLLAPSED_CARD_HEIGHT = 520;
const COLLAPSED_BLUR_ZONE_HEIGHT = 96;
const COLLAPSED_ARROW_BLOCK_HEIGHT = 52;

type Testimonial = {
  id: number;
  name: string;
  role: string;
  text?: string;
  avatar: string;
  certificateImage?: string;
};

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Hanna Shvarts",
    role: "",
    text: "Спасибо большое, за занятия, я шла к тебе вообще без каких-то конкретных знаний об экзамене, просто расслабилась и отдалась процессу. Уроки классные, для меня были расслабляющими. Очень здорово было быть снова ученицей, а не преподавателем 😄 Не знаю, могу ли я после такого результата готовиться к CPE, мне кажется, что CAE нужно сначала на A сдать. Но может я сильно строга к себе.",
    avatar: "/icons/placeholder-avatar.svg",
    certificateImage: "/testimonials/certificates/hanna-shvarts.jpeg",
  },
  {
    id: 2,
    name: "Anastasiia Khomenko",
    role: "",
    text: "Thank you! It was long, it was exhausting, and I was very glad when it was over, but in the end it was a fun experience 😁",
    avatar: "/icons/placeholder-avatar.svg",
    certificateImage: "/testimonials/certificates/anastasiia-khomenko.jpeg",
  },
  {
    id: 3,
    name: "Angelina Brendina",
    role: "",
    text: "Спасибо Вам огромное! Без Вас ничего бы не получилось ❤️❤️❤️",
    avatar: "/icons/placeholder-avatar.svg",
    certificateImage: "/testimonials/certificates/angelina-brendina.jpeg",
  },
  {
    id: 4,
    name: "Natalya Styopkina",
    role: "",
    text: "Первой очень важной изюминкой для меня стала структура. Благодаря нашему syllabus ты всегда четко знаешь что ты должен делать и когда. Отдельная благодарность за столько дополнительных материалов! Они позволяют не сидеть без дела и от самого начала до конца курса всегда есть над чем поработать. Во-вторых, это организация работы в группе. Так виртуозно управлять студентами в групповых занятиях, чтобы была польза, нужно уметь 😅 Групповая работа также позволила мне подчеркнуть что-то и от моих одногруппниц. Считаю, что у нас был прекрасный симбиоз! Моими слабыми сторонами были Speaking и Writing. В течении года было очень много практики за счет чего я стала намного увереннее в части экзаменационного говорения, стала разбираться в стратегиях, которые можно применять. Кстати, при сдаче экзамена было заметно, что моему партнеру не хватало понимания структуры разговорной части и что готовился он скорее всего по видео в интернете, именно поэтому я считаю важным найти для себя профессионала, который разложит все по полочкам. Writing это всё ещё мой нелюбимый ребенок, поэтому с ним ещё будем разбираться при подготовке к CPE. Также, что немало важно, вы даете подробную обратную связь (на 3-4 листа!), которая подсвечивает недочеты, и всегда готовы ответить на любые вопросы и вне урока, что очень ценно для тревожников как я, у которых всегда много вопросов. All in all, я очень рада, что год назад мне попалась ваша реклама, так как курс действительно приносит классные результаты. Ирина, мне было невероятно приятно работать с таким профессионалом как вы! Огромное спасибо за вашу работу и поддержку! Свое pre-CPE journey в будущем я тоже доверю вам 💙",
    avatar: "/icons/placeholder-avatar.svg",
    certificateImage: "/testimonials/certificates/natalya-styopkina.jpeg",
  },
  {
    id: 5,
    name: "Polina Pogrebitskaia",
    role: "",
    text: "Прекрасные новости. Спасибо большое, Ирина!!!",
    avatar: "/icons/placeholder-avatar.svg",
    certificateImage: "/testimonials/certificates/polina-pogrebitskaia.jpeg",
  },
  {
    id: 6,
    name: "Anastasiya Marmuzevich",
    role: "",
    text: "All in all, the parts I was confident about/frightened of during the lessons appeared to be vice versa during the exam 🙃 I don't know how it works. Also, I think the exam conditions were a bit lighter then how I felt during practice, maybe because it was not online, or maybe I got used to the timing (your proposed timing was more than enough, I had lots of time to recheck. It's like you trained us as navy seals but the tasks were mostly for girl scouts 😅❤️) (just because I'm a girl, no misogyny)) Anyway, maybe it felt simpler because I managed only for C1 haha, but we'll know only in two weeks 😊 And I am SURE without this course and your materials and hints, I would not be able to make it, and I believe I would spend threefold time to simply understand some tasks. Thank you again,",
    avatar: "/icons/placeholder-avatar.svg",
    certificateImage: "/testimonials/certificates/anastasiya-marmuzevich.jpeg",
  },
  {
    id: 7,
    name: "Diana Topol",
    role: "",
    text: "После окончания университета у меня появилось много свободного времени, и мне захотелось провести его с пользой. Кроме того, на момент начала занятий я была после сдачи экзамена по шведскому, и мне казалось, что за время подготовки мой английский отошел на второй план - захотелось его вернуть в форму. Наверное, письменная часть была самой сложной - просто потому, что я не люблю писать, особенно под давлением времени. Еще была фрустрация на фоне понимания, что в тесте могут попасться случайные редкие слова, выражения или грамматические конструкции, которых я не знаю. Сюда в принципе относится и общая рандомность заданий, текстов и их сложности: как бы много ни учил, все равно значимый процент результата зависит и от элемента удачи, как это всегда бывает с экзаменами. Сам процесс мне очень нравился: я просто люблю языки и действительно люблю погружаться в их структуру. А если по мелочам, то отдельным наслаждением для меня всегда было и будет постоянное столкновение с феноменом Баадер-Майнхофа. Да, прогресс определенно есть - особенно в словарном запасе: чувствуется, что он расширился на пару тысяч слов. И в грамматике появилось больше четкости: какие-то конструкции, которые раньше казались неустойчивыми, стали встраиваться в речь без лишних размышлений. Я бы рекомендовала курс тем, кто хочет быстро улучшить свой английский и получить бонусом бумажку от признанной организации, тем самым чествуя свое самолюбие :)",
    avatar: "/icons/placeholder-avatar.svg",
    certificateImage: "/testimonials/certificates/diana-topol.jpeg",
  },
  {
    id: 8,
    name: "Alexandra Kolesnikova",
    role: "",
    text: "Dear Teacher, I've finally gathered myself after that whirlwind of emotions and am now able to write this letter. There are no words to fully express my immense gratitude for all the work and energy you've put into our lessons during our time together. First, I must thank you for creating such a safe environment. Not only did I learn that the world doesn't stop after making mistakes, but you also made it an encouraging and fun experience. The psychological aspect was the reason I kept postponing the exam, and you've truly been a guide through my fears and uncertainties. Okay, now let's get to the less emotional side of things. 😂 From our very first call, I knew the program would be clear and well-structured, especially after reviewing the syllabus you sent me. It immediately put my mind at ease, and I had no doubts about wanting to continue this journey with you. The main reason I came to you was to improve my writing, which I had always struggled with due to a lack of knowledge on how to brainstorm, structure, and organize my texts according to exam requirements. Your explanations were so crystal-clear and organized that I felt an enormous sense of relief and finally understood how to approach it. Another aspect I greatly appreciate is your flexibility in adapting the program to meet my specific needs. I always felt heard and seen, and that made the learning process so much smoother and easier. I truly hope I'll have the chance to continue learning from you. I feel incredibly lucky to have found you in the vast sea of social media. Thank you so much!",
    avatar: "/icons/placeholder-avatar.svg",
    certificateImage: "/testimonials/certificates/alexandra-kolesnikova.jpeg",
  },
  {
    id: 9,
    name: "Maryna Manuilenka",
    role: "",
    text: "My five months on your CAE course have given a huge boost to both my English level and my confidence in speaking. It was an incredibly rewarding experience where the benefits far outweighed the costs. Tons of passive vocabulary and grammar chunks came to life thanks to your carefully structured approach. What I really liked about the course: - Well-thought-out structure and course flow-probably the best I've ever seen as a student! - Effective vocabulary and grammar reinforcement-plenty of opportunities to encounter new chunks or revisit forgotten ones in different contexts. - A great variety of tasks, materials, and sources in lessons, plus even more for independent practice-ensuring maximum language exposure. - Useful self-assessment methods and progress-tracking tools. - Extensive mid-course personalized feedback on every language skill, along with practical advice on how to improve each one. - A relaxed and friendly atmosphere in lessons.",
    avatar: "/icons/placeholder-avatar.svg",
    certificateImage: "/testimonials/certificates/maryna-manuilenka.jpeg",
  },
  {
    id: 10,
    name: "Alesia Sauko",
    role: "",
    avatar: "/icons/placeholder-avatar.svg",
    certificateImage: "/testimonials/certificates/alesia-sauko.jpeg",
  },
  {
    id: 11,
    name: "Alina Shtanko",
    role: "",
    avatar: "/icons/placeholder-avatar.svg",
    certificateImage: "/testimonials/certificates/alina-shtanko.jpeg",
  },
  {
    id: 12,
    name: "Antanina Pustavalava",
    role: "",
    avatar: "/icons/placeholder-avatar.svg",
    certificateImage: "/testimonials/certificates/antanina-pustavalava.jpeg",
  },
  {
    id: 13,
    name: "Ekaterina Shaposhnik",
    role: "",
    avatar: "/icons/placeholder-avatar.svg",
    certificateImage: "/testimonials/certificates/ekaterina-shaposhnik.jpeg",
  },
  {
    id: 14,
    name: "Helena Kivistik",
    role: "",
    avatar: "/icons/placeholder-avatar.svg",
    certificateImage: "/testimonials/certificates/helena-kivistik.jpeg",
  },
  {
    id: 15,
    name: "Kseniya Daronina",
    role: "",
    avatar: "/icons/placeholder-avatar.svg",
    certificateImage: "/testimonials/certificates/kseniya-daronina.jpeg",
  },
  {
    id: 16,
    name: "Yuliya Zhylka",
    role: "",
    avatar: "/icons/placeholder-avatar.svg",
    certificateImage: "/testimonials/certificates/yuliya-zhylka.jpeg",
  },
];

type TestimonialCardProps = {
  testimonial: Testimonial;
  instanceId: string;
  onCertificateModalStateChange: (instanceId: string, isOpen: boolean) => void;
  onExpandedStateChange: (instanceId: string, isExpanded: boolean) => void;
};

function TestimonialCard({
  testimonial,
  instanceId,
  onCertificateModalStateChange,
  onExpandedStateChange,
}: TestimonialCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
  const [certScale, setCertScale] = useState(1);
  const [certOffset, setCertOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panPointerId = useRef<number | null>(null);
  const panStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const pinchStart = useRef<{ distance: number; scale: number } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasExpandableText, setHasExpandableText] = useState(false);
  const scrollLock = useScrollLock();
  const hasText = Boolean(testimonial.text?.trim());

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

  useEffect(() => {
    onCertificateModalStateChange(instanceId, certModalOpen);
  }, [certModalOpen, instanceId, onCertificateModalStateChange]);

  useEffect(() => {
    onExpandedStateChange(instanceId, isExpanded);
  }, [instanceId, isExpanded, onExpandedStateChange]);

  const openCertificateModal = useCallback(() => {
    setCertScale(1);
    setCertOffset({ x: 0, y: 0 });
    setIsPanning(false);
    panPointerId.current = null;
    setCertModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (modalClosing) return;
    setIsPanning(false);
    panPointerId.current = null;
    setModalClosing(true);
  }, [modalClosing]);

  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent) => {
      if (e.propertyName === "opacity" && modalClosing) {
        setCertModalOpen(false);
        setModalClosing(false);
        setModalVisible(false);
        setCertScale(1);
        setCertOffset({ x: 0, y: 0 });
        setIsPanning(false);
        panPointerId.current = null;
      }
    },
    [modalClosing],
  );

  const updateScale = useCallback((next: number) => {
    const clamped = Math.max(1, Math.min(3, next));
    setCertScale(clamped);
    if (clamped === 1) setCertOffset({ x: 0, y: 0 });
  }, []);

  const handleCertWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -0.16 : 0.16;
      updateScale(certScale + delta);
    },
    [certScale, updateScale],
  );

  const handleCertPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      panPointerId.current = e.pointerId;
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, ox: certOffset.x, oy: certOffset.y };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [certOffset.x, certOffset.y],
  );

  const handleCertPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isPanning || panPointerId.current !== e.pointerId) return;
      e.stopPropagation();
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setCertOffset({ x: panStart.current.ox + dx, y: panStart.current.oy + dy });
    },
    [isPanning],
  );

  const handleCertPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (panPointerId.current !== e.pointerId) return;
    setIsPanning(false);
    panPointerId.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  const handleCertTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (e.touches.length === 2) {
        const a = e.touches[0];
        const b = e.touches[1];
        if (!a || !b) return;
        const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        pinchStart.current = { distance, scale: certScale };
        setIsPanning(false);
        return;
      }
      if (e.touches.length === 1 && certScale > 1) {
        const t = e.touches[0];
        if (!t) return;
        setIsPanning(true);
        panStart.current = { x: t.clientX, y: t.clientY, ox: certOffset.x, oy: certOffset.y };
      }
    },
    [certScale, certOffset.x, certOffset.y],
  );

  const handleCertTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.touches.length === 2 && pinchStart.current) {
        const a = e.touches[0];
        const b = e.touches[1];
        if (!a || !b) return;
        const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const ratio = distance / Math.max(1, pinchStart.current.distance);
        updateScale(pinchStart.current.scale * ratio);
        return;
      }
      if (e.touches.length === 1 && isPanning && certScale > 1) {
        const t = e.touches[0];
        if (!t) return;
        const dx = t.clientX - panStart.current.x;
        const dy = t.clientY - panStart.current.y;
        setCertOffset({ x: panStart.current.ox + dx, y: panStart.current.oy + dy });
      }
    },
    [certScale, isPanning, updateScale],
  );

  const handleCertTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (e.touches.length < 2) {
        pinchStart.current = null;
      }
      if (e.touches.length === 1 && certScale > 1) {
        const t = e.touches[0];
        if (!t) return;
        setIsPanning(true);
        panStart.current = { x: t.clientX, y: t.clientY, ox: certOffset.x, oy: certOffset.y };
        return;
      }
      if (e.touches.length === 0) {
        setIsPanning(false);
      }
    },
    [certScale, certOffset.x, certOffset.y],
  );

  useEffect(() => {
    if (!hasText || !innerRef.current) return;
    const innerEl = innerRef.current;
    const measureOverflow = () => {
      setHasExpandableText(innerEl.scrollHeight > COLLAPSED_CARD_HEIGHT + 2);
    };
    measureOverflow();
    window.addEventListener("resize", measureOverflow);
    return () => {
      window.removeEventListener("resize", measureOverflow);
    };
  }, [hasText, testimonial.text]);

  useEffect(() => {
    const cardEl = cardRef.current;
    const innerEl = innerRef.current;
    if (!cardEl || !innerEl) return;

    if (!(hasText && hasExpandableText)) {
      gsap.killTweensOf(cardEl);
      cardEl.style.maxHeight = `${COLLAPSED_CARD_HEIGHT}px`;
      return;
    }

    const expandedHeight = Math.max(COLLAPSED_CARD_HEIGHT, innerEl.scrollHeight);
    gsap.killTweensOf(cardEl);
    gsap.to(cardEl, {
      maxHeight: isExpanded ? expandedHeight : COLLAPSED_CARD_HEIGHT,
      duration: 0.62,
      ease: "power3.inOut",
    });
  }, [hasText, hasExpandableText, isExpanded]);

  useEffect(() => {
    if (!isExpanded || !cardRef.current) return;
    const cardEl = cardRef.current;
    const trackEl = cardEl.closest("[data-testimonials-track='true']") as HTMLDivElement | null;
    if (!trackEl) return;

    let rafId = 0;
    const checkVisibility = () => {
      const cardRect = cardEl.getBoundingClientRect();
      const trackRect = trackEl.getBoundingClientRect();
      const visibleWidth = Math.max(
        0,
        Math.min(cardRect.right, trackRect.right) - Math.max(cardRect.left, trackRect.left),
      );
      const visibleWidthRatio = cardRect.width > 0 ? visibleWidth / cardRect.width : 0;
      if (visibleWidthRatio < 0.5) {
        setIsExpanded(false);
        return;
      }
      rafId = requestAnimationFrame(checkVisibility);
    };

    rafId = requestAnimationFrame(checkVisibility);
    return () => cancelAnimationFrame(rafId);
  }, [isExpanded]);

  return (
    <>
      <div
        ref={cardRef}
        className="glass relative overflow-hidden rounded-2xl flex-shrink-0 flex flex-col min-h-0 hover:shadow-xl testimonial-card"
        style={
          hasText && hasExpandableText
            ? {
                minHeight: `${COLLAPSED_CARD_HEIGHT}px`,
                maxHeight: `${COLLAPSED_CARD_HEIGHT}px`,
              }
            : {
                height: `${COLLAPSED_CARD_HEIGHT}px`,
                minHeight: `${COLLAPSED_CARD_HEIGHT}px`,
                maxHeight: `${COLLAPSED_CARD_HEIGHT}px`,
              }
        }
      >
        <div ref={innerRef} className="relative flex h-full min-h-0 flex-col p-6">
          <div className="flex items-start gap-4 mb-4 flex-shrink-0">
            <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-theme-secondary-accent select-none aspect-square">
              <Image
                src={testimonial.avatar || "/icons/placeholder-avatar.svg"}
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
              {testimonial.role && (
                <p className="text-xs min-[1200px]:text-base text-theme-accent truncate">
                  {testimonial.role}
                </p>
              )}
            </div>
          </div>
          <div className="relative flex-1 min-h-0 min-w-0">
            <div
              className={`min-h-0 transition-opacity duration-500 ${
                isExpanded ? "opacity-100" : "opacity-[0.99]"
              }`}
              style={
                hasText && hasExpandableText && !isExpanded
                  ? { paddingBottom: `${COLLAPSED_ARROW_BLOCK_HEIGHT}px` }
                  : undefined
              }
            >
              {testimonial.certificateImage && (
                <div
                  className={
                    hasText
                      ? "relative z-[5] w-[40%] max-w-[40%] min-w-20 aspect-[3/4] float-right ml-4 mb-2 rounded-lg overflow-hidden flex-shrink-0 cursor-zoom-in select-none transition-[filter,box-shadow] duration-200 hover:brightness-105 hover:shadow-lg active:brightness-100"
                      : "relative z-[5] mx-auto my-2 w-[62%] max-w-[280px] min-w-24 aspect-[3/4] rounded-lg overflow-hidden cursor-zoom-in select-none transition-[filter,box-shadow] duration-200 hover:brightness-105 hover:shadow-lg active:brightness-100"
                  }
                  role="button"
                  tabIndex={0}
                  onClick={openCertificateModal}
                  onKeyDown={(e) => e.key === "Enter" && openCertificateModal()}
                  aria-label="Открыть сертификат в полном размере"
                >
                  <Image
                    src={testimonial.certificateImage}
                    alt={`Сертификат ${testimonial.name}`}
                    fill
                    className="object-contain object-center pointer-events-none"
                    draggable={false}
                    sizes={hasText ? "152px" : "280px"}
                  />
                </div>
              )}
              {hasText && (
                <div className="relative">
                  <p className="text-sm min-[1200px]:text-lg leading-relaxed text-justify text-theme break-words hyphens-auto">
                    &ldquo;{testimonial.text ?? ""}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        {hasText && hasExpandableText && !isExpanded && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] rounded-b-2xl"
            style={{
              height: `${COLLAPSED_BLUR_ZONE_HEIGHT}px`,
              background:
                "linear-gradient(180deg, rgba(245,247,251,0) 0%, rgba(245,247,251,0.08) 34%, rgba(245,247,251,0.24) 58%, rgba(245,247,251,0.5) 80%, rgba(245,247,251,0.8) 100%)",
              backdropFilter: "blur(0.9px)",
              WebkitBackdropFilter: "blur(0.9px)",
            }}
          />
        )}

        {hasText && hasExpandableText && !isExpanded && (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="absolute inset-x-0 bottom-0 z-[6] flex items-end justify-center rounded-b-2xl pb-1"
            style={{ height: `${COLLAPSED_ARROW_BLOCK_HEIGHT}px` }}
            aria-expanded={false}
            aria-label="Показать отзыв полностью"
          >
            <span className="glass inline-flex h-9 w-9 items-center justify-center rounded-full border border-theme-secondary-accent/45 text-theme shadow-[0_4px_14px_rgba(47,52,64,0.12)] transition-transform duration-300 hover:scale-105">
              <svg
                viewBox="0 0 24 24"
                className="mx-auto h-5 w-5 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </button>
        )}

        {hasText && hasExpandableText && isExpanded && (
          <div className="flex justify-center pb-2">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="glass inline-flex h-9 w-9 items-center justify-center rounded-full border border-theme-secondary-accent/45 text-theme shadow-[0_4px_14px_rgba(47,52,64,0.12)] transition-transform duration-300 hover:scale-105"
              aria-expanded
              aria-label="Свернуть отзыв"
            >
              <svg
                viewBox="0 0 24 24"
                className="mx-auto h-5 w-5 rotate-180 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {certModalOpen &&
        testimonial.certificateImage &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 transition-opacity duration-500 ease-out ${
              modalVisible && !modalClosing ? "opacity-100" : "opacity-0"
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
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCloseModal();
              }}
              className="absolute right-5 top-5 z-[10000] inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white transition-colors hover:bg-black/45"
              aria-label="Закрыть сертификат"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
            <div
              className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none p-4"
              aria-hidden
            >
              <div
                className={`relative w-full h-full max-w-[80vw] max-h-[80vh] origin-center transition-transform duration-500 ease-out ${
                  modalVisible && !modalClosing ? "scale-100" : "scale-[0.85]"
                }`}
                onClick={(e) => e.stopPropagation()}
                onWheel={handleCertWheel}
                onPointerDown={handleCertPointerDown}
                onPointerMove={handleCertPointerMove}
                onPointerUp={handleCertPointerUp}
                onPointerCancel={handleCertPointerUp}
                onTouchStart={handleCertTouchStart}
                onTouchMove={handleCertTouchMove}
                onTouchEnd={handleCertTouchEnd}
                onDoubleClick={() => updateScale(certScale > 1 ? 1 : 2)}
                style={{
                  pointerEvents: "auto",
                  cursor: isPanning ? "grabbing" : "grab",
                  touchAction: "none",
                }}
              >
                <div
                  className="relative h-full w-full"
                  style={{
                    transform: `translate(${certOffset.x}px, ${certOffset.y}px) scale(${certScale})`,
                    transformOrigin: "center center",
                    transition: isPanning ? "none" : "transform 180ms ease-out",
                  }}
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
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

type TestimonialsSectionProps = { data?: TestimonialsBlockContent | null };

function hasMeaningfulText(text: string | undefined): boolean {
  return Boolean(text?.trim());
}

function interleaveByTextPresence(items: Testimonial[]): Testimonial[] {
  const withText = items.filter((t) => hasMeaningfulText(t.text));
  const withoutText = items.filter((t) => !hasMeaningfulText(t.text));
  const result: Testimonial[] = [];
  const maxLen = Math.max(withText.length, withoutText.length);

  for (let i = 0; i < maxLen; i += 1) {
    const withTextItem = withText[i];
    const withoutTextItem = withoutText[i];
    if (withTextItem) result.push(withTextItem);
    if (withoutTextItem) result.push(withoutTextItem);
  }

  return result;
}

function testimonialsFromData(data: TestimonialsBlockContent | null | undefined): Testimonial[] {
  const items = data?.items?.filter(
    (i) => i.name?.trim() && (i.text?.trim() || i.certificate_image?.filename?.trim()),
  );
  if (!items?.length) return interleaveByTextPresence(DEFAULT_TESTIMONIALS);
  const mapped = items.map((item, i) => {
    const certificateImage = item.certificate_image?.filename?.trim()
      ? item.certificate_image.filename.trim()
      : null;
    return {
      id: i + 1,
      name: item.name!.trim(),
      role: item.role?.trim() ?? "",
      text: item.text?.trim() ?? "",
      avatar: item.avatar?.filename?.trim()
        ? item.avatar.filename.trim()
        : "/icons/placeholder-avatar.svg",
      ...(certificateImage ? { certificateImage } : {}),
    };
  });
  return interleaveByTextPresence(mapped);
}

export default function TestimonialsSection({ data }: TestimonialsSectionProps) {
  const testimonials = useMemo(() => testimonialsFromData(data), [data]);
  const sectionTitle = data?.title?.trim() || "Отзывы студентов";
  const [openCertificateCards, setOpenCertificateCards] = useState<Set<string>>(new Set());
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const isAnyCertificateModalOpen = openCertificateCards.size > 0;
  const isAnyCardExpanded = expandedCards.size > 0;

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

  const handleCertificateModalStateChange = useCallback((instanceId: string, isOpen: boolean) => {
    setOpenCertificateCards((prev) => {
      const next = new Set(prev);
      if (isOpen) {
        next.add(instanceId);
      } else {
        next.delete(instanceId);
      }
      return next;
    });
  }, []);

  const handleExpandedStateChange = useCallback((instanceId: string, isExpanded: boolean) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (isExpanded) {
        next.add(instanceId);
      } else {
        next.delete(instanceId);
      }
      return next;
    });
  }, []);

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
      baseSpeed.current = BASE_SPEED_PX_SEC;

      if (isAnyCertificateModalOpen || isAnyCardExpanded) {
        rafId.current = requestAnimationFrame(tick);
        return;
      }

      if (!isDragging.current) {
        translateX.current += velocity.current * dt;
        if (seg > 0) {
          while (translateX.current > 0) translateX.current -= seg;
          while (translateX.current < -seg) translateX.current += seg;
        }
        velocity.current += (baseSpeed.current - velocity.current) * DECAY;
        if (strip) strip.style.setProperty("--strip-tx", `${translateX.current}px`);
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
  }, [getSegmentWidth, isAnyCertificateModalOpen, isAnyCardExpanded]);

  const pushMove = useCallback((x: number) => {
    const t = Date.now();
    const arr = lastMove.current;
    arr.push({ x, t });
    while (arr.length > 0) {
      const first = arr[0];
      if (!first || t - first.t <= VELOCITY_SAMPLE_MS) break;
      arr.shift();
    }
  }, []);

  const getReleaseVelocity = useCallback(() => {
    const arr = lastMove.current;
    if (arr.length < 2) return 0;
    const a = arr[0];
    const b = arr[arr.length - 1];
    if (!a || !b) return 0;
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
        stripRef.current.style.setProperty("--strip-tx", `${translateX.current}px`);
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
        data-testimonials-track="true"
        className="relative w-full overflow-hidden py-10 cursor-grab active:cursor-grabbing select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        <div
          ref={stripRef}
          className="strip-translate flex gap-6 items-start w-max will-change-transform"
        >
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={`first-${testimonial.id}`}
              testimonial={testimonial}
              instanceId={`first-${testimonial.id}`}
              onCertificateModalStateChange={handleCertificateModalStateChange}
              onExpandedStateChange={handleExpandedStateChange}
            />
          ))}
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={`second-${testimonial.id}`}
              testimonial={testimonial}
              instanceId={`second-${testimonial.id}`}
              onCertificateModalStateChange={handleCertificateModalStateChange}
              onExpandedStateChange={handleExpandedStateChange}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

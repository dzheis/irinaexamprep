"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useApplyModal } from "@/components/ui/ApplyModalContext";

const COURSE_CARDS = [
  { id: 1, title: "FCE course B2", slug: "fce", imagePath: "/images/certificates/FCE B2.jpg" },
  { id: 2, title: "CAE course C1", slug: "cae", imagePath: "/images/certificates/СAE C1.jpg" },
  { id: 3, title: "CPE course C2", slug: "cpe", imagePath: "/images/certificates/CPE C2.jpg" },
] as const;

const COURSE_DESCRIPTIONS: Record<number, string> = {
  1: `Описание курса FCE (B2)

Добро пожаловать в мир уверенного владения английским! Курс FCE (First Certificate in English) на уровне B2 предназначен для тех, кто хочет не просто говорить по-английски, а жить им — в повседневных ситуациях, на работе или в путешествиях. Этот курс поможет преодолеть языковой барьер и достичь той свободы, когда английский становится надежным союзником.

Что ждет на курсе?

Комплексное развитие навыков: Углубление в чтение, письмо, аудирование и говорение. Участники научатся понимать нюансы текстов из реальной жизни — от новостей до художественной литературы, — писать эссе и письма с убедительной аргументацией, слушать подкасты и лекции без словаря, а также вести беседы на актуальные темы с естественной интонацией.

Практика, вдохновленная жизнью: Уроки построены вокруг реальных сценариев — от обсуждения глобальных проблем до планирования поездок. Используются аутентичные материалы: видео с носителями языка, статьи из The Guardian и BBC, чтобы создать ощущение англоязычной среды.

Подготовка к экзамену: Шаг за шагом разбор структуры FCE, отработка типичных заданий и стратегий для сдачи на высокий балл. Регулярные mock-экзамены помогут привыкнуть к формату и повысить уверенность.

Индивидуальный подход: Маленькие группы или персональные занятия — выбор за участником. Программа адаптируется под цели: карьерный рост, эмиграция или просто любовь к языку.

По окончании курса участники не только получат сертификат Cambridge, признаваемый во всем мире, но и ощутят, как английский открывает новые горизонты. Готовы шагнуть на уровень выше? Запишитесь сейчас и начните преображение!`,
  2: `Описание курса CAE (C1)

Погрузитесь в глубины английского мастерства с курсом CAE (Certificate in Advanced English) на уровне C1. Это не просто уроки — это путешествие к совершенству, где язык становится инструментом для профессионального успеха, академических достижений и культурного обогащения. Если уже есть хороший уровень английского, но стремление к нюансам и изысканности, этот курс создан именно для этого.

Ключевые аспекты курса:

Мастерство в коммуникации: Оттачивание навыков до блеска — от анализа сложных текстов и академических статей до создания убедительных эссе и отчетов. Участники научатся различать стили речи, использовать идиомы и фразовые глаголы естественно, как носители.

Аутентичный контент: Уроки вдохновлены реальным миром: дебаты на темы этики ИИ, обсуждения литературы Шекспира и современных авторов, прослушивание TED Talks и подкастов. Интеграция видео, статей из The New York Times и The Economist, чтобы почувствовать пульс глобального английского.

Стратегии для экзамена: Подробный разбор формата CAE, включая Use of English, с фокусом на ловушки и хитрости. Практика с таймингом и обратной связью поможет набрать максимум баллов.

Персонализированное обучение: Учет сильных и слабых сторон, с дополнительными материалами для самостоятельной работы. Групповые дискуссии развивают навыки командной работы, а индивидуальные сессии — фокус на личных целях.

С сертификатом CAE двери университетов, компаний и стран откроются шире. Это не просто курс — это инвестиция в будущее. Присоединяйтесь и откройте в себе настоящего мастера английского!`,
  3: `Описание курса CPE (C2)

Добро пожаловать на вершину языкового Олимпа — курс CPE (Certificate of Proficiency in English) на уровне C2. Это для тех, кто не довольствуется хорошим, а стремится к идеалу: к уровню, где английский — как родной, с тонкими нюансами, иронией и культурным подтекстом. Если готовы к вызову, этот курс превратит в настоящего эксперта.

Что делает курс особенным?

Глубокое погружение: Исследование сложных аспектов языка — от стилистического анализа литературы и научных текстов до создания профессиональных текстов: рецензий, предложений и речей. Освоение продвинутой грамматики, лексики и риторики для выражения мыслей с элегантностью и точностью.

Реальные вызовы: Уроки построены на аутентичных материалах — от классики (Диккенс, Орвелл) до современных источников (The Atlantic, научные журналы). Дебаты, ролевые игры и анализ видео помогут развить критическое мышление и fluency.

Подготовка к экзамену на высшем уровне: Детальный обзор структуры CPE, с акцентом на сложные задания. Отработка стратегий для не просто сдачи, а блеска. Регулярные симуляции экзамена с детальной обратной связью.

Индивидуальная траектория: Программа адаптируется под амбиции — академическая карьера, бизнес или творчество. Малые группы обеспечивают личное внимание.

Сертификат CPE — это знак элитного владения английским, признаваемый топ-университетами и работодателями. Это кульминация языкового пути. Готовы покорить вершину? Запишитесь и станьте частью элиты!`,
};


function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [locked]);
}

export default function CoursesClient() {
  const [detailsModalCourseId, setDetailsModalCourseId] = useState<number | null>(null);
  const applyModal = useApplyModal();

  return (
    <div className="rose-petals-bg relative">
      <div className="relative z-10">
        <div className="pt-24 md:pt-28">
          <section className="py-20 md:py-28 max-w-[1680px] mx-auto px-4 md:px-8">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl min-[1200px]:text-5xl min-[1200px]:md:text-6xl min-[1200px]:lg:text-7xl font-bold text-center mb-14 md:mb-20 text-theme">
                Курсы подготовки к экзаменам
              </h1>

              <div className="grid grid-cols-1 min-[1400px]:grid-cols-3 gap-8 md:gap-10 perspective-1000">
              {COURSE_CARDS.map((course) => (
                <div
                  key={course.id}
                  className="flex justify-center perspective-1000"
                >
                  <div className="course-card glass rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 w-full max-w-xl md:max-w-none min-w-0 transition-[transform,box-shadow] duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl">
                    {/* Левая колонка: только фото (сглаженные края, по центру) */}
                    <div className="flex flex-col items-center justify-center flex-shrink-0 md:w-[48%] min-w-0">
                      <div className="relative w-full max-h-[320px] sm:max-h-[380px] md:max-h-[360px] aspect-[3/4] rounded-3xl overflow-hidden bg-theme-secondary-accent/10 flex items-center justify-center">
                        <Image
                          src={course.imagePath}
                          alt={course.title}
                          fill
                          className="object-contain object-center"
                          sizes="(max-width: 768px) 100vw, 36vw"
                        />
                      </div>
                    </div>
                    {/* Правая колонка: название курса, под ним кнопки */}
                    <div className="flex flex-col justify-center text-center md:text-left flex-1 min-w-0">
                      <h2 className="text-xl md:text-2xl min-[1200px]:text-3xl min-[1200px]:md:text-4xl font-bold mb-5 md:mb-6 text-theme break-words">
                        {course.title}
                      </h2>
                      <div className="flex flex-col gap-4 min-w-0">
                        <button
                          type="button"
                          onClick={() => setDetailsModalCourseId(course.id)}
                          className="btn btn-secondary w-full text-center min-w-0 text-sm md:text-base min-[1200px]:text-lg min-[1200px]:md:text-xl py-3 md:py-3.5 overflow-hidden text-ellipsis whitespace-nowrap"
                        >
                          Подробнее
                        </button>
                        <button
                          type="button"
                          onClick={() => applyModal?.openApplyModal(course.id, course.title)}
                          className="btn-primary w-full text-sm md:text-base min-[1200px]:text-lg min-[1200px]:md:text-xl px-5 py-3 md:py-4 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
                        >
                          Подать заявку
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      {detailsModalCourseId !== null && (
        <DetailsModal
          courseTitle={COURSE_CARDS.find((c) => c.id === detailsModalCourseId)?.title ?? ""}
          description={COURSE_DESCRIPTIONS[detailsModalCourseId] ?? ""}
          onClose={() => setDetailsModalCourseId(null)}
        />
      )}
    </div>
  );
}

function DetailsModal({
  courseTitle,
  description,
  onClose,
}: {
  courseTitle: string;
  description: string;
  onClose: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(true);

  useEffect(() => {
    const t = requestAnimationFrame(() => setIsOpen(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const startClose = () => {
    if (isClosing) return;
    setIsClosing(true);
  };

  // Не даём колёсику/тачу прокручивать страницу: перехватываем на оверлее
  const onOverlayWheel = (e: React.WheelEvent) => {
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
  };

  useEffect(() => {
    if (!isClosing) return;
    const el = overlayRef.current;
    if (!el) {
      onClose();
      return;
    }
    const onEnd = () => onClose();
    el.addEventListener("transitionend", onEnd, { once: true });
    return () => el.removeEventListener("transitionend", onEnd);
  }, [isClosing, onClose]);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    const preventBodyScroll = (e: TouchEvent) => {
      if (e.target !== el) return;
      e.preventDefault();
    };
    el.addEventListener("touchmove", preventBodyScroll, { passive: false });
    return () => el.removeEventListener("touchmove", preventBodyScroll);
  }, []);

  const show = isOpen && !isClosing;

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300 overflow-hidden touch-none ${
        show ? "opacity-100" : "opacity-0"
      }`}
      onClick={startClose}
      onWheel={onOverlayWheel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="details-modal-title"
    >
      <div
        className={`card w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl transition-all duration-300 touch-auto ${
          show ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 flex-shrink-0 pb-4 border-b border-theme-secondary-accent/30">
          <h2 id="details-modal-title" className="text-xl font-bold text-theme">
            {courseTitle}
          </h2>
          <button
            type="button"
            onClick={startClose}
            className="text-theme-accent hover:text-theme text-2xl leading-none p-1 flex-shrink-0"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        <div
          ref={scrollRef}
          className="mt-4 overflow-y-auto overflow-x-hidden min-h-0 max-h-[calc(85vh-8rem)] pr-1 overscroll-contain touch-auto overflow-touch"
        >
          <div className="prose prose-theme max-w-none text-theme whitespace-pre-line leading-relaxed text-justify [&>*]:text-justify">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
}


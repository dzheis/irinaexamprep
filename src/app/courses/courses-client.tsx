"use client";

import { Fragment, useEffect, useRef, useState, useCallback, useMemo, type ReactNode } from "react";
import Image from "next/image";
import { useApplyModal } from "@/components/ui/ApplyModalContext";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import type { CoursesStoryContent } from "@/lib/storyblok-types";
import { useLanguage } from "@/components/ui/LanguageContext";

const DEFAULT_TITLE = "Курсы подготовки к экзаменам";

const DEFAULT_COURSE_CARDS = [
  {
    id: 1,
    title: "FCE (B2 level)",
    slug: "fce",
    imagePath: "/images/certificates/FCE B2.jpg",
    description: "",
  },
  {
    id: 2,
    title: "CAE\n(C1 Advanced)",
    slug: "cae",
    imagePath: "/images/certificates/СAE C1.jpg",
    description: "",
  },
  {
    id: 3,
    title: "CPE\n(C2 Proficiency)",
    slug: "cpe",
    imagePath: "/images/certificates/CPE C2.jpg",
    description: "",
  },
] as const;

const COURSE_DESCRIPTIONS: Record<number, string> = {
  1: `FCE

(B2 level)

🎯 Кому подойдёт этот курс?

• ✅ вы хотите уверенно сдать FCE и закрыть уровень B2
• 🧠 у вас есть база, но не хватает практики и уверенности
• 🗣️ вы все понимаете, но не уверены в speaking или writing skills
• 📚 вам нужен первый серьёзный экзамен для работы или учебы
• 🚀 вы хотите перейти от «учил язык» к «могу им пользоваться»

💡 Это не только подготовка к экзамену: мы доходим до уровня B2, которым вы можете пользоваться и на работе, и в жизни:

• 🧩 формируем стабильную базу по всем навыкам
• 🧭 учим не теряться в заданиях и понимать, что от вас хотят
• 💬 развиваем язык, а не заучиваем ответы
• 🧠 организовываем знания в голове и убираем «кашу»

🧭 Что мы делаем на занятиях?

• 🗣️ speaking: как говорить связно и без ступора
• ✍️ writing: структура, логика, базовая аргументация
• 📚 vocabulary: частотная лексика и коллокации уровня B2
• ⚙️ grammar: уверенное использование основных структур
• 🎯 понимание заданий и стратегий выполнения
• ⏱️ работа в ограниченное время

👥 Как проходит обучение?

• 👥 группы до 6 человек
• ⏳ занятия по 90-100 минут
• 🧠 разбор экзаменационных стратегий + практика
• ⏱️ задания на время
• 🤝 работа в парах и мини-группах
• 💡 регулярная обратная связь

📚 Материалы

• 🧾 Expert First + Complete First
• 📖 Vocabulary / Grammar / Collocations in Use for B2
• 🧠 Oxford Word Skills
• 📝 адаптированные и аутентичные тексты
• 🎧 видео и аудио материалы
• 🎁 дополнительные авторские материалы

🎁 Что включено?

• 📦 папка с материалами
• 🗂️ Speaking packs
• 🧩 Quizlet sets
• 📝 2 mock tests + revisions
• 📄 past papers
• ✍️ 10 письменных работ, проверенных мной + peer observation

🏁 По окончании курса

• ✅ сдадите не только экзамен, но и будете владеть языком на этом уровне в реальной жизни
• 🌟 будете полностью знать формат экзамена, его стратегии и особенности
• 🧘‍♀️ забудете, что такое нехватка идей и языковой барьер
• 💪 улучшите самодисциплину, организованность, научитесь справляться со стрессом и непредвиденными ситуациями, которые могут возникнуть на экзамене
• 📈 достигнете того уровня знаний и навыков, который в будущем позволит вам изучать английский самостоятельно, готовиться и готовить своих студентов к экзаменам
• 🗣️ научитесь самостоятельно оценивать speaking and writing
• 🤝 получите много дополнительной практики с вашими сокурсниками`,
  2: `CAE

(C1 Advanced)

🎯 Кому подойдёт этот курс?

• ✅ вы хотите сдать CAE и начать готовить студентов к экзаменам
• 🧩 вы застряли на уровне B2–C1
• 🧠 у вас хороший язык, но не хватает точности и глубины
• 💼 вы хотите учиться или работать на английском
• 🚀 вы хотите звучать уверенно и естественно

✨ Это переход к продвинутому и точному английскому, мы:

• 🧠 развиваем сложную лексику и гибкость языка
• 🗣️ учимся связно аргументировать и доносить свою мысль
• 🎓 работаем с академическим английским, который пригодится для учебы, работы и сдачи экзамена
• 🛠️ устраняем слабые места, которые мешают получить высокий балл

🧩 Что мы тренируем на занятиях?

• 🗣️ speaking: аргументация, гибкость, реакция в диалоге
• ✍️ writing: essays, reports, letters and proposals на уровне C1
• 📚 vocabulary: сложные коллокации и оттенки значений
• ⚙️ grammar: точность и разнообразие структур
• 🎯 стратегии выполнения всех частей экзамена
• ⏱️ выполнение заданий на время

👥 Как проходит обучение?

• 👥 группы до 6 человек
• ⏳ занятия по 90-100 минут
• 🧠 разбор экзаменационных стратегий + практика
• ⏱️ тайминг и симуляция экзамена
• 🤝 парная и групповая работа
• 📌 подробная обратная связь

📚 Материалы

• 🧾 Expert Advanced
• 📖 Vocabulary / Collocations / Phrasal Verbs in Use
• 📘 Grammar and Vocabulary for Advanced
• 📰 Authentic articles and podcasts
• 🧠 Oxford Wordskills
• 📽️ On Screen
• 🌐 Upstream

🎁 Что включено?

• 📦 папка с материалами

• 🗂️ Speaking packs
• 🧩 Quizlet sets
• 📝 2 mock tests + revisions
• 📄 past papers
• ✍️ 10 письменных работ, проверенных мной + peer observation

🏁 По окончании курса вы:

• ✅ не только сдадите экзамен, но и будете владеть языком на этом уровне в реальной жизни
• 🌟 будете полностью знать формат экзамена, его стратегии и особенности
• 🧘 забудете, что такое нехватка идей и языковой барьер
• 💪 улучшите самодисциплину, организованность, научитесь справляться со стрессом и непредвиденными ситуациями, которые могут возникнуть на экзамене
• 📈 достигнете того уровня знаний и навыков, который в будущем позволит вам изучать английский самостоятельно, готовиться и готовить своих студентов к экзаменам
• 🗣️ научитесь самостоятельно оценивать speaking and writing
• 🤝 получите много дополнительной практики с вашими сокурсниками`,
  3: `CPE

(C2 Proficiency)

🎯 Кому подойдёт этот курс?

• ✅ вы хотите сдать CPE (или получить Grade A на CAE)
• 🧠 вы уже на C1, но чувствуете плато
• 🧩 вам не хватает точности, естественности и «глубины»
• 🚀 вы хотите звучать как продвинутый пользователь языка
• 💼 вам нужен английский для академической или профессиональной среды

✨ Мы не только готовимся к формату экзамена, но и доходим до полноценного уровня С2 

• 🛠️ устраняем fossilised errors
• 🌿 развиваем естественность и нюансы
• 🗣️ учимся звучать убедительно и понятно
• 📚 работаем со всеми аспектами языка 


🧩 Что мы тренируем на занятиях?

• 🗣️ speaking: сложные идеи, абстрактные темы, точная формулировка
• ✍️ writing: продвинутые тексты с сильной аргументацией
• 📚 vocabulary: нюансы, оттенки, точность
• ⚙️ grammar: гибкость и контроль
• 🎯 стратегии выполнения всех заданий 
• 🧠 уверенность в условиях экзамена

👥 Как проходит обучение?

• 👥 группы до 6 человек
• ⏳ занятия по 90-100 минут
• 🧠 регулярная работа с форматом CPE (стратегии + отработка)
• ⏱️ задания на время
• 💬 обсуждения на продвинутые темы
• 📌 подробная обратная связь

📚 Материалы

• 🧾 Experr Proficiency
• 📖 Advanced / Proficiency vocabulary resources
• 📰 аутентичные статьи, академические тексты
• 🎧 подкасты и лекции
• 🌟 On Screen
• 🌐 Upstream

🎁 Что включено?

• 📦 папка с материалами
• 🗂️ Speaking packs
• 🧩 Quizlet sets
• 📝 2 mock tests + revisions
• 📄 past papers
• ✍️ 10 письменных работ, проверенных мной + peer observation

🏁 Результат:

• ✅ вы сдаёте CPE или выходите на полный уровень C2
• 🌟 звучите естественно и точно
• 💬 уверенно выражаете сложные идеи
• 🛠️ избавляетесь от типичных продвинутых ошибок
• 🚀 переходите на продвинутый уровень владения языком`,
};

type CourseForDisplay = {
  id: number;
  title: string;
  slug: string;
  imagePath: string;
  description: string;
};

type CourseBlock = {
  name?: string;
  title?: string;
  slug?: string;
  description?: string;
  image?: { filename?: string };
  content?: {
    name?: string;
    title?: string;
    slug?: string;
    description?: string;
    image?: { filename?: string };
  };
};

function getImageUrl(item: { image?: { filename?: string } }): string {
  const url = item.image?.filename?.trim();
  return url || "";
}

function normalizeCourseBlock(item: CourseBlock): {
  name?: string;
  title?: string;
  slug?: string;
  description?: string;
  image?: { filename?: string };
} {
  const c = item.content;
  return {
    name: item.name ?? c?.name,
    title: item.title ?? c?.title,
    slug: item.slug ?? c?.slug,
    description: item.description ?? c?.description,
    image: item.image ?? c?.image,
  };
}

const EXAM_SINGLE_LINE = /^(FCE|CAE|CPE)\s+(\([^)]+\))$/;

function localizeCourseTitleByLanguage(title: string, language: "en" | "ru"): string {
  if (language !== "ru") return title;
  const normalized = title.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();
  if (normalized === "FCE (B2 level)") return "FCE\n(B2 уровень)";
  if (normalized === "CAE (C1 Advanced)") return "CAE\n(C1 Продвинутый)";
  if (normalized === "CPE (C2 Proficiency)") return "CPE\n(C2 Профессионал.)";
  if (normalized === "FCE\n(B2 level)") return "FCE\n(B2 уровень)";
  if (normalized === "CAE\n(C1 Advanced)") return "CAE\n(C1 Продвинутый)";
  if (normalized === "CPE\n(C2 Proficiency)") return "CPE\n(C2 Профессионал.)";
  return title;
}

function renderCourseCardTitle(title: string): ReactNode {
  const normalized = title.replace(/\r\n/g, "\n").trim();
  const lines = normalized
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length >= 2) {
    const secondLine = lines.slice(1).join(" ");
    const secondLineClass = "text-[0.92em] leading-tight block max-w-full whitespace-nowrap";
    return (
      <>
        <div>{lines[0]}</div>
        <div className={secondLineClass}>{secondLine}</div>
      </>
    );
  }
  const single = lines[0] ?? normalized;
  const m = single.match(EXAM_SINGLE_LINE);
  if (m) {
    const secondLineClass = "text-[0.92em] leading-tight block max-w-full whitespace-nowrap";
    return (
      <>
        <div>{m[1]}</div>
        <div className={secondLineClass}>{m[2]}</div>
      </>
    );
  }
  return single;
}

type Frequency = "once" | "twice";

function FrequencyIcon({ kind }: { kind: Frequency }) {
  if (kind === "twice") {
    return (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 12a8 8 0 0 1 13.8-5.5" />
        <path d="M20 4v6h-6" />
        <path d="M20 12a8 8 0 0 1-13.8 5.5" />
        <path d="M4 20v-6h6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
      <path d="M8 3.5v4M16 3.5v4M3.5 10.5h17" />
    </svg>
  );
}

function CourseFrequencyPricing({ language }: { language: "en" | "ru" }) {
  const [selected, setSelected] = useState<Frequency>("once");
  const [priceVisible, setPriceVisible] = useState(true);
  const [displayPrice, setDisplayPrice] = useState(8000);

  const options = useMemo(
    () => [
      { key: "once" as const, label: language === "ru" ? "1 раз в неделю" : "Once a week", price: 8000 },
      { key: "twice" as const, label: language === "ru" ? "2 раза в неделю" : "Twice a week", price: 15000 },
    ],
    [language],
  );

  const changeOption = (next: Frequency) => {
    if (next === selected) return;
    const nextPrice = options.find((o) => o.key === next)?.price ?? 8000;
    setSelected(next);
    setPriceVisible(false);
    window.setTimeout(() => {
      setDisplayPrice(nextPrice);
      setPriceVisible(true);
    }, 120);
  };

  return (
    <div className="mt-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => changeOption(option.key)}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-xs md:text-sm font-semibold border transition-all duration-300 ${
              selected === option.key
                ? "bg-white border-theme-secondary-accent text-theme shadow-[0_4px_12px_rgba(47,52,64,0.22),inset_0_1px_0_rgba(255,255,255,0.9)] scale-[1.02]"
                : "bg-white/45 border-white/60 text-theme-accent hover:bg-white/65"
            }`}
          >
            <FrequencyIcon kind={option.key} />
            <span>{option.label}</span>
          </button>
        ))}
      </div>
      <div
        className={`mt-2 text-center rounded-full border border-theme-light-bg bg-white/70 px-4 py-2 text-sm md:text-base font-bold text-theme transition-all duration-200 ${
          priceVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
        }`}
      >
        {displayPrice.toLocaleString("ru-RU")} {language === "ru" ? "рублей" : "RUB"}
      </div>
    </div>
  );
}

export default function CoursesClient({ data }: { data?: CoursesStoryContent | null }) {
  const { language, localizeText } = useLanguage();
  const [detailsModalCourseId, setDetailsModalCourseId] = useState<number | null>(null);
  const applyModal = useApplyModal();

  const pageTitle = data?.title?.trim() || DEFAULT_TITLE;

  const courses = useMemo((): CourseForDisplay[] => {
    const raw = data?.courses ?? [];
    const fromCms = raw
      .map((c) => normalizeCourseBlock(c as CourseBlock))
      .filter((c) => (c.name ?? c.title)?.trim());
    if (!fromCms.length) {
      return DEFAULT_COURSE_CARDS.map((c) => ({
        ...c,
        description: COURSE_DESCRIPTIONS[c.id] ?? "",
      }));
    }
    const defaults = [...DEFAULT_COURSE_CARDS];
    return fromCms.map((item, i) => {
      const title = (item.name ?? item.title)?.trim() || (defaults[i]?.title ?? "");
      const slug = item.slug?.trim() || (defaults[i]?.slug ?? "");
      const imageUrl = getImageUrl(item);
      const imagePath = imageUrl || (defaults[i]?.imagePath ?? "");
      const description =
        item.description?.trim() ?? COURSE_DESCRIPTIONS[(i + 1) as 1 | 2 | 3] ?? "";
      return { id: i + 1, title, slug, imagePath, description };
    });
  }, [data?.courses]);

  const rows = useMemo(() => {
    const r: CourseForDisplay[][] = [];
    for (let i = 0; i < courses.length; i += 3) r.push(courses.slice(i, i + 3));
    return r;
  }, [courses]);

  const renderCard = (course: CourseForDisplay) => (
    <div key={course.id} className="flex justify-center perspective-1000 min-w-0">
      <div className="course-card glass rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 w-full max-w-xl md:max-w-none min-w-0 transition-[transform,box-shadow] duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl">
        <div className="flex flex-col items-center justify-center flex-shrink-0 md:w-[44%] min-w-0">
          <div className="relative w-full max-h-[320px] sm:max-h-[380px] md:max-h-[360px] aspect-[3/4] rounded-3xl overflow-hidden bg-theme-secondary-accent/10 flex items-center justify-center">
            <Image
              src={course.imagePath || "/images/certificates/FCE B2.jpg"}
              alt={course.title}
              fill
              className="object-contain object-center"
              sizes="(max-width: 768px) 100vw, 36vw"
            />
          </div>
        </div>
        <div className="flex flex-col justify-center text-center md:text-left flex-1 min-w-0">
          <h2 className="text-xl md:text-2xl min-[1200px]:text-3xl min-[1200px]:md:text-4xl font-bold mb-5 md:mb-6 text-theme break-words text-center">
            {renderCourseCardTitle(
              localizeCourseTitleByLanguage(localizeText(course.title), language),
            )}
          </h2>
          <div className="flex flex-col gap-4 min-w-0">
            <button
              type="button"
              onClick={() => setDetailsModalCourseId(course.id)}
              className="btn btn-secondary w-full text-center min-w-0 text-sm md:text-base min-[1200px]:text-lg min-[1200px]:md:text-xl py-3 md:py-3.5 overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {localizeText("Подробнее")}
            </button>
            <button
              type="button"
              onClick={() => applyModal?.openApplyModal(course.id, course.title)}
              className="btn-primary w-full text-sm md:text-base min-[1200px]:text-lg min-[1200px]:md:text-xl px-5 py-3 md:py-4 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {localizeText("Подать заявку")}
            </button>
            <CourseFrequencyPricing language={language} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10">
        <div className="pt-24 md:pt-28">
          <section className="py-20 md:py-28 max-w-[1760px] mx-auto px-4 md:px-8">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl min-[1200px]:text-5xl min-[1200px]:md:text-6xl min-[1200px]:lg:text-7xl font-bold text-center mb-14 md:mb-20 text-theme">
                {localizeText(pageTitle)}
              </h1>

              <div
                className={
                  courses.length === 4
                    ? "grid grid-cols-1 min-[1400px]:grid-cols-2 gap-y-8 gap-x-0 min-[1400px]:gap-8 min-[1400px]:md:gap-10 perspective-1000 min-[1400px]:max-w-[900px] min-[1400px]:mx-auto"
                    : "grid grid-cols-1 min-[1400px]:grid-cols-3 gap-y-8 gap-x-0 min-[1400px]:gap-6 min-[1400px]:md:gap-8 perspective-1000"
                }
              >
                {courses.length === 4
                  ? courses.map(renderCard)
                  : rows.map((row, rowIndex) => {
                      const isLastRow = rowIndex === rows.length - 1;
                      const n = row.length;
                      if (n === 3) {
                        return <Fragment key={rowIndex}>{row.map(renderCard)}</Fragment>;
                      }
                      if (n === 2 && isLastRow) {
                        return (
                          <div
                            key={rowIndex}
                            className="min-[1400px]:col-span-3 flex flex-col min-[1400px]:flex-row min-[1400px]:justify-center gap-y-8 gap-x-0 min-[1400px]:gap-8 min-[1400px]:md:gap-10"
                          >
                            <div className="flex flex-col gap-y-8 min-[1400px]:flex-none min-[1400px]:grid min-[1400px]:grid-cols-2 min-[1400px]:gap-8 min-[1400px]:md:gap-10 min-[1400px]:w-[calc(2*(100%-2*2.5rem)/3+2.5rem)]">
                              {row.map(renderCard)}
                            </div>
                          </div>
                        );
                      }
                      if (n === 1 && isLastRow) {
                        return (
                          <div key={rowIndex} className="min-[1400px]:col-start-2">
                            {renderCard(row[0])}
                          </div>
                        );
                      }
                      return <Fragment key={rowIndex}>{row.map(renderCard)}</Fragment>;
                    })}
              </div>
            </div>
          </section>
        </div>
      </div>

      {detailsModalCourseId !== null && (
        <DetailsModal
          courseTitle={courses.find((c) => c.id === detailsModalCourseId)?.title ?? ""}
          description={courses.find((c) => c.id === detailsModalCourseId)?.description ?? ""}
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
  const { localizeText } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(true);

  useEffect(() => {
    const t = requestAnimationFrame(() => setIsOpen(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const startClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
  }, [isClosing]);

  const onOverlayWheel = useCallback((e: React.WheelEvent) => {
    if (e.target === e.currentTarget) e.preventDefault();
    e.stopPropagation();
  }, []);

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
            {localizeText(courseTitle)}
          </h2>
          <button
            type="button"
            onClick={startClose}
            className="text-theme-accent hover:text-theme text-2xl leading-none p-1 flex-shrink-0"
            aria-label={localizeText("Закрыть")}
          >
            ×
          </button>
        </div>
        <div className="mt-4 overflow-y-auto overflow-x-hidden min-h-0 max-h-[calc(85vh-8rem)] pr-1 overscroll-contain touch-auto overflow-touch">
          <div className="prose prose-theme max-w-none text-theme whitespace-pre-line leading-relaxed text-justify [&>*]:text-justify">
            {(() => {
              const lines = description.split("\n");
              const firstIdx = lines.findIndex((l) => l.trim() !== "");
              const secondIdx = lines.findIndex((l, idx) => idx > firstIdx && l.trim() !== "");

              if (firstIdx !== -1 && secondIdx !== -1) {
                const first = lines[firstIdx].trim();
                const second = lines[secondIdx].trim();
                const rest = lines.slice(secondIdx + 1).join("\n");

                const isCAE = first === "CAE" && second === "(C1 Advanced)";
                const isCPE = first === "CPE" && second === "(C2 Proficiency)";
                const isFCE = first === "FCE" && second === "(B2 level)";

                if (isCAE || isCPE || isFCE) {
                  return (
                    <>
                      <div className="!text-center font-bold">{first}</div>
                      <div className="!text-center font-bold">{second}</div>
                      {localizeText(rest)}
                    </>
                  );
                }
              }

              return localizeText(description);
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Language = "en" | "ru";

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  localizeText: (text: string) => string;
};

const phraseDictionary: Record<string, string> = {
  "About me": "Обо мне",
  "Language Courses": "Языковые курсы",
  "Free resources": "Бесплатные материалы",
  Methodology: "Методика",
  Contacts: "Контакты",
  Apply: "Подать заявку",
  "Sign up": "Регистрация",
  "Log in": "Войти",
  "Sign\nup": "Регистрация",
  "Why Teaching ≠ Learning: a way towards conscious teaching":
    "Почему Teaching ≠ Learning: путь к осознанному преподаванию",
  "Teachers often do “everything right”: plan carefully, explain clearly, choose good materials, run communicative activities, and still see slow, uneven progress. Students forget, plateau, and repeat the same errors. This webinar explains why that happens and how to teach more consciously, without overteaching or burning out.\n\nThe core idea is that teaching creates conditions, while learning is what the learner actually processes, retains, and can use later. These are not the same process, and confusing them leads to predictable classroom problems, which we also discuss in the webinar.":
    "Преподаватели часто делают «всё правильно»: тщательно планируют, ясно объясняют, подбирают качественные материалы, проводят коммуникативные активности — и всё равно видят медленный, неравномерный прогресс. Студенты забывают, выходят на плато и снова повторяют одни и те же ошибки. На этом вебинаре мы разбираем, почему так происходит, и как преподавать более осознанно — без перегрузки и эмоционального выгорания.\n\nКлючевая идея в том, что teaching создаёт условия, а learning — это то, что ученик действительно обрабатывает, сохраняет и может использовать позже. Это не один и тот же процесс, и их смешение приводит к предсказуемым проблемам в классе, которые мы также обсуждаем на вебинаре.",
  "All in all": "В целом",
  "Dear Teacher": "Дорогой преподаватель",
  "Thank you": "Спасибо",
  "Email address": "Адрес email",
  "Download failed": "Ошибка скачивания",
};

const wordDictionary: Record<string, string> = {
  about: "о",
  advanced: "продвинутый",
  again: "снова",
  and: "и",
  apply: "подать",
  as: "как",
  atmosphere: "атмосфера",
  best: "лучший",
  boost: "рывок",
  but: "но",
  by: "по",
  call: "звонок",
  came: "пришла",
  can: "могу",
  cards: "карты",
  clear: "понятный",
  conscious: "осознанный",
  confidence: "уверенность",
  consultations: "консультации",
  continue: "продолжить",
  course: "курс",
  courses: "курсы",
  costs: "затраты",
  conditions: "условия",
  creating: "создание",
  details: "подробности",
  effective: "эффективный",
  english: "английский",
  enough: "достаточно",
  environment: "среда",
  exam: "экзамен",
  experience: "опыт",
  feedback: "обратная связь",
  first: "первый",
  flow: "поток",
  for: "для",
  forgot: "забыли",
  free: "бесплатные",
  from: "из",
  fun: "приятный",
  grammar: "грамматика",
  huge: "огромный",
  i: "я",
  in: "в",
  instagram: "Инстаграм",
  it: "это",
  know: "знаю",
  learning: "обучение",
  lessons: "уроки",
  level: "уровень",
  log: "вход",
  long: "долгий",
  materials: "материалы",
  media: "медиа",
  methods: "методы",
  months: "месяцы",
  my: "мой",
  not: "не",
  now: "сейчас",
  of: "",
  on: "на",
  only: "только",
  over: "через",
  personalized: "персональный",
  practice: "практика",
  probably: "вероятно",
  progress: "прогресс",
  resources: "материалы",
  safe: "безопасная",
  seals: "морские котики",
  self: "само",
  speaking: "говорение",
  structure: "структура",
  student: "студент",
  students: "студенты",
  syllabus: "силлабус",
  tasks: "задания",
  teaching: "преподавание",
  telegram: "Телеграм",
  text: "текст",
  thank: "спасибо",
  the: "",
  this: "это",
  time: "время",
  to: "к",
  tools: "инструменты",
  up: "вверх",
  vocabulary: "лексика",
  was: "был",
  way: "путь",
  well: "хорошо",
  with: "с",
  writing: "письмо",
  you: "вы",
  your: "ваш",
};

function capitalizeLike(source: string, target: string): string {
  if (!source) return target;
  if (source === source.toUpperCase()) return target.toUpperCase();
  const firstSourceChar = source[0];
  if (firstSourceChar && firstSourceChar === firstSourceChar.toUpperCase()) {
    return target.charAt(0).toUpperCase() + target.slice(1);
  }
  return target;
}

function normalizeSpaces(text: string): string {
  return text
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ +([,.!?;:])/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")");
}

export function translateTextToRussian(input: string): string {
  let result = input;

  Object.entries(phraseDictionary)
    .sort((a, b) => b[0].length - a[0].length)
    .forEach(([from, to]) => {
      const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(new RegExp(escaped, "gi"), to);
    });

  result = result.replace(/\b[A-Za-z][A-Za-z'-]*\b/g, (word) => {
    const translated = wordDictionary[word.toLowerCase()];
    if (translated == null) return word;
    return capitalizeLike(word, translated);
  });

  return normalizeSpaces(result);
}

function localizeByLanguage(text: string, language: Language): string {
  if (language !== "ru") return text;
  return translateTextToRussian(text);
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [isLanguageTransitioning, setIsLanguageTransitioning] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.lang = language === "ru" ? "ru" : "en";
  }, [language]);

  useEffect(() => {
    if (!isLanguageTransitioning) return;
    const id = window.setTimeout(() => setIsLanguageTransitioning(false), 220);
    return () => window.clearTimeout(id);
  }, [isLanguageTransitioning]);

  const setLanguage = useCallback((lang: Language) => {
    if (lang === language) return;
    setIsLanguageTransitioning(true);
    setLanguageState(lang);
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === "en" ? "ru" : "en"));
  }, []);

  const localizeText = useCallback(
    (text: string) => localizeByLanguage(text, language),
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage, localizeText }),
    [language, setLanguage, toggleLanguage, localizeText],
  );

  return (
    <LanguageContext.Provider value={value}>
      <div
        className={`transition-opacity duration-200 ${
          isLanguageTransitioning ? "opacity-90" : "opacity-100"
        }`}
      >
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}

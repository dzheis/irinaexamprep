/** Поля блока Hero (из Body или напрямую hero) */
export type HeroContent = {
  title?: string;
  description?: string;
  intro?: string;
  image?: { filename?: string };
};

/** Блок в Body: component = тип блока, остальные ключи — поля */
export type StoryblokBlock = { component: string; [key: string]: unknown };

/** Блок About (секция «Обо мне»). paragraphs в Storyblok приходят как Bloks с полем text; certificates — как блоки с image (Asset) и alt. */
export type AboutBlockContent = {
  title?: string;
  /** В Storyblok: массив блоков с полем text (Textarea). Код принимает и string[], и { text?: string }[]. */
  paragraphs?: (string | { text?: string; content?: string })[];
  /** В Storyblok: массив блоков с полями image (Asset) и alt (Text). Может приходить с обёрткой content или image строкой. */
  certificates?: {
    filename?: string;
    alt?: string;
    image?: string | { filename?: string };
    content?: { image?: string | { filename?: string }; alt?: string };
  }[];
  image?: { filename?: string };
};

/** Одна ссылка в блоке CTA (Telegram или Instagram). В Storyblok: Blocks, component section_cta_link. Поле ссылки может быть url или link (Link type). */
export type CtaLinkItemContent = {
  url?: string | { url?: string; cached_url?: string };
  link?: string | { url?: string; cached_url?: string };
  label?: string;
  type?: 'telegram' | 'instagram';
};

/** Блок CTA (призыв подписаться + соцсети). Если задан массив links — он используется; иначе — старые поля telegram_*, instagram_*. */
export type CtaBlockContent = {
  title?: string;
  subtitle?: string;
  /** Текст согласия с политикой конфиденциальности (рядом с чекбоксом). Если пусто — используется текст по умолчанию из кода. */
  privacy_consent_text?: string;
  /** Список ссылок (ТГ, Instagram). Добавление/удаление/порядок — в Storyblok. */
  links?: CtaLinkItemContent[];
  telegram_label?: string;
  telegram_url?: string;
  telegram_channel_label?: string;
  telegram_channel_url?: string;
  instagram_label?: string;
  instagram_url?: string;
};

/** Один пункт блока Features */
export type FeatureItemContent = {
  title?: string;
  description?: string;
  animation_key?: string; // calendar | clock | consultation — маппинг на Lottie
};

/** Блок Features (преимущества) */
export type FeaturesBlockContent = {
  title?: string;
  subtitle?: string;
  items?: FeatureItemContent[];
};

/** Один отзыв */
export type TestimonialItemContent = {
  name?: string;
  role?: string;
  text?: string;
  avatar?: { filename?: string };
  certificate_image?: { filename?: string };
};

/** Блок Testimonials */
export type TestimonialsBlockContent = {
  title?: string;
  items?: TestimonialItemContent[];
};

/** Одна карточка секции курсов/методики/ресурсов */
export type HomeCardItemContent = {
  title?: string;
  link?: string;
  description?: string;
};

/** Блок секции карточек на главной (Language Courses, Methodology, Free resources) */
export type CoursesSectionBlockContent = {
  cards?: HomeCardItemContent[]; // 3 карточки: курсы, методика, ресурсы
};

/** Поля контента истории «Главная» (home) в Storyblok */
export type HomeStoryContent = {
  hero?: HeroContent;
  body?: StoryblokBlock[];
};

/** Пункт меню для шапки/подвала */
export type NavLink = {
  href?: string;
  id?: string;
  label?: string;
};

/** Поля контента истории «Глобальный конфиг» (config) в Storyblok */
export type ConfigStoryContent = {
  header?: {
    logo_text?: string;
    alt_text?: string;
    nav_links?: NavLink[];
  };
  footer?: {
    credit_text?: string;
  };
};

/** Один курс для страницы /courses (заготовка под следующую интеграцию) */
export type CourseItem = {
  name?: string;
  slug?: string;
  description?: string;
  image?: { filename?: string };
};

/** Поля контента истории «Курсы» (courses) в Storyblok */
export type CoursesStoryContent = {
  title?: string;
  courses?: CourseItem[];
};

export type MethodologyModuleItem = {
  id?: string;
  video_id?: string;
  videoId?: string;
  title?: string;
  description?: string;
  price?: number;
};

export type MethodologyStoryContent = {
  title?: string;
  modules?: MethodologyModuleItem[];
};

export type FreeResourceItemStory = {
  title?: string;
  description?: string;
  file?: { filename?: string; [key: string]: unknown };
  download_filename?: string;
};

export type FreeResourcesStoryContent = {
  title?: string;
  resources?: FreeResourceItemStory[];
};

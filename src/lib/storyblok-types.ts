/** Hero section fields (from `body` or directly as `hero`) */
export type HeroContent = {
  title?: string;
  description?: string;
  intro?: string;
  image?: { filename?: string };
};

/** Block inside Storyblok `body`: `component` is the block type, other keys are fields */
export type StoryblokBlock = { component: string; [key: string]: unknown };

/** About block ("About me" section).
 * `paragraphs` come as blocks with a `text` field; `certificates` come as blocks with `image` (Asset) and `alt`.
 */
export type AboutBlockContent = {
  title?: string;
  /** In Storyblok: array of blocks with `text` (Textarea). Code accepts both `string[]` and `{ text?: string }[]`. */
  paragraphs?: (string | { text?: string; content?: string })[];
  /** In Storyblok: array of blocks with `image` (Asset) and `alt` (Text).
   * May arrive wrapped into `content` or with `image` as a string.
   */
  certificates?: {
    filename?: string;
    alt?: string;
    image?: string | { filename?: string };
    content?: { image?: string | { filename?: string }; alt?: string };
  }[];
  image?: { filename?: string };
};

/** One CTA link item (Telegram or Instagram).
 * In Storyblok: `Blocks`, component `section_cta_link`.
 * The link field can be either `url` or `link` (Link type).
 */
export type CtaLinkItemContent = {
  url?: string | { url?: string; cached_url?: string };
  link?: string | { url?: string; cached_url?: string };
  label?: string;
  type?: 'telegram' | 'instagram';
};

/** CTA block (subscribe call + social networks). If `links` is provided, it is used; otherwise, old `telegram_*` / `instagram_*` fields are used. */
export type CtaBlockContent = {
  title?: string;
  subtitle?: string;
  /** Privacy policy consent text (next to the checkbox). If empty, code default text is used. */
  privacy_consent_text?: string;
  /** List of links (Telegram, Instagram). Add/remove/reorder in Storyblok. */
  links?: CtaLinkItemContent[];
  telegram_label?: string;
  telegram_url?: string;
  telegram_channel_label?: string;
  telegram_channel_url?: string;
  instagram_label?: string;
  instagram_url?: string;
};

/** One item inside Features */
export type FeatureItemContent = {
  title?: string;
  description?: string;
  animation_key?: string; // calendar | clock | consultation — mapped to Lottie
};

/** Features block (benefits) */
export type FeaturesBlockContent = {
  title?: string;
  subtitle?: string;
  items?: FeatureItemContent[];
};

/** One testimonial */
export type TestimonialItemContent = {
  name?: string;
  role?: string;
  text?: string;
  avatar?: { filename?: string };
  certificate_image?: { filename?: string };
};

/** Testimonials block */
export type TestimonialsBlockContent = {
  title?: string;
  items?: TestimonialItemContent[];
};

/** One card in the Courses/Methodology/Resources sections */
export type HomeCardItemContent = {
  title?: string;
  link?: string;
  description?: string;
};

/** Home cards section block (Language Courses, Methodology, Free resources) */
export type CoursesSectionBlockContent = {
  cards?: HomeCardItemContent[]; // 3 cards: courses, methodology, free resources
};

/** Home story content fields (Storyblok slug: `home`) */
export type HomeStoryContent = {
  hero?: HeroContent;
  body?: StoryblokBlock[];
};

/** Menu item for the header/footer */
export type NavLink = {
  href?: string;
  id?: string;
  label?: string;
};

/** Global config story content fields (Storyblok slug: `config`) */
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

/** One course item for `/courses` (placeholder for the next integration) */
export type CourseItem = {
  name?: string;
  slug?: string;
  description?: string;
  image?: { filename?: string };
};

/** Courses story content fields (Storyblok slug: `courses`) */
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

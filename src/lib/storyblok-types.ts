export type HeroContent = {
  title?: string;
  description?: string;
  intro?: string;
  image?: { filename?: string };
};

export type StoryblokBlock = { component: string; [key: string]: unknown };

export type AboutBlockContent = {
  title?: string;
  paragraphs?: (string | { text?: string; content?: string })[];
  certificates?: {
    filename?: string;
    alt?: string;
    image?: string | { filename?: string };
    content?: { image?: string | { filename?: string }; alt?: string };
  }[];
  image?: { filename?: string };
};

export type CtaLinkItemContent = {
  url?: string | { url?: string; cached_url?: string };
  link?: string | { url?: string; cached_url?: string };
  label?: string;
  type?: "telegram" | "instagram";
};

export type CtaBlockContent = {
  title?: string;
  subtitle?: string;
  privacy_consent_text?: string;
  links?: CtaLinkItemContent[];
  telegram_label?: string;
  telegram_url?: string;
  telegram_channel_label?: string;
  telegram_channel_url?: string;
  instagram_label?: string;
  instagram_url?: string;
};

export type FeatureItemContent = {
  title?: string;
  description?: string;
  animation_key?: string;
};

export type FeaturesBlockContent = {
  title?: string;
  subtitle?: string;
  items?: FeatureItemContent[];
};

export type TestimonialItemContent = {
  name?: string;
  role?: string;
  text?: string;
  avatar?: { filename?: string };
  certificate_image?: { filename?: string };
};

export type TestimonialsBlockContent = {
  title?: string;
  items?: TestimonialItemContent[];
};

export type HomeCardItemContent = {
  title?: string;
  link?: string;
  description?: string;
};

export type CoursesSectionBlockContent = {
  cards?: HomeCardItemContent[];
};

export type HomeStoryContent = {
  hero?: HeroContent;
  body?: StoryblokBlock[];
};

export type NavLink = {
  href?: string;
  id?: string;
  label?: string;
};

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

export type CourseItem = {
  name?: string;
  slug?: string;
  description?: string;
  image?: { filename?: string };
};

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

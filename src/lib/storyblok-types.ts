/** Поля контента истории «Главная» (home) в Storyblok */
export type HomeStoryContent = {
  hero?: {
    title?: string;
    description?: string;
    intro?: string;
    image?: { filename?: string };
  };
};

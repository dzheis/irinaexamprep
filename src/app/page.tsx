import HomeClient from './home-client';
import { fetchStory } from '@/lib/storyblok';
import type {
  HomeStoryContent,
  HeroContent,
  AboutBlockContent,
  CtaBlockContent,
  FeaturesBlockContent,
  TestimonialsBlockContent,
  CoursesSectionBlockContent,
} from '@/lib/storyblok-types';

const FALLBACK_TITLE = 'Подготовка к экзаменам Cambridge (B2–C2)';
const FALLBACK_DESCRIPTION = '';

/** Storyblok block names: readable section mappings.
 * The first name is recommended; the rest are for backward compatibility.
 */
export const HOME_BLOCK_NAMES = {
  hero: ['section_hero', 'hero'],
  about: ['section_about', 'about'],
  features: ['section_features', 'features'],
  testimonials: ['section_testimonials', 'testimonials'],
  coursesCards: ['section_courses_cards', 'courses_section'],
  cta: ['section_cta', 'cta'],
} as const;

function getBlock<T>(
  content: HomeStoryContent | undefined,
  componentNames: string | readonly string[]
): T | undefined {
  const names = Array.isArray(componentNames) ? componentNames : [componentNames];
  const block = content?.body?.find((b) =>
    names.some((name) => String(b.component).toLowerCase() === name.toLowerCase())
  );
  return block as T | undefined;
}

function getHeroFromContent(content: HomeStoryContent | undefined): HeroContent | undefined {
  if (!content) return undefined;
  if (content.hero) return content.hero;
  return getBlock<HeroContent>(content, HOME_BLOCK_NAMES.hero);
}

export default async function Home() {
  const story = await fetchStory<HomeStoryContent>('home');
  const content = story?.content;
  const hero = getHeroFromContent(content);
  const about = getBlock<AboutBlockContent>(content, HOME_BLOCK_NAMES.about);
  const cta = getBlock<CtaBlockContent>(content, HOME_BLOCK_NAMES.cta);
  const features = getBlock<FeaturesBlockContent>(content, HOME_BLOCK_NAMES.features);
  const testimonials = getBlock<TestimonialsBlockContent>(content, HOME_BLOCK_NAMES.testimonials);
  const coursesSection = getBlock<CoursesSectionBlockContent>(content, HOME_BLOCK_NAMES.coursesCards);

  return (
    <HomeClient
      title={hero?.title ?? FALLBACK_TITLE}
      description={hero?.description ?? FALLBACK_DESCRIPTION}
      intro={hero?.intro}
      imageUrl={hero?.image?.filename}
      about={about}
      cta={cta}
      features={features}
      testimonials={testimonials}
      coursesSection={coursesSection}
    />
  );
}

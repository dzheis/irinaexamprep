import HomeClient from './home-client';
import { fetchStory } from '@/lib/storyblok';
import type { HomeStoryContent } from '@/lib/storyblok-types';

const FALLBACK_TITLE = 'Ирина Петрова';
const FALLBACK_DESCRIPTION = '';

export default async function Home() {
  const story = await fetchStory<HomeStoryContent>('home');
  const hero = story?.content?.hero;

  return (
    <HomeClient
      title={hero?.title ?? FALLBACK_TITLE}
      description={hero?.description ?? FALLBACK_DESCRIPTION}
      intro={hero?.intro}
      imageUrl={hero?.image?.filename}
    />
  );
}

import { MetadataRoute } from 'next'
import { SITEMAP_STATIC_PATHS } from '@/presentation/routes'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env["NEXT_PUBLIC_SITE_URL"];

  // Статические страницы
  const staticPages = [...SITEMAP_STATIC_PATHS].map((route) => ({
    url: `${baseUrl ?? "https://irinaexamprep.com"}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Здесь можно добавить динамические страницы из Supabase или Storyblok, если они есть

  return [...staticPages]
}


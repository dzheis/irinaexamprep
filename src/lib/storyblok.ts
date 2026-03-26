import { apiPlugin, getStoryblokApi, storyblokInit } from "@storyblok/react/rsc";
import type { ConfigStoryContent } from "./storyblok-types";

const token = process.env.NEXT_PUBLIC_STORYBLOK_ACCESS_TOKEN;

/**
 * Temporarily disable Storyblok: the site uses code-based content (fallbacks on pages).
 * In `.env.local`: DISABLE_STORYBLOK=1 (or true / yes)
 */
export function isStoryblokDisabled(): boolean {
  const v = process.env.DISABLE_STORYBLOK?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

storyblokInit({
  accessToken: token || "",
  use: [apiPlugin],
  apiOptions: { region: "eu" },
});

export { getStoryblokApi };

export type StoryblokStory<T = Record<string, unknown>> = {
  content: T;
  name: string;
  slug: string;
  id: number;
};

/** Loads a story by slug. If token is missing or the request fails, returns null. */
export async function fetchStory<T = Record<string, unknown>>(
  slug: string,
  options?: { version?: "draft" | "published" }
): Promise<StoryblokStory<T> | null> {
  if (isStoryblokDisabled()) return null;
  if (!token?.trim()) return null;
  try {
    const api = getStoryblokApi();
    const { data } = await api.get(`cdn/stories/${slug}`, {
      version: options?.version ?? "published",
    });
    return data?.story ?? null;
  } catch {
    return null;
  }
}

/** Normalizes config story content: Storyblok can return header/footer either as flat fields or inside body[]. */
function normalizeConfigContent(raw: Record<string, unknown> | null): ConfigStoryContent | null {
  if (!raw || typeof raw !== 'object') return null;

  const body = raw.body as { component?: string; [key: string]: unknown }[] | undefined;
  const headerFromBody = Array.isArray(body)
    ? body.find((b) => String(b?.component ?? '').toLowerCase() === 'header')
    : undefined;
  const footerFromBody = Array.isArray(body)
    ? body.find((b) => String(b?.component ?? '').toLowerCase() === 'footer')
    : undefined;

  let header = (raw.header ?? headerFromBody) as ConfigStoryContent['header'] | undefined;
  let footer = (raw.footer ?? footerFromBody) as ConfigStoryContent['footer'] | undefined;

  if (Array.isArray(footer)) footer = footer[0] as ConfigStoryContent['footer'];
  if (Array.isArray(header)) header = header[0] as ConfigStoryContent['header'];

  return { header: header ?? undefined, footer: footer ?? undefined };
}

/** Loads the global config (header, footer). Slug in Storyblok: **config**. */
export async function getConfig(): Promise<ConfigStoryContent | null> {
  const story = await fetchStory<Record<string, unknown>>('config');
  const raw = story?.content ?? null;
  return normalizeConfigContent(raw);
}

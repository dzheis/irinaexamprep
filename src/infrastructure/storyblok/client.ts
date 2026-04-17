import { cache } from "react";
import { apiPlugin, getStoryblokApi, storyblokInit } from "@storyblok/react/rsc";
import type { ConfigStoryContent } from "@/lib/storyblok-types";

const token = process.env["NEXT_PUBLIC_STORYBLOK_ACCESS_TOKEN"];

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

/**
 * Per-request memoized Storyblok read. Multiple callers (methodology page + video-embed + admin module list)
 * hitting the same `slug` within a single request share one network call via React.cache.
 */
const fetchStoryInternal = cache(
  async (slug: string, version: "draft" | "published"): Promise<StoryblokStory | null> => {
    if (!token?.trim()) return null;
    try {
      const api = getStoryblokApi();
      const { data } = await api.get(`cdn/stories/${slug}`, { version });
      return data?.story ?? null;
    } catch {
      return null;
    }
  },
);

export async function fetchStory<T = Record<string, unknown>>(
  slug: string,
  options?: { version?: "draft" | "published" },
): Promise<StoryblokStory<T> | null> {
  const story = await fetchStoryInternal(slug, options?.version ?? "published");
  return (story as StoryblokStory<T> | null) ?? null;
}

function normalizeConfigContent(raw: Record<string, unknown> | null): ConfigStoryContent | null {
  if (!raw || typeof raw !== "object") return null;

  const body = raw["body"] as { component?: string; [key: string]: unknown }[] | undefined;
  const headerFromBody = Array.isArray(body)
    ? body.find((b) => String(b?.component ?? "").toLowerCase() === "header")
    : undefined;
  const footerFromBody = Array.isArray(body)
    ? body.find((b) => String(b?.component ?? "").toLowerCase() === "footer")
    : undefined;

  let header = (raw["header"] ?? headerFromBody) as ConfigStoryContent["header"] | undefined;
  let footer = (raw["footer"] ?? footerFromBody) as ConfigStoryContent["footer"] | undefined;

  if (Array.isArray(footer)) footer = footer[0] as ConfigStoryContent["footer"];
  if (Array.isArray(header)) header = header[0] as ConfigStoryContent["header"];

  return {
    ...(header ? { header } : {}),
    ...(footer ? { footer } : {}),
  };
}

export async function getConfig(): Promise<ConfigStoryContent | null> {
  const story = await fetchStory<Record<string, unknown>>("config");
  const raw = story?.content ?? null;
  return normalizeConfigContent(raw);
}

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

export async function fetchStory<T = Record<string, unknown>>(
  slug: string,
  options?: { version?: "draft" | "published" },
): Promise<StoryblokStory<T> | null> {
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

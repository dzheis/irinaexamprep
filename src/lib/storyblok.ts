import { apiPlugin, getStoryblokApi, storyblokInit } from "@storyblok/react/rsc";

const token = process.env.NEXT_PUBLIC_STORYBLOK_ACCESS_TOKEN;

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

/** Загружает историю по slug. Если токена нет или запрос неудачен — возвращает null. */
export async function fetchStory<T = Record<string, unknown>>(
  slug: string,
  options?: { version?: "draft" | "published" }
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

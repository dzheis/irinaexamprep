import { fetchStory } from "@/infrastructure/storyblok/client";

export type TextPageFromStoryblok = {
  title: string;
  contentRichText: Record<string, unknown> | null;
  customFields: Record<string, string>;
};

function isRichTextDoc(raw: unknown): raw is { type: string; content?: unknown[] } {
  return (
    typeof raw === "object" &&
    raw !== null &&
    "type" in raw &&
    (raw as { type: string }).type === "doc"
  );
}

function getDocFromBlock(block: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!block || typeof block !== "object") return null;
  const candidates = [
    block["content"],
    block["richtext"],
    block["rich_text"],
    block["body"],
    block["text"],
  ];
  for (const c of candidates) {
    if (c != null && isRichTextDoc(c)) return c as Record<string, unknown>;
  }
  return null;
}

export async function getTextPageFromStoryblok(
  slug: string,
  defaultTitle: string,
): Promise<TextPageFromStoryblok> {
  const story = await fetchStory<Record<string, unknown>>(slug);
  const raw = story?.content ?? null;
  if (!raw || typeof raw !== "object") {
    return { title: defaultTitle, contentRichText: null, customFields: {} };
  }

  const title =
    (raw["title"] ?? raw["headline"]) != null
      ? String(raw["title"] ?? raw["headline"]).trim()
      : defaultTitle;

  let contentRichText: Record<string, unknown> | null = null;
  const topContent = raw["content"] ?? raw["body"] ?? raw["richtext"] ?? raw["rich_text"];
  if (topContent != null && isRichTextDoc(topContent)) {
    contentRichText = topContent as Record<string, unknown>;
  }

  if (!contentRichText && Array.isArray(raw["body"])) {
    const body = raw["body"] as Record<string, unknown>[];
    for (const block of body) {
      const doc = getDocFromBlock(block);
      if (doc) {
        contentRichText = doc;
        break;
      }
      const nested = block?.["content"] as Record<string, unknown> | undefined;
      if (nested && typeof nested === "object") {
        const fromNested =
          getDocFromBlock(nested) ??
          (isRichTextDoc(nested) ? (nested as Record<string, unknown>) : null);
        if (fromNested) {
          contentRichText = fromNested;
          break;
        }
      }
    }
  }

  if (!contentRichText && typeof raw === "object" && raw !== null) {
    for (const key of Object.keys(raw)) {
      if (key === "component" || key === "_uid") continue;
      const val = (raw as Record<string, unknown>)[key];
      if (val != null && isRichTextDoc(val)) {
        contentRichText = val as Record<string, unknown>;
        break;
      }
    }
  }

  const skipKeys = new Set([
    "component",
    "_uid",
    "title",
    "headline",
    "content",
    "body",
    "richtext",
    "rich_text",
  ]);
  const customFields: Record<string, string> = {};
  for (const key of Object.keys(raw)) {
    if (skipKeys.has(key)) continue;
    const val = (raw as Record<string, unknown>)[key];
    if (typeof val === "string" && val.trim()) customFields[key] = val.trim();
  }

  return {
    title: title || defaultTitle,
    contentRichText,
    customFields,
  };
}

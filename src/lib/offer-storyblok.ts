import { fetchStory } from '@/lib/storyblok';

export type OfferFromStoryblok = {
  title: string;
  /** Rich text document (type: "doc") from Storyblok — rendered via `renderRichText`. */
  contentRichText: Record<string, unknown> | null;
};

const DEFAULT_TITLE = 'ПУБЛИЧНАЯ ОФЕРТА о заключении договора об оказании услуг';

function isRichTextDoc(raw: unknown): raw is { type: string; content?: unknown[] } {
  return (
    typeof raw === 'object' &&
    raw !== null &&
    'type' in raw &&
    (raw as { type: string }).type === 'doc'
  );
}

function getDocFromBlock(block: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!block || typeof block !== 'object') return null;
  const candidates = [
    block.content,
    block.richtext,
    block.rich_text,
    block.body,
    block.text,
  ];
  for (const c of candidates) {
    if (c != null && isRichTextDoc(c)) return c as Record<string, unknown>;
  }
  return null;
}

export async function getOfferFromStoryblok(): Promise<OfferFromStoryblok> {
  const story = await fetchStory<Record<string, unknown>>('offer');
  const raw = story?.content ?? null;
  if (!raw || typeof raw !== 'object') {
    return { title: DEFAULT_TITLE, contentRichText: null };
  }

  const title =
    (raw.title ?? raw.headline) != null
      ? String(raw.title ?? raw.headline).trim()
      : DEFAULT_TITLE;

  let contentRichText: Record<string, unknown> | null = null;

  const topContent = raw.content ?? raw.body ?? raw.richtext ?? raw.rich_text;
  if (topContent != null && isRichTextDoc(topContent)) {
    contentRichText = topContent as Record<string, unknown>;
  }

  if (!contentRichText && Array.isArray(raw.body)) {
    const body = raw.body as Record<string, unknown>[];
    for (const block of body) {
      const doc = getDocFromBlock(block);
      if (doc) {
        contentRichText = doc;
        break;
      }
      const nested = block?.content as Record<string, unknown> | undefined;
      if (nested && typeof nested === 'object') {
        const fromNested = getDocFromBlock(nested) ?? (isRichTextDoc(nested) ? (nested as Record<string, unknown>) : null);
        if (fromNested) {
          contentRichText = fromNested;
          break;
        }
      }
    }
  }

  if (!contentRichText && typeof raw === 'object' && raw !== null) {
    for (const key of Object.keys(raw)) {
      if (key === 'component' || key === '_uid') continue;
      const val = (raw as Record<string, unknown>)[key];
      if (val != null && isRichTextDoc(val)) {
        contentRichText = val as Record<string, unknown>;
        break;
      }
    }
  }

  return {
    title: title || DEFAULT_TITLE,
    contentRichText,
  };
}

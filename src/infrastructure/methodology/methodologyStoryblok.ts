import { fetchStory } from "@/infrastructure/storyblok/client";
import { getVideoIdByModuleId } from "@/infrastructure/methodology/fallbackModuleCatalog";
import type { MethodologyVideoItem } from "@/types/methodology";

type RawModule = {
  id?: string;
  ID?: string;
  video_id?: string;
  videoId?: string;
  VideoId?: string;
  title?: string;
  Title?: string;
  description?: string;
  Description?: string;
  price?: number | string;
  Price?: number | string;
  content?: RawModule;
};

function parsePrice(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(/\s/g, "").replace(",", ".");
    const n = Number(normalized);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

/** Positive finite RUB amount from Storyblok fields only; otherwise undefined (no checkout). */
function normalizeListingPriceRub(value: unknown): number | undefined {
  const parsed = parsePrice(value);
  if (parsed === undefined || !Number.isFinite(parsed) || parsed <= 0) return undefined;
  return parsed;
}

function getModulesFromRaw(raw: Record<string, unknown> | null): RawModule[] {
  if (!raw || typeof raw !== "object") return [];
  const arr =
    raw["modules"] ?? raw["Blocks"] ?? raw["modules_list"] ?? raw["items"] ?? raw["blocks"];
  if (!Array.isArray(arr)) return [];
  return arr as RawModule[];
}

function getTitleFromRaw(raw: Record<string, unknown> | null): string {
  if (!raw || typeof raw !== "object") return "";
  const t = (raw["title"] ?? raw["headline"] ?? "") as string;
  if (t?.trim()) return t.trim();
  const body = raw["body"] as Record<string, unknown>[] | undefined;
  const first = Array.isArray(body) ? body[0] : undefined;
  if (first && typeof first === "object") {
    const ft = (first["title"] ?? first["headline"] ?? "") as string;
    if (ft?.trim()) return ft.trim();
  }
  return "";
}

export function rawModuleToVideoItem(m: RawModule): MethodologyVideoItem | null {
  const c = m.content as RawModule | undefined;
  const id = (m.id ?? m.ID ?? c?.id ?? c?.ID)?.toString()?.trim();
  if (!id) return null;
  const title = (m.title ?? m.Title ?? c?.title ?? c?.Title)?.toString()?.trim();
  const description =
    (m.description ?? m.Description ?? c?.description ?? c?.Description)?.toString()?.trim() ?? "";
  const price = normalizeListingPriceRub(m.price ?? m.Price ?? c?.price ?? c?.Price);
  return { id, description, ...(title ? { title } : {}), ...(price !== undefined ? { price } : {}) };
}

export function buildMethodologyVideosFromStoryContent(
  raw: Record<string, unknown> | null,
): MethodologyVideoItem[] {
  if (!raw || typeof raw !== "object") return [];
  const rawModules = getModulesFromRaw(raw);
  const fromBody = Array.isArray((raw as { body?: unknown[] })?.body)
    ? getModulesFromRaw((raw as { body: Record<string, unknown>[] }).body[0] ?? null)
    : [];
  const list = rawModules.length ? rawModules : fromBody;
  return list
    .map((m) => rawModuleToVideoItem(m))
    .filter((v): v is MethodologyVideoItem => !!v && !!v.id);
}

export type ResolveMethodologyCheckoutAmountResult =
  | { ok: true; amount: number }
  | { ok: false; reason: "invalid_product" | "checkout_unavailable" };

/**
 * Resolves checkout amount from the published methodology story only (no client-trusted sums).
 */
export async function resolveMethodologyCheckoutAmountRub(
  productId: string,
): Promise<ResolveMethodologyCheckoutAmountResult> {
  const story = await fetchStory<Record<string, unknown>>("methodology");
  if (!story?.content) {
    return { ok: false, reason: "checkout_unavailable" };
  }
  const id = productId.trim();
  if (!id) {
    return { ok: false, reason: "invalid_product" };
  }
  const videos = buildMethodologyVideosFromStoryContent(story.content);
  const item = videos.find((v) => v.id === id);
  if (!item) {
    return { ok: false, reason: "invalid_product" };
  }
  const p = item.price;
  if (typeof p !== "number" || !Number.isFinite(p) || p <= 0) {
    return { ok: false, reason: "checkout_unavailable" };
  }
  return { ok: true, amount: p };
}

export async function getMethodologyFromStoryblok(): Promise<{
  title: string;
  videos: MethodologyVideoItem[];
  purchaseEnabled: boolean;
}> {
  const story = await fetchStory<Record<string, unknown>>("methodology");
  if (!story?.content) {
    return { title: "Методология", videos: [], purchaseEnabled: false };
  }
  const raw = story.content;
  const title = getTitleFromRaw(raw) || "Методология";
  const videos = buildMethodologyVideosFromStoryContent(raw).slice(0, 1);
  const purchaseEnabled =
    videos.length > 0 &&
    videos.every((v) => typeof v.price === "number" && Number.isFinite(v.price) && v.price > 0);
  return { title, videos, purchaseEnabled };
}

export async function getVideoIdByModuleIdFromStoryblok(moduleId: string): Promise<string | null> {
  const story = await fetchStory<Record<string, unknown>>("methodology");
  const raw = story?.content ?? null;
  const list = getModulesFromRaw(raw);
  if (!list.length && raw?.["body"] && Array.isArray((raw as { body: unknown[] })["body"])) {
    const first = (raw as { body: Record<string, unknown>[] }).body[0];
    if (first) list.push(...getModulesFromRaw(first as Record<string, unknown>));
  }
  const id = moduleId.trim();
  if (id === "1") return "66AD0i00RXs";
  const mod = list.find(
    (m) =>
      (m.id ?? m.ID ?? (m.content as RawModule)?.id ?? (m.content as RawModule)?.ID)
        ?.toString()
        ?.trim() === id,
  );
  const rawMod = mod?.content as RawModule | undefined;
  const videoId = (
    mod?.video_id ??
    mod?.videoId ??
    mod?.VideoId ??
    rawMod?.video_id ??
    rawMod?.videoId ??
    rawMod?.VideoId
  )
    ?.toString()
    ?.trim();
  if (videoId) return videoId;
  return getVideoIdByModuleId(id);
}

export async function getAllMethodologyModuleIds(): Promise<string[]> {
  const story = await fetchStory<Record<string, unknown>>("methodology");
  const raw = story?.content ?? null;
  const list = getModulesFromRaw(raw);
  if (!list.length && raw?.["body"] && Array.isArray((raw as { body: unknown[] })["body"])) {
    const first = (raw as { body: Record<string, unknown>[] }).body[0];
    if (first) list.push(...getModulesFromRaw(first as Record<string, unknown>));
  }
  const ids = list
    .map((m) =>
      (m.id ?? m.ID ?? (m.content as RawModule)?.id ?? (m.content as RawModule)?.ID)
        ?.toString()
        ?.trim(),
    )
    .filter(Boolean) as string[];
  if (ids.length) return ids;
  const { METHODOLOGY_MODULES } = await import(
    "@/infrastructure/methodology/fallbackModuleCatalog"
  );
  return METHODOLOGY_MODULES.map((x) => x.id);
}

import { fetchStory } from "@/lib/storyblok";

export type FreeResourceForDisplay = {
  id: string;
  title: string;
  description: string;
  downloadUrl?: string;
  downloadFilename?: string;
};

type RawItem = {
  title?: string;
  description?: string;
  file?: { filename?: string };
  download_filename?: string;
  content?: RawItem;
};

function getTitleFromRaw(raw: Record<string, unknown> | null): string {
  if (!raw || typeof raw !== "object") return "";
  const t = (raw["title"] ?? raw["headline"] ?? "") as string;
  return t?.trim() ?? "";
}

function getResourcesFromRaw(raw: Record<string, unknown> | null): RawItem[] {
  if (!raw || typeof raw !== "object") return [];
  const arr =
    raw["resources"] ?? raw["Blocks"] ?? raw["items"] ?? raw["blocks"] ?? raw["resource_list"];
  if (!Array.isArray(arr)) return [];
  return arr as RawItem[];
}

function extractFilenameFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const segment = path.split("/").filter(Boolean).pop();
    return segment ? decodeURIComponent(segment) : "download";
  } catch {
    return "download";
  }
}

export async function getFreeResourcesFromStoryblok(): Promise<{
  title: string;
  resources: FreeResourceForDisplay[];
}> {
  const story = await fetchStory<Record<string, unknown>>("free-resources");
  const raw = story?.content ?? null;
  const pageTitle = getTitleFromRaw(raw) || "Free resources";
  const rawList = getResourcesFromRaw(raw);
  const fromBody = Array.isArray((raw as { body?: unknown[] })?.body)
    ? getResourcesFromRaw((raw as { body: Record<string, unknown>[] }).body[0] ?? null)
    : [];
  const list = rawList.length ? rawList : fromBody;

  const resources = list
    .map((item, index) => {
      const c = item.content;
      const title = (item.title ?? c?.title)?.toString()?.trim();
      if (!title) return undefined;
      const description = (item.description ?? c?.description)?.toString()?.trim() ?? "";
      const file = item.file ?? c?.file;
      const fileUrl =
        typeof file === "object" && file?.filename ? String(file.filename).trim() : "";
      const downloadFilename =
        (item.download_filename ?? c?.download_filename)?.toString()?.trim() ||
        (fileUrl ? extractFilenameFromUrl(fileUrl) : undefined);
      return {
        id: String(index + 1),
        title,
        description,
        ...(fileUrl ? { downloadUrl: fileUrl } : {}),
        ...(downloadFilename ? { downloadFilename } : {}),
      };
    })
    .filter((r) => r != null) as FreeResourceForDisplay[];

  return { title: pageTitle, resources };
}

export type RemoteFileStream = {
  status: "ok";
  body: ReadableStream<Uint8Array>;
  contentType: string;
  contentDisposition: string;
};

export type RemoteFileResult = RemoteFileStream | { status: "not_found" | "no_content" | "error" };

export async function fetchRemoteFileStream(
  url: string,
  filename: string | null,
): Promise<RemoteFileResult> {
  try {
    const res = await fetch(url, { headers: { Accept: "*/*" } });
    if (!res.ok) return { status: "not_found" };
    if (!res.body) return { status: "no_content" };

    const contentType = res.headers.get("content-type") ?? "application/octet-stream";
    const contentDisposition = filename
      ? `attachment; filename="${filename.replace(/"/g, '\\"')}"`
      : (res.headers.get("content-disposition") ?? "attachment");

    return { status: "ok", body: res.body, contentType, contentDisposition };
  } catch {
    return { status: "error" };
  }
}

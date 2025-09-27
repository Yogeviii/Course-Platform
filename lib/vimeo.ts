// lib/vimeo.ts
export async function fetchVimeoMeta(input: string) {
  // input can be a full URL or just the numeric id
  const id = /^\d+$/.test(input) ? input : input.replace(/\D+/g, "");
  const url = `https://vimeo.com/${id}`;
  const oembed = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;
  const res = await fetch(oembed, { next: { revalidate: 60 * 60 } }); // cache 1h
  if (!res.ok) throw new Error("Failed Vimeo oEmbed");
  const data = await res.json() as { duration?: number; thumbnail_url?: string };
  return {
    durationSec: typeof data.duration === "number" ? data.duration : undefined,
    thumbnailUrl: data.thumbnail_url || undefined,
  };
}

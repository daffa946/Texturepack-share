import { list } from '@vercel/blob';

// Returns { packs, error } so the page can show a visible message instead of staying blank.
export async function getPacks() {
  try {
    const { blobs } = await list({ prefix: 'packs/' });
    const packs = (await Promise.all(
      blobs.map((b) => fetch(b.url, { cache: 'no-store' }).then((r) => r.json()).catch(() => null))
    )).filter(Boolean).sort((a, b) => b.createdAt - a.createdAt);
    return { packs, error: null };
  } catch (e) {
    return { packs: [], error: e.message };
  }
}

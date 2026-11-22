import { list } from '@vercel/blob';
import DeleteButton from './DeleteButton';

export const dynamic = 'force-dynamic';

async function getPacks() {
  try {
    const { blobs } = await list({ prefix: 'packs/' });
    const packs = await Promise.all(
      blobs.map((b) => fetch(b.url, { cache: 'no-store' }).then((r) => r.json()).catch(() => null))
    );
    return packs.filter(Boolean).sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export default async function Home() {
  const packs = await getPacks();
  return (
    <>
      <h1>Texture packs</h1>
      <p className="sub">Pick a pack, download the .zip, drop it in your resourcepacks folder.</p>
      {packs.length === 0 ? (
        <div className="empty">No packs yet. Use “Add a pack” to share your first one.</div>
      ) : (
        <div className="grid">
          {packs.map((p) => (
            <article className="card" key={p.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="icon" src={p.iconUrl} alt={`${p.name} icon`} />
              <div>
                <h2>{p.name}</h2>
                <div className="meta">
                  {[p.resolution, p.version && `Minecraft ${p.version}`, p.author && `by ${p.author}`].filter(Boolean).join(' · ')}
                </div>
                {p.description && <p>{p.description}</p>}
                <a className="btn" href={p.downloadUrl} rel="noopener">Download</a>
                {p.viewUrl && <a className="btn ghost" href={p.viewUrl} target="_blank" rel="noopener noreferrer">Drive page</a>}
                <DeleteButton id={p.id} />
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

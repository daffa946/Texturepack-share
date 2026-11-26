import { getPacks } from './lib/packs';

export const dynamic = 'force-dynamic';
const TYPES = { resources: 'Resource pack', data: 'Behavior pack' };

export default async function Home() {
  const { packs, error } = await getPacks();
  return (
    <>
      <h1>Minecraft packs</h1>
      <p className="sub">Download the .mcpack, then open it. Minecraft imports it automatically.</p>
      {error && <div className="errbox">Could not load packs: {error}</div>}
      {!error && packs.length === 0 && <div className="empty">No packs yet.</div>}
      {packs.length > 0 && (
        <div className="grid">
          {packs.map((p) => (
            <article className="card" key={p.id}>
              {p.iconDataUrl || p.iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="icon" src={p.iconDataUrl || p.iconUrl} alt={`${p.name} icon`} />
              ) : (
                <div className="icon" aria-hidden="true" />
              )}
              <div>
                <h2>{p.name}</h2>
                <div className="meta">
                  {[p.author && `by ${p.author}`, p.version && `v${p.version}`, TYPES[p.packType], p.minEngine && `MC ${p.minEngine}+`].filter(Boolean).join(' · ')}
                </div>
                {p.description && <p>{p.description}</p>}
                <a className="btn" href={p.downloadUrl} rel="noopener">Download</a>
                {p.viewUrl && <a className="btn ghost" href={p.viewUrl} target="_blank" rel="noopener noreferrer">Drive page</a>}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

'use client';
import { useState } from 'react';

const TEAMS = ['#ff5555', '#5577ff', '#55dd55', '#ffdd33', '#44dddd', '#f0f0f0', '#ff77cc', '#9aa0a6'];
const TYPES = { resources: 'TEXTURE PACK', data: 'BEHAVIOR PACK' };

export default function Gallery({ packs }) {
  const [q, setQ] = useState('');
  const list = packs.filter((p) => `${p.name} ${p.author || ''} ${p.description || ''}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <label className="search">
        <small>Search packs</small>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or author…" />
      </label>
      {list.length === 0 ? (
        <div className="empty">{packs.length === 0 ? 'No packs yet.' : 'No pack matches your search.'}</div>
      ) : (
        <div className="grid">
          {list.map((p, i) => (
            <article className="card" key={p.id} style={{ '--team': TEAMS[i % TEAMS.length] }}>
              {p.iconDataUrl || p.iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="icon" src={p.iconDataUrl || p.iconUrl} alt={`${p.name} icon`} />
              ) : (
                <div className="icon" aria-hidden="true" />
              )}
              <div>
                {TYPES[p.packType] && <span className="tag">{TYPES[p.packType]}</span>}
                <h2>{p.name}</h2>
                <div className="meta">
                  {[p.author && `by ${p.author}`, p.version && `v${p.version}`, p.minEngine && `MC ${p.minEngine}+`].filter(Boolean).join(' · ')}
                </div>
                {p.description && <p>{p.description}</p>}
                <a className="btn" href={p.downloadUrl} rel="noopener">DOWNLOAD</a>
                {p.viewUrl && <a className="btn ghost" href={p.viewUrl} target="_blank" rel="noopener noreferrer">Drive page</a>}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

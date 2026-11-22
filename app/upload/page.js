'use client';
import { useState } from 'react';
import { upload } from '@vercel/blob/client';

const safe = (n) => n.replace(/[^\w.\-]+/g, '_');

export default function AddPack() {
  const [source, setSource] = useState('drive');
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const password = f.get('password');
    const icon = f.get('icon');
    const file = f.get('file');
    setBusy(true); setStatus(null); setProgress(0);
    try {
      if (!icon?.size) throw new Error('Choose an icon image');
      const iconBlob = await upload(`icons/${Date.now()}-${safe(icon.name)}`, icon, {
        access: 'public', handleUploadUrl: '/api/upload', clientPayload: password,
      });
      let fileUrl = null;
      if (source === 'upload') {
        if (!file?.size) throw new Error('Choose a .zip file');
        const fb = await upload(`files/${Date.now()}-${safe(file.name)}`, file, {
          access: 'public', handleUploadUrl: '/api/upload', clientPayload: password,
          onUploadProgress: (p) => setProgress(p.percentage),
        });
        fileUrl = fb.url;
      }
      const res = await fetch('/api/packs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password, source, fileUrl, iconUrl: iconBlob.url,
          driveLink: f.get('driveLink'), name: f.get('name'), author: f.get('author'),
          version: f.get('version'), resolution: f.get('resolution'), description: f.get('description'),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus({ ok: true, text: 'Pack published. It is now on the home page.' });
      e.currentTarget.reset();
    } catch (err) {
      setStatus({ ok: false, text: err.message });
    } finally { setBusy(false); }
  }

  return (
    <>
      <h1>Add a pack</h1>
      <p className="sub">Only people with the admin password can publish.</p>
      <form onSubmit={onSubmit}>
        <label>Admin password<input name="password" type="password" required /></label>
        <label>Pack name<input name="name" required maxLength={60} /></label>
        <label>Icon <small>Square PNG, 128×128 works best (the pack.png from your pack)</small>
          <input name="icon" type="file" accept="image/png,image/jpeg,image/webp" required />
        </label>

        <div className="tabs" role="group" aria-label="Where is the file?">
          <button type="button" aria-pressed={source === 'drive'} onClick={() => setSource('drive')}>Google Drive link</button>
          <button type="button" aria-pressed={source === 'upload'} onClick={() => setSource('upload')}>Upload here</button>
        </div>
        {source === 'drive' ? (
          <label>Drive share link <small>Set sharing to “Anyone with the link” first</small>
            <input name="driveLink" type="url" placeholder="https://drive.google.com/file/d/…/view" required />
          </label>
        ) : (
          <label>Texture pack .zip <small>Up to 500 MB</small>
            <input name="file" type="file" accept=".zip,application/zip" required />
          </label>
        )}

        <label>Author<input name="author" maxLength={40} /></label>
        <label>Minecraft version<input name="version" placeholder="1.21" maxLength={20} /></label>
        <label>Resolution
          <select name="resolution" defaultValue="">
            <option value="">Not set</option>
            {['16x', '32x', '64x', '128x', '256x', '512x+'].map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>
        <label>Description<textarea name="description" rows={3} maxLength={300} /></label>

        {busy && source === 'upload' && <div className="bar2"><i style={{ width: `${progress}%` }} /></div>}
        {status && <div className={`msg ${status.ok ? 'ok' : 'err'}`} role="status">{status.text}</div>}
        <button className="btn" disabled={busy}>{busy ? 'Publishing…' : 'Publish pack'}</button>
      </form>
    </>
  );
}

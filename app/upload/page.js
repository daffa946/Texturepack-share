'use client';
import { useEffect, useState } from 'react';
import { upload } from '@vercel/blob/client';
import { readPack } from '../lib/readPack';

const safe = (n) => n.replace(/[^\w.\-]+/g, '_');
// Shrinks any icon (even a 400 KB one) to a 128x128 square so it stays tiny.
async function shrinkIcon(blob) {
  const bmp = await createImageBitmap(blob);
  const side = Math.min(bmp.width, bmp.height), S = 128;
  const c = document.createElement('canvas'); c.width = S; c.height = S;
  const x = c.getContext('2d'); x.imageSmoothingQuality = 'high';
  x.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, S, S);
  let url = c.toDataURL('image/png');
  if (url.length > 150000) url = c.toDataURL('image/jpeg', 0.85);
  return url;
}

export default function Admin() {
  const [password, setPassword] = useState('');
  const [packFile, setPackFile] = useState(null);
  const [meta, setMeta] = useState(null);
  const [icon, setIcon] = useState(null); // data URL
  const [source, setSource] = useState('drive');
  const [driveLink, setDriveLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null);
  const [packs, setPacks] = useState([]);

  const loadPacks = () => fetch('/api/packs').then((r) => r.json()).then(setPacks).catch(() => {});
  useEffect(() => { loadPacks(); }, []);
  const edit = (k) => (e) => setMeta({ ...meta, [k]: e.target.value });

  async function onPick(e) {
    const file = e.target.files[0];
    setStatus(null); setMeta(null); setIcon(null); setPackFile(file || null);
    if (!file) return;
    try {
      const { meta, iconFile } = await readPack(file);
      setMeta(meta);
      if (iconFile) setIcon(await shrinkIcon(iconFile));
    } catch (err) { setStatus({ ok: false, text: err.message }); }
  }

  async function publish(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true); setStatus(null); setProgress(0);
    try {
      let fileUrl = null, fileBlobUrl = null;
      if (source === 'upload') {
        const fb = await upload(`files/${safe(packFile.name)}`, packFile, {
          access: 'public', handleUploadUrl: '/api/upload', clientPayload: password,
          contentType: 'application/octet-stream', onUploadProgress: (p) => setProgress(p.percentage),
        });
        fileUrl = fb.downloadUrl || fb.url; fileBlobUrl = fb.url;
      }
      const res = await fetch('/api/packs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...meta, password, source, driveLink, fileUrl, fileBlobUrl, iconDataUrl: icon }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus({ ok: true, text: `Published “${meta.name}”.` });
      setPackFile(null); setMeta(null); setIcon(null); setDriveLink(''); form.reset(); loadPacks();
    } catch (err) { setStatus({ ok: false, text: err.message }); }
    finally { setBusy(false); }
  }

  async function remove(p) {
    if (!password) return setStatus({ ok: false, text: 'Type the admin password first.' });
    if (!confirm(`Delete “${p.name}”?`)) return;
    const res = await fetch('/api/packs', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, password }),
    });
    if (res.ok) loadPacks(); else setStatus({ ok: false, text: (await res.json()).error });
  }

  return (
    <>
      <h1>Publish a pack</h1>
      <p className="sub">Choose a .mcpack and the icon, name and author are read from inside it.</p>
      <form onSubmit={publish}>
        <label>Admin password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        <label>Pack file (.mcpack or .zip)<input type="file" accept=".mcpack,.zip" onChange={onPick} required /></label>
        {meta && (
          <>
            <div className="preview">
              {icon
                // eslint-disable-next-line @next/next/no-img-element
                ? <img className="icon" src={icon} alt="Icon found in the pack" />
                : <div className="icon" aria-hidden="true" />}
              <small>{icon ? 'Icon taken from pack_icon.png' : 'No icon found in this pack.'}</small>
            </div>
            <label>Name<input value={meta.name} onChange={edit('name')} required /></label>
            <label>Author <small>From manifest.json. Fix it if empty.</small><input value={meta.author} onChange={edit('author')} /></label>
            <label>Version<input value={meta.version} onChange={edit('version')} /></label>
            <label>Description<textarea rows={3} maxLength={300} value={meta.description} onChange={edit('description')} /></label>
            <div className="tabs" role="group" aria-label="Where is the file hosted?">
              <button type="button" aria-pressed={source === 'drive'} onClick={() => setSource('drive')}>Google Drive link</button>
              <button type="button" aria-pressed={source === 'upload'} onClick={() => setSource('upload')}>Auto upload</button>
            </div>
            {source === 'drive' ? (
              <label>Drive share link <small>Share the same file as “Anyone with the link”.</small>
                <input type="url" value={driveLink} onChange={(e) => setDriveLink(e.target.value)} placeholder="https://drive.google.com/file/d/…/view" required />
              </label>
            ) : (
              <>
                <small>The file you picked is uploaded automatically when you press Publish (needs the Blob store).</small>
                {busy && <div className="bar2"><i style={{ width: `${progress}%` }} /></div>}
              </>
            )}
          </>
        )}
        {status && <div className={`msg ${status.ok ? 'ok' : 'err'}`} role="status">{status.text}</div>}
        <button className="btn" disabled={busy || !meta}>{busy ? 'Publishing…' : 'Publish pack'}</button>
      </form>

      <h1 style={{ marginTop: 48, fontSize: '1.4rem' }}>Published packs</h1>
      {packs.length === 0 ? <p className="sub">Nothing yet.</p> : (
        <ul className="plist">
          {packs.map((p) => (
            <li key={p.id}><span>{p.name}{p.author ? ` · ${p.author}` : ''}</span>
              <button type="button" className="btn ghost" onClick={() => remove(p)}>Delete</button></li>
          ))}
        </ul>
      )}
    </>
  );
}

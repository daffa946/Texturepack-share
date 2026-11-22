import { put, list, del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { driveInfo } from '../../lib/drive';

const bad = (error, status = 400) => NextResponse.json({ error }, { status });

export async function POST(request) {
  const b = await request.json();
  if (b.password !== process.env.ADMIN_PASSWORD) return bad('Wrong admin password', 401);
  if (!b.name?.trim()) return bad('Pack name is required');
  if (!b.iconUrl) return bad('Upload an icon');

  let downloadUrl = b.fileUrl, viewUrl = null;
  if (b.source === 'drive') {
    const d = driveInfo(b.driveLink || '');
    if (!d) return bad('That does not look like a Google Drive file link');
    downloadUrl = d.download; viewUrl = d.view;
  }
  if (!downloadUrl) return bad('Add a file or a Drive link');

  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const pack = {
    id, createdAt: Date.now(),
    name: b.name.trim().slice(0, 60),
    author: (b.author || '').trim().slice(0, 40),
    version: (b.version || '').trim().slice(0, 20),
    resolution: b.resolution || '',
    description: (b.description || '').trim().slice(0, 300),
    iconUrl: b.iconUrl, downloadUrl, viewUrl,
    fileBlobUrl: b.source === 'upload' ? b.fileUrl : null,
  };
  await put(`packs/${id}.json`, JSON.stringify(pack), {
    access: 'public', addRandomSuffix: false, contentType: 'application/json',
  });
  return NextResponse.json({ ok: true, id });
}

export async function DELETE(request) {
  const { id, password } = await request.json();
  if (password !== process.env.ADMIN_PASSWORD) return bad('Wrong admin password', 401);
  const { blobs } = await list({ prefix: `packs/${id}.json` });
  for (const blob of blobs) {
    const pack = await fetch(blob.url, { cache: 'no-store' }).then((r) => r.json()).catch(() => ({}));
    await del([blob.url, pack.iconUrl, pack.fileBlobUrl].filter(Boolean));
  }
  return NextResponse.json({ ok: true });
}

import { put, list, del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { driveInfo } from '../../lib/drive';
import { getPacks } from '../../lib/packs';

export const dynamic = 'force-dynamic';
const bad = (error, status = 400) => NextResponse.json({ error }, { status });
const clip = (v, n) => String(v || '').trim().slice(0, n);

export async function GET() {
  return NextResponse.json((await getPacks()).packs);
}

export async function POST(request) {
  const b = await request.json();
  if (!process.env.ADMIN_PASSWORD) return bad('ADMIN_PASSWORD is not set in Vercel', 500);
  if (b.password !== process.env.ADMIN_PASSWORD) return bad('Wrong admin password', 401);
  if (!b.name?.trim()) return bad('Pack name is required');

  let downloadUrl = b.fileUrl, viewUrl = null;
  if (b.source === 'drive') {
    const d = driveInfo(b.driveLink || '');
    if (!d) return bad('That does not look like a Google Drive file link');
    downloadUrl = d.download; viewUrl = d.view;
  }
  if (!downloadUrl) return bad('No file to link to');
  const icon = typeof b.iconDataUrl === 'string' && b.iconDataUrl.startsWith('data:image/') && b.iconDataUrl.length < 200000 ? b.iconDataUrl : null;

  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const pack = {
    id, createdAt: Date.now(),
    name: clip(b.name, 80), author: clip(b.author, 80), version: clip(b.version, 20),
    description: clip(b.description, 300), packType: clip(b.packType, 12), minEngine: clip(b.minEngine, 20),
    iconDataUrl: icon, downloadUrl, viewUrl,
    fileBlobUrl: b.source === 'upload' ? b.fileBlobUrl : null,
  };
  try {
    await put(`packs/${id}.json`, JSON.stringify(pack), { access: 'public', addRandomSuffix: false, contentType: 'application/json' });
  } catch (e) {
    return bad('Blob storage error: ' + e.message + ' (the Blob store must be Public and connected to this project)', 500);
  }
  return NextResponse.json({ ok: true, id });
}

export async function DELETE(request) {
  const { id, password } = await request.json();
  if (password !== process.env.ADMIN_PASSWORD) return bad('Wrong admin password', 401);
  const { blobs } = await list({ prefix: `packs/${id}.json` });
  for (const blob of blobs) {
    const pack = await fetch(blob.url, { cache: 'no-store' }).then((r) => r.json()).catch(() => ({}));
    await del([blob.url, pack.fileBlobUrl].filter(Boolean));
  }
  return NextResponse.json({ ok: true });
}

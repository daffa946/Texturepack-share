import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

// Issues upload tokens so the browser can upload big files straight to Vercel Blob.
export async function POST(request) {
  const body = await request.json();
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (clientPayload !== process.env.ADMIN_PASSWORD) throw new Error('Wrong admin password');
        return {
          allowedContentTypes: ['application/zip', 'application/x-zip-compressed', 'application/octet-stream', 'image/png', 'image/jpeg', 'image/webp'],
          maximumSizeInBytes: 500 * 1024 * 1024,
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

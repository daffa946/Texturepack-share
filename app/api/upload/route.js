import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!process.env.ADMIN_PASSWORD) throw new Error('ADMIN_PASSWORD is not set on the server');
        if (clientPayload !== process.env.ADMIN_PASSWORD) throw new Error('Wrong admin password');
        return {
          allowedContentTypes: ['application/octet-stream', 'application/zip', 'application/x-zip-compressed', 'image/png', 'image/jpeg'],
          maximumSizeInBytes: 500 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

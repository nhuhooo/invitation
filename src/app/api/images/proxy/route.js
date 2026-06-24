import { get } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    console.log(`DEBUG proxy: Fetching private blob from URL via SDK get(): ${imageUrl}`);
    
    // Using `@vercel/blob` SDK's get() method, which automatically resolves
    // credentials including OIDC (VERCEL_OIDC_TOKEN) when running on Vercel.
    const blob = await get(imageUrl, { access: 'private' });

    if (!blob) {
      console.error(`DEBUG proxy: Failed to fetch blob from storage: empty result`);
      return new NextResponse('Failed to fetch from storage: empty result', { status: 500 });
    }

    return new NextResponse(blob.stream, {
      headers: {
        'Content-Type': blob.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error("DEBUG proxy: Error proxying image via SDK get():", error);
    return new NextResponse(`Internal Server Error: ${error.message}\n${error.stack}`, { status: 500 });
  }
}

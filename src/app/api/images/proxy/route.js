import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error("DEBUG proxy: BLOB_READ_WRITE_TOKEN is missing in environment variables");
      return new NextResponse('Internal configuration error: Missing token', { status: 500 });
    }

    console.log(`DEBUG proxy: Fetching private blob from URL: ${imageUrl}`);
    const response = await fetch(imageUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error(`DEBUG proxy: Failed to fetch from storage: ${response.status} ${response.statusText}`);
      return new NextResponse(`Failed to fetch from storage: ${response.statusText}`, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const body = response.body;

    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error("DEBUG proxy: Error proxying image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

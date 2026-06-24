import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    let token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      // Find any environment variable key starting with BLOB_READ_WRITE_TOKEN (handles store-specific suffixes)
      const envKey = Object.keys(process.env).find(key => key.startsWith('BLOB_READ_WRITE_TOKEN'));
      if (envKey) {
        token = process.env[envKey];
        console.log(`DEBUG proxy: Found token in environment key: ${envKey}`);
      }
    }

    if (!token) {
      console.error("DEBUG proxy: BLOB_READ_WRITE_TOKEN is missing in environment variables. Available env keys:", Object.keys(process.env));
      return new NextResponse('Internal configuration error: Missing BLOB_READ_WRITE_TOKEN', { status: 500 });
    }

    console.log(`DEBUG proxy: Fetching private blob from URL: ${imageUrl}`);
    const response = await fetch(imageUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No body');
      console.error(`DEBUG proxy: Failed to fetch from storage: ${response.status} ${response.statusText} - Details: ${errorText}`);
      return new NextResponse(`Failed to fetch from storage: ${response.status} ${response.statusText} - Details: ${errorText}`, { status: 500 });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Read response as array buffer and convert to Buffer to avoid streaming compatibility issues
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error("DEBUG proxy: Error proxying image:", error);
    return new NextResponse(`Internal Server Error: ${error.message}\n${error.stack}`, { status: 500 });
  }
}

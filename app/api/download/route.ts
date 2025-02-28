import { NextRequest } from 'next/server';
import ytdl from 'ytdl-core';
import { PassThrough } from 'stream';
const fs = require('fs');

export async function POST(req: NextRequest) {
  try {
    const { url, format_id } = await req.json();

    if (!url || !format_id) {
      return new Response(JSON.stringify({ error: 'URL and format_id are required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!ytdl.validateURL(url)) {
      return new Response(JSON.stringify({ error: 'Invalid YouTube URL' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const videoReadableStream = ytdl(url, { format: format_id });
    const passThrough = new PassThrough();

    videoReadableStream.pipe(passThrough);

    return new Response(passThrough, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'attachment; filename="video.mp4"'
      }
    });

  } catch (error) {
    console.error('Error in download handler:', error);
    return new Response(JSON.stringify({ error: 'Failed to process video' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Default return statement to handle unexpected cases
  return new Response(JSON.stringify({ error: 'Unexpected error occurred' }), { 
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  });
}
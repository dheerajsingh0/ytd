import ytdl from 'ytdl-core';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (!ytdl.validateURL(url)) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    const videoData = await ytdl.getBasicInfo(url);
    const formatsData= await videoData.player_response.streamingData.adaptiveFormats;

    console.log("hello",videoData.player_response.streamingData);
    const formats = formatsData.map(format => {
        if (format.qualityLabel) {
            return {
                format_id: format.itag,
                qualityLabel: format.qualityLabel,
                mimeType: format.mimeType,
                itag: format.itag,
                // container: format.url,
            };
        }
        return null;
    }).filter(Boolean);
    
    const thumbnails=  videoData.player_response.videoDetails.thumbnail.thumbnails;
    const videoInfo = {
        title: videoData.player_response.videoDetails.title,
        author: videoData.player_response.videoDetails.author,
        thumbnail:thumbnails[thumbnails.length-1].url,
        formats: formats
    }

 
    return NextResponse.json({
        videoInfo,
    });
  } catch (error) {
    console.error('Error fetching video info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video information' }, 
      { status: 500 }
    );
  }
}

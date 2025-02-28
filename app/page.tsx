// File: app/page.tsx
'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('https://www.youtube.com/watch?v=EJr3uAQwGek&pp=ygUQOGsgc2hvcnRzIHZpZGVvcw%3D%3D');
  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!url || !url.includes('youtube.com/') && !url.includes('youtu.be/')) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/video-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch video information');
      }

      const data = await response.json();
      setVideoInfo(data.videoInfo);
      console.log("info", data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };



  const handleDownload = async (id,videoType) => {
    try {
      const response = await fetch(
        `/api/download`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: url,
              format_id: id // Replace with your desired format
            })
          
        }
    );

  
      if (!response.ok) {
        throw new Error("Failed to initiate download");
      }
  
      const blob = await response.blob();
    const fileType = videoType;
    const downloadUrl = window.URL.createObjectURL(blob);

    // Create an invisible download link and trigger it
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `video.${fileType}`;
    document.body.appendChild(a);
    a.click();

    // Clean up
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-4xl mx-auto p-4">
        <div className="text-center my-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">YouTube Video Downloader</h1>
          <p className="text-gray-600">Paste a YouTube URL to download videos in different formats</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter YouTube video URL"
                className="flex-1 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded transition duration-200 disabled:opacity-70"
              >
                {loading ? 'Processing...' : 'Get Download Links'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        {videoInfo && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <img
                  src={videoInfo.thumbnail}
                  alt={videoInfo.title}
                  className="w-full rounded"
                />
              </div>
              <div className="w-full">
                <h2 className="text-xl font-semibold mb-2">{videoInfo.title}</h2>
                <p className="text-gray-600 mb-4">{videoInfo.author}</p>

                <h3 className="font-medium text-gray-800 mb-2">Available formats:</h3>
                <div className="space-y-3 h-[30%] overflow-y-scroll w-full">
                  {videoInfo?.formats && videoInfo?.formats.map((format) => (
                    <button
                      key={format.itag}
                      // href={`http://localhost:8000/download?url=${url}&format_id=${format.itag}`}
                      className="flex justify-between items-center w-1/2 p-3 ml-8 border border-gray-200 rounded hover:bg-gray-50"
                      onClick={() => handleDownload(format.itag,format.mimeType.split(";")[0].split("/")[1])}
                    >
                      <span className="font-medium w-full whitespace-nowrap">
                        {format.qualityLabel || format.quality} {format.mimeType && `${format.mimeType.split(";")[0].split("/")[1]}`}
                      </span>
                      <span className="bg-green-600 text-white text-sm py-1 px-3 rounded ml-8 cursor-pointer">
                        Download
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
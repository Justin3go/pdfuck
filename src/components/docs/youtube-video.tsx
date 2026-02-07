'use client';

interface YoutubeVideoProps {
  url: string;
  width?: number;
  height?: number;
}

export function YoutubeVideo({
  url,
  width = 560,
  height = 315,
}: YoutubeVideoProps) {
  return (
    <div className="my-4 aspect-video">
      <iframe
        width={width}
        height={height}
        src={url}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="w-full h-full rounded-lg"
      ></iframe>
    </div>
  );
}

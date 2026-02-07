'use client';

interface XEmbedClientProps {
  url: string;
  width?: number;
}

export function XEmbedClient({ url, width = 500 }: XEmbedClientProps) {
  return (
    <div className="my-4">
      <blockquote
        className="twitter-tweet"
        data-conversation="none"
        data-width={width}
      >
        <a href={url}>{url}</a>
      </blockquote>
      <script
        async
        src="https://platform.twitter.com/widgets.js"
        charSet="utf-8"
      ></script>
    </div>
  );
}

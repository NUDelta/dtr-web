'use client';

import ReactPlayer from 'react-player/youtube';

interface ProjectVideoProps {
  title: string;
  url: string | null;
}

export default function ProjectVideo({ title, url }: ProjectVideoProps) {
  if (url === null) {
    return null;
  }

  return (
    <div className="mb-8 w-full">
      <h2 className="mb-2 border-b border-black pb-2 text-2xl font-bold">{title}</h2>
      <div className="player-wrapper">
        <ReactPlayer url={url} className="react-player" width="100%" height="100%" controls />
      </div>
    </div>
  );
}

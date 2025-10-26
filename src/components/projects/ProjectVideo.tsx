'use client'

import { PlayCircle } from 'lucide-react'
import ReactPlayer from 'react-player'

interface ProjectVideoProps {
  title: string
  url: string
}

const ProjectVideo = ({ title, url }: ProjectVideoProps) => {
  return (
    <section
      aria-labelledby={`video-${title.replace(/\s+/g, '-').toLowerCase()}`}
      className="mb-10 w-full"
    >
      <h2
        id={`video-${title.replace(/\s+/g, '-').toLowerCase()}`}
        className="mb-2 text-2xl font-bold"
      >
        <span className="inline-flex items-center gap-2">
          <PlayCircle size={20} className="text-yellow-700" aria-hidden="true" />
          {title}
        </span>
      </h2>
      <div className="mb-3 h-1 w-10 rounded-full bg-yellow-300" aria-hidden="true" />

      {/* Responsive 16:9 container */}
      <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-black">
        <div className="aspect-video">
          <ReactPlayer
            src={url}
            width="100%"
            height="100%"
            controls
          />
        </div>
      </div>
    </section>
  )
}

export default ProjectVideo

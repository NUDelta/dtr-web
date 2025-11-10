import { getImageSources } from '@/utils/get-image-sources'
import sections from './sections'

export default function HowWeWorkList() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {sections.map((section, i) => (
        <div key={section.title}>
          {/* Section Title */}
          <h2 className="mb-4 border-b border-black text-2xl font-semibold">{section.title}</h2>

          {/* Subsections */}
          <div className="space-y-4">
            {section.subsections.map((subsection) => {
              const imageSources = subsection.imagePath !== null
                ? getImageSources(subsection.imagePath)
                : null

              return (
                <div
                  key={subsection.title}
                  className={`flex flex-col gap-4 ${
                    i % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'
                  }`}
                >
                  {/* Image (if available) */}
                  {imageSources !== null && (
                    <div className="w-full md:w-1/3">
                      <picture>
                        <source srcSet={imageSources.avif} type="image/avif" />
                        <source srcSet={imageSources.webp} type="image/webp" />
                        <img
                          src={imageSources.fallback}
                          alt={subsection.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-auto"
                        />
                      </picture>
                    </div>
                  )}

                  {/* Text Content */}
                  <div className="prose w-full md:w-2/3">
                    <h3 className="m-0">{subsection.title}</h3>
                    {subsection.description}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ),
      )}
    </div>
  )
}

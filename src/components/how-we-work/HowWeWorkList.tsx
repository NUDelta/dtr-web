import Image from 'next/image';
import sections from './sections';

export default function HowWeWorkList() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {sections.map((section, i) => (
        <div key={section.title}>
          {/* Section Title */}
          <h2 className="mb-4 border-b border-black text-2xl font-semibold">{section.title}</h2>

          {/* Subsections */}
          <div className="space-y-4">
            {section.subsections.map(subsection => (
              <div
                key={subsection.title}
                className={`flex flex-col gap-4 ${
                  i % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'
                }`}
              >
                {/* Image (if available) */}
                {subsection.imagePath && (
                  <div className="w-full md:w-1/3">
                    <Image src={subsection.imagePath} alt={subsection.title} className="w-full h-auto" />
                  </div>
                )}

                {/* Text Content */}
                <div className="prose w-full md:w-2/3">
                  <h3 className="m-0">{subsection.title}</h3>
                  {subsection.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

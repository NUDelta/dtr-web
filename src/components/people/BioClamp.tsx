import { MarkdownContents } from '@/components/shared'

interface BioClampProps {
  text: string
  lines?: number
}

const BioClamp = ({ text, lines = 4 }: BioClampProps) => {
  if (!lines) {
    return (
      <div className="prose max-w-none text-sm">
        <MarkdownContents content={text} />
      </div>
    )
  }

  return (
    <div
      className="prose max-w-none text-sm"
      style={{
        display: '-webkit-box',
        WebkitLineClamp: lines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}
    >
      <MarkdownContents content={text} />
    </div>
  )
}

export default BioClamp

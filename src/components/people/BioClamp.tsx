import ReactMarkdown from 'react-markdown'

interface BioClampProps {
  text: string
  lines?: number
}

const BioClamp = ({ text, lines = 4 }: BioClampProps) => {
  if (!lines) {
    return (
      <div className="prose max-w-none text-sm">
        <ReactMarkdown>{text}</ReactMarkdown>
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
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  )
}

export default BioClamp

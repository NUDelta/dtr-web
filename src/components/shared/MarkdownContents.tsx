import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

interface MarkdownContentsProps {
  content: string | null | undefined
}

const MarkdownContents = ({
  content,
}: MarkdownContentsProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
    >
      {content}
    </ReactMarkdown>
  )
}

export default MarkdownContents

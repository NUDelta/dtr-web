import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { cn } from '@/utils'
import { markdownComponents } from './markdownComponents'

interface MarkdownContentsProps {
  content: string | null | undefined
  className?: string
  props?: React.HTMLAttributes<HTMLElement>
}

const MarkdownContents = ({
  content,
  className,
  ...props
}: MarkdownContentsProps) => {
  return (
    <article
      className={cn(
        'mx-auto max-w-4xl',
        'text-base text-slate-800',
        'leading-relaxed',
        'px-4 lg:px-0', // small horizontal padding on mobile
        className,
      )}
      {...props}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}

export default MarkdownContents

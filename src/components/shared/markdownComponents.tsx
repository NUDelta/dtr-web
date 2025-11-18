import type { Components as MarkdownComponents } from 'react-markdown'
import { cn } from '@/utils'

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement>
type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>
type UlProps = React.HTMLAttributes<HTMLUListElement>
type OlProps = React.HTMLAttributes<HTMLOListElement>
type LiProps = React.LiHTMLAttributes<HTMLLIElement>
type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement>
type ImgProps = React.ImgHTMLAttributes<HTMLImageElement>
type StrongProps = React.HTMLAttributes<HTMLElement>

export const markdownComponents: Partial<MarkdownComponents> = {
  // Link styling: gray text with soft yellow background highlight
  a: ({ className, ...props }: AnchorProps) => {
    const isUnstyled = className?.includes('unstyled-link')

    return (
      <a
        className={cn(
          // Skip default link styling when "unstyled-link" is present
          !isUnstyled
          && [
            'text-gray-700 font-normal',
            'bg-[#fff9bc] hover:bg-dark-yellow',
            'no-underline transition-colors duration-150 ease-in-out',
            'px-[0.15em]',
          ].join(' '),
          className,
        )}
        {...props}
      />
    )
  },

  // Paragraphs
  p: ({ className, ...props }: ParagraphProps) => (
    <p
      className={cn(
        'my-4 leading-relaxed',
        className,
      )}
      {...props}
    />
  ),

  // Bolded
  strong: ({ className, ...props }: StrongProps) => (
    <strong
      className={cn(
        'font-semibold',
        className,
      )}
      {...props}
    />
  ),

  // h1 (optional, for top-level titles)
  h1: ({ className, ...props }: HeadingProps) => (
    <h1
      className={cn(
        'mt-6 mb-4',
        'text-3xl lg:text-4xl font-semibold tracking-tight',
        'scroll-m-24',
        className,
      )}
      {...props}
    />
  ),

  // h2 — matches old `.prose h2` styles
  h2: ({ className, ...props }: HeadingProps) => (
    <h2
      className={cn(
        // border-bottom: 1px solid black; padding-bottom: 0.5rem;
        'border-b border-black pb-2',
        // margin-bottom: 1rem; (add top margin for separation)
        'mt-10 mb-4',
        // font-weight: 600;
        'font-semibold',
        'scroll-m-24 text-2xl lg:text-3xl',
        className,
      )}
      {...props}
    />
  ),

  // h3 for sub-sections
  h3: ({ className, ...props }: HeadingProps) => (
    <h3
      className={cn(
        'mt-8 mb-3',
        'text-xl lg:text-2xl font-semibold',
        'scroll-m-24',
        className,
      )}
      {...props}
    />
  ),

  // Unordered list (equivalent to `.prose ul`)
  ul: ({ className, ...props }: UlProps) => (
    <ul
      className={cn(
        'my-4 ml-6 list-disc space-y-1',
        className,
      )}
      {...props}
    />
  ),

  // Ordered list (equivalent to `.prose ol`)
  ol: ({ className, ...props }: OlProps) => (
    <ol
      className={cn(
        'my-4 ml-6 list-decimal space-y-1',
        className,
      )}
      {...props}
    />
  ),

  // List item
  li: ({ className, ...props }: LiProps) => (
    <li
      className={cn(
        'leading-relaxed',
        className,
      )}
      {...props}
    />
  ),

  // Images inside MDX
  img: ({ className, ...props }: ImgProps) => (
    // eslint-disable-next-line next/no-img-element
    <img
      className={cn(
        'my-4 rounded-lg',
        className,
      )}
      {...props}
    />
  ),
}

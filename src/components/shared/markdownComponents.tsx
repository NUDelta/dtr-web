import type { Components as MarkdownComponents } from 'react-markdown'
import { cn } from '@/utils'

export const markdownComponents: Partial<MarkdownComponents> = {
  // Link styling: gray text with soft yellow background highlight
  a: ({ className, ...props }) => {
    return (
      <a
        className={cn(
          'text-gray-700 font-normal',
          'bg-[#fff9bc] hover:bg-dark-yellow',
          'no-underline transition-colors duration-150 ease-in-out',
          'px-[0.15em]',
          className,
        )}
        {...props}
      />
    )
  },

  // Paragraphs
  p: ({ className, ...props }) => (
    <p
      className={cn(
        'my-4 leading-relaxed',
        className,
      )}
      {...props}
    />
  ),

  // Bolded
  strong: ({ className, ...props }) => (
    <strong
      className={cn(
        'font-semibold',
        className,
      )}
      {...props}
    />
  ),

  // Emphasis / italics
  em: ({ className, ...props }) => (
    <em
      className={cn(
        'italic',
        className,
      )}
      {...props}
    />
  ),

  // Horizontal rule
  hr: ({ className, ...props }) => (
    <hr
      className={cn(
        'my-8 border-t border-dashed border-gray-300',
        className,
      )}
      {...props}
    />
  ),

  // h1 (for top-level titles)
  h1: ({ className, ...props }) => (
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

  // h2
  h2: ({ className, ...props }) => (
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
  h3: ({ className, ...props }) => (
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

  // h4 — smaller subsection heading
  h4: ({ className, ...props }) => (
    <h4
      className={cn(
        'mt-6 mb-2',
        'text-lg lg:text-xl font-semibold',
        'scroll-m-24',
        className,
      )}
      {...props}
    />
  ),

  // h5 — label-like heading
  h5: ({ className, ...props }) => (
    <h5
      className={cn(
        'mt-4 mb-2',
        'text-base font-semibold text-gray-800',
        'scroll-m-24',
        className,
      )}
      {...props}
    />
  ),

  // Blockquote / quote
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
      // Container
        'my-6 rounded-lg border border-gray-200 border-l-4 border-l-black bg-[#fffdf0]',
        'px-4 py-3',
        // Typography
        'text-[0.97rem] leading-relaxed text-gray-800 italic',
        // Tighter spacing for nested paragraphs
        '[&>p]:my-2 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0',
        className,
      )}
      {...props}
    />
  ),
  // Unordered list (equivalent to `.prose ul`)
  ul: ({ className, ...props }) => (
    <ul
      className={cn(
        'my-4 ml-6 list-disc space-y-1',
        className,
      )}
      {...props}
    />
  ),

  // Ordered list (equivalent to `.prose ol`)
  ol: ({ className, ...props }) => (
    <ol
      className={cn(
        'my-4 ml-6 list-decimal space-y-1',
        className,
      )}
      {...props}
    />
  ),

  // List item
  li: ({ className, ...props }) => (
    <li
      className={cn(
        'leading-relaxed',
        className,
      )}
      {...props}
    />
  ),

  // Code blocks
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        'my-4 overflow-x-auto rounded-lg bg-gray-900 text-gray-50',
        'p-4 text-sm leading-relaxed',
        className,
      )}
      {...props}
    />
  ),

  // Inline code
  code: ({ className, children, ...props }) => {
    const match = typeof className === 'string' ? /language-(\w+)/.exec(className) : null

    if (!match) {
      return (
        <code
          className={cn(
            'rounded bg-gray-100 px-1 py-0.5',
            'font-mono text-[0.95em]',
            className,
          )}
          {...props}
        >
          {children}
        </code>
      )
    }

    return (
      <code
        className={cn(
          'font-mono text-[0.9em]',
          className,
        )}
        {...props}
      >
        {children}
      </code>
    )
  },

  // Images inside MDX
  img: ({ className, ...props }) => (
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

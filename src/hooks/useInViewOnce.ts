import { useEffect, useRef, useState } from 'react'

export const useInViewOnce = <T extends HTMLElement>(
  options?: IntersectionObserverInit,
) => {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!ref.current || inView) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      options,
    )

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [inView, options])

  return { ref, inView }
}

import { ICONS } from './items'

// Helper to render icons based on route
const renderIcon = (href: string) => {
  const Comp = ICONS[href]
  if (Comp === undefined) {
    return null
  }
  return <Comp className="h-4 w-4" aria-hidden="true" />
}

export default renderIcon

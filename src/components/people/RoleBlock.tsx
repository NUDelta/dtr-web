import type { StatusTab } from '@/hooks/usePeopleDirectory'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import Avatar from './Avatar'
import BioClamp from './BioClamp'
import PeopleCard from './PeopleCard'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

interface RoleBlockProps {
  status: StatusTab
  role: string
  people: Person[]
  view: 'card' | 'list'
}

const RoleBlock = ({
  status,
  role,
  people,
  view,
}: RoleBlockProps) => {
  // Default open for all only for active page
  // Alumni small cohorts; collapsed for large ones
  const defaultOpen = status === 'Active' || ['Faculty', 'Ph.D. Candidate', 'Ph.D. Student'].includes(role)
  const [visible, setVisible] = useState(Math.min(people.length, 24))
  const remaining = Math.max(0, people.length - visible)

  return (
    <section aria-labelledby={`heading-${slugify(role)}`} className="rounded-2xl border">
      <details open={defaultOpen} className="group rounded-2xl">
        <summary className="flex cursor-pointer select-none items-center justify-between gap-3 rounded-2xl px-4 py-3 text-lg font-semibold hover:bg-black/5 dark:hover:bg-white/5">
          <span id={`heading-${slugify(role)}`}>{role}</span>
          <span className="text-sm font-normal text-gray-600">
            {people.length.toLocaleString()}
            {' '}
            member
            {people.length === 1 ? '' : 's'}
          </span>
        </summary>

        {view === 'card'
          ? (
              <motion.ul
                role="list"
                aria-label={`${role} — card grid`}
                className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                id="people-results"
                layout
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {people.slice(0, visible).map(p => (
                    <motion.li
                      key={p.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="list-none"
                    >
                      <PeopleCard person={p} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            )
          : (
              <motion.ul
                role="list"
                aria-label={`${role} — list`}
                className="divide-y p-2"
                id="people-results"
                layout
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {people.slice(0, visible).map(p => (
                    <motion.li
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="list-none"
                    >
                      <div className="flex items-start gap-3 p-2">
                        <Avatar src={p.profile_photo} alt={`${p.name} — ${p.title}`} size={56} />
                        <div className="min-w-0">
                          <div className="font-medium">{p.name}</div>
                          <div className="text-sm text-gray-600">{p.title || p.role}</div>
                          <BioClamp text={p.bio} lines={2} />
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            )}

        {remaining > 0 && (
          <div className="flex items-center justify-center p-4 pt-0">
            <button
              type="button"
              onClick={() => setVisible(v => v + 24)}
              className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
            >
              Show more (
              {remaining}
              )
            </button>
          </div>
        )}
      </details>
    </section>
  )
}

export default RoleBlock

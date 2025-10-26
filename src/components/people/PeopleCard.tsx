import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import Avatar from './Avatar'
import BioClamp from './BioClamp'

const PeopleCard = ({ person }: { person: Person }) => {
  const [expanded, setExpanded] = useState(false)
  return (
    <motion.article
      layout
      className="h-full overflow-hidden rounded-2xl border shadow-sm transition hover:shadow-md focus-within:shadow-md"
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.2 }}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        <Avatar src={person.profile_photo} alt={`${person.name} — ${person.title}`} fill />
      </div>
      <div className="space-y-2 p-4">
        <h3 className="text-lg font-semibold leading-tight">{person.name}</h3>
        <p className="text-sm text-gray-600">{person.title || person.role}</p>
        <AnimatePresence initial={false} mode="wait">
          {expanded
            ? (
                <motion.div
                  key="full"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <BioClamp text={person.bio} lines={0} />
                </motion.div>
              )
            : (
                <motion.div
                  key="clamped"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <BioClamp text={person.bio} lines={4} />
                </motion.div>
              )}
        </AnimatePresence>
        <div className="pt-1">
          <button
            type="button"
            className="cursor-pointer rounded-lg px-2 py-1 text-sm font-medium underline hover:bg-black/5 "
            aria-expanded={expanded}
            onClick={() => setExpanded(v => !v)}
          >
            {expanded ? 'Show less' : 'Read bio'}
          </button>
        </div>
      </div>
    </motion.article>
  )
}

export default PeopleCard

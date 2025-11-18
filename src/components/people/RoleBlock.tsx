import { motion } from 'framer-motion'
import PeopleCard from './PeopleCard'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

interface RoleBlockProps {
  role: string
  people: Person[]
}

const RoleBlock = ({ role, people }: RoleBlockProps) => {
  return (
    <section
      aria-labelledby={`heading-${slugify(role)}`}
      className="rounded-2xl border"
    >
      <div className="group rounded-2xl">
        <div className="flex select-none items-center justify-between gap-3 rounded-2xl px-4 py-3 text-lg font-semibold hover:bg-black/5 dark:hover:bg-white/5">
          <h3 id={`heading-${slugify(role)}`}>{role}</h3>
          <span className="text-sm font-normal text-gray-600">
            {people.length.toLocaleString()}
            {' '}
            member
            {people.length === 1 ? '' : 's'}
          </span>
        </div>

        <motion.ul
          role="list"
          aria-label={`${role} — card grid`}
          className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          id="people-results"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          {people.map(p => (
            <li key={p.id} className="list-none">
              <PeopleCard person={p} />
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}

export default RoleBlock

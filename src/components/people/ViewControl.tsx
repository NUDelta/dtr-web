import type { StatusTab } from '@/hooks/usePeopleDirectory'
import { motion } from 'framer-motion'

interface ViewControlProps {
  status: StatusTab
  setStatus: React.Dispatch<React.SetStateAction<StatusTab>>
  countsByStatus: Record<StatusTab, number>
}

const ViewControl = ({
  status,
  setStatus,
  countsByStatus,
}: ViewControlProps) => {
  return (
    <motion.div
      className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Left: view toggle */}
      <div
        className="mt-2 inline-flex w-full max-w-md rounded-2xl bg-gray-50 p-1 shadow-sm ring-1 ring-gray-200"
        role="radiogroup"
        aria-label="Filter people by status"
      >
        {(['Active', 'Alumni'] as const).map((s) => {
          const isActive = status === s
          const count = countsByStatus[s]?.toLocaleString?.() ?? '0'

          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => setStatus(s)}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition cursor-pointer
              ${
            isActive
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-gray-700 hover:bg-white'
            }`}
            >
              <span>{s}</span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-base ${
                  isActive ? 'bg-white/15 text-gray-100' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Right: h2 heading for aria and status summary / hint */}
      <h2 className="text-xs text-gray-500 sm:text-right">
        {status === 'Active'
          ? 'Showing current faculty and students'
          : 'Showing alumni and their locations'}
      </h2>
    </motion.div>

  )
}

export default ViewControl

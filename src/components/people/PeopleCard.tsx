import { motion } from 'framer-motion'
import { memo, useState } from 'react'
import Modal from '@/components/shared/Modal'
import { useInViewOnce } from '@/hooks/useInViewOnce'
import Avatar from './Avatar'
import BioClamp from './BioClamp'

interface PeopleCardProps {
  person: Person
}

const PeopleCard = ({ person }: PeopleCardProps) => {
  const [bioOpen, setBioOpen] = useState(false)
  const { ref, inView } = useInViewOnce<HTMLDivElement>({
    rootMargin: '200px', // 200px threshold before visible
  })

  const toggleOpenClose = () => setBioOpen(v => !v)
  const handleOpen = () => setBioOpen(true)
  const handleClose = () => setBioOpen(false)
  const haveBio = person.bio.trim().length > 0

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleOpen()
    }
  }

  return (
    <>
      <motion.article
        ref={ref}
        layout="position"
        className={`h-full overflow-hidden rounded-2xl border shadow-sm transition hover:shadow-md focus-within:shadow-md ${haveBio ? 'cursor-pointer' : ''}`}
        onClick={haveBio ? toggleOpenClose : undefined}
        onKeyDown={haveBio ? handleKeyDown : undefined}
        whileHover={{
          y: -4,
          boxShadow: '0 12px 30px rgba(15,23,42,0.12)',
          transition: {
            duration: 0.18,
            ease: 'easeOut',
          },
        }}
        whileTap={{ y: -1, scale: 0.99 }}
      >
        <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
          {inView
            ? (
                <Avatar
                  src={person.profile_photo}
                  alt={`${person.name} — ${person.title}`}
                  fill
                />
              )
            : (
                <div className="h-full w-full bg-gray-200" />
              )}
        </div>
        <div className="space-y-2 p-4">
          <h4 className="text-lg font-semibold leading-tight">
            {person.name}
          </h4>
          <p className="text-sm text-gray-600">
            {person.title || person.role}
          </p>

          {haveBio
            && (
              <>
                <BioClamp text={person.bio} lines={4} />

                <div className="pt-1" aria-hidden="true">
                  <button
                    type="button"
                    className="cursor-pointer rounded-lg px-2 py-1 text-sm font-medium underline hover:bg-black/5"
                    onClick={toggleOpenClose}
                  >
                    {bioOpen ? 'Show less' : 'Read bio'}
                  </button>
                </div>
              </>
            )}
        </div>
      </motion.article>

      {haveBio
        && (
          <Modal
            open={bioOpen}
            onClose={handleClose}
            headingLevel={4}
            title={person.name}
            subtitle={person.title || person.role}
          >
            <BioClamp text={person.bio} lines={0} />
          </Modal>
        )}
    </>
  )
}

export default memo(PeopleCard)

import { GraduationCap } from 'lucide-react'
import { sortPeople } from './utils'

interface MembersForRoleProps {
  members: PartialPerson[]
}

const MembersForRole = ({ members }: MembersForRoleProps) => {
  if (members === undefined || members.length === 0) {
    return <p className="italic text-neutral-600">None</p>
  }
  return (
    <ul
      role="list"
      className="grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-x-4 gap-y-1 md:gap-y-1.5"
    >
      {members.sort(sortPeople).map(m => (
        <li key={m.id} className="text-sm font-medium text-neutral-900">
          {m.status === 'Alumni' && (
            <>
              <GraduationCap
                aria-hidden="true"
                className="mr-1 inline size-4 align-[-2px] text-yellow-600"
              />
              <span className="sr-only">Alumni: </span>
            </>
          )}
          {m.name}
        </li>
      ))}
    </ul>
  )
}

export default MembersForRole

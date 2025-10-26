import type { RoleGroups } from './utils'
import MembersForRole from './MembersForRole'
import { bucketForRole } from './utils'

interface TeamMemberProps {
  groupId: string
  members: PartialPerson[]
}

const TeamMembers = ({ groupId, members }: TeamMemberProps) => {
  // Group people by role bucket
  const grouped: Record<RoleGroups, PartialPerson[]> = {
    'Faculty': [],
    'Ph.D. Students': [],
    'Masters and Undergraduate Students': [],
    'Affiliates & Others': [],
  }
  for (const m of members) {
    grouped[bucketForRole(m.role)].push(m)
  }

  const leftOrder: RoleGroups[] = ['Faculty', 'Ph.D. Students', 'Affiliates & Others']
  const rightOrder: RoleGroups[] = ['Masters and Undergraduate Students']

  return (
    <section aria-labelledby={`team-${groupId}`} className="w-full">
      <h3 id={`team-${groupId}`} className="text-2xl font-bold">
        Team
      </h3>
      <div className="mb-4 h-1 w-10 rounded-full bg-yellow-300" aria-hidden="true" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2" role="list" aria-label="Team by role">
        {/* Left column: Faculty + PhD + Others (hide Others if empty) */}
        <div role="listitem" className="space-y-5">
          {leftOrder.map((role) => {
            const list = grouped[role]
            if (role === 'Affiliates & Others' && !list.length) {
              return null
            }
            if (!list.length) {
              return null
            }
            return (
              <article key={`${groupId}-${role}`}>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-neutral-800">
                  <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-yellow-400" />
                  {role}
                </h4>
                <MembersForRole members={list} />
              </article>
            )
          })}
        </div>

        {/* Right column: Masters/Undergrad */}
        <div role="listitem" className="space-y-5">
          {rightOrder.map((role) => {
            const list = grouped[role]
            if (!list.length) {
              return null
            }
            return (
              <article key={`${groupId}-${role}`}>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-neutral-800">
                  <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-yellow-400" />
                  {role}
                </h4>
                <MembersForRole members={list} />
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default TeamMembers

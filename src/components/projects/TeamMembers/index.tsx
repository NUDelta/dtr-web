import type { RoleGroups } from './utils'
import MembersForRole from './MembersForRole'
import { groupMembersByRole } from './utils'

interface TeamMemberProps {
  groupId: string
  members: PartialPerson[]
  showHeading?: boolean
}

const TeamMembers = ({
  groupId,
  members,
  showHeading = true,
}: TeamMemberProps) => {
  // Group people by role bucket
  const grouped = groupMembersByRole(members)

  const leftOrder: RoleGroups[] = ['Faculty', 'Affiliates & Others']
  const rightOrder: RoleGroups[] = ['Students']
  const sectionLabelProps = showHeading
    ? { 'aria-labelledby': `team-${groupId}` }
    : { 'aria-label': 'Team members' }

  return (
    <section {...sectionLabelProps} className="w-full">
      {showHeading && (
        <>
          <h3 id={`team-${groupId}`} className="text-2xl font-bold">
            Team
          </h3>
          <div className="mb-4 h-1 w-10 rounded-full bg-yellow-300" aria-hidden="true" />
        </>
      )}

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
                <MembersForRole
                  members={list}
                  compactColumns={role === 'Students'}
                />
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

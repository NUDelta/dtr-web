const ROLE_GROUPS = [
  'Faculty',
  'Students',
  'Affiliates & Others',
] as const

export type RoleGroups = (typeof ROLE_GROUPS)[number]

const roleMappingForFilter: Record<RoleGroups, string[]> = {
  'Faculty': ['Faculty'],
  'Students': [
    'Ph.D. Student',
    'Ph.D. Candidate',
    'Masters Student Researcher',
    'Undergraduate Student Researcher',
  ],
  'Affiliates & Others': [], // catch-all below
}

export const bucketForRole = (role: string): RoleGroups => {
  for (const group of ROLE_GROUPS) {
    if (roleMappingForFilter[group].includes(role)) {
      return group
    }
  }
  return 'Affiliates & Others'
}

export const groupMembersByRole = (members: PartialPerson[]): Record<RoleGroups, PartialPerson[]> => {
  const grouped: Record<RoleGroups, PartialPerson[]> = {
    'Faculty': [],
    'Students': [],
    'Affiliates & Others': [],
  }

  for (const member of members) {
    grouped[bucketForRole(member.role)].push(member)
  }

  return grouped
}

export const sortPeople = (a: PartialPerson, b: PartialPerson) => {
  // Active first, then by name
  const aw = a.status === 'Alumni' ? 1 : 0
  const bw = b.status === 'Alumni' ? 1 : 0
  if (aw !== bw) {
    return aw - bw
  }
  return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
}

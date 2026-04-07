export type DirectoryStatus = 'Active' | 'Inactive'

export interface SIGDirectoryItem extends SIG {
  status: DirectoryStatus
  activeProjects: PartialProject[]
  inactiveProjects: PartialProject[]
  shouldAutoExpandInactive: boolean
  projectCounts: {
    active: number
    inactive: number
    total: number
  }
  memberCount: number
}

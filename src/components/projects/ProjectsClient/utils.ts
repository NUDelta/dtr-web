import type { DirectoryStatus, SIGDirectoryItem } from './types'

const INACTIVE_PROJECT_STATUS_KEYWORDS = [
  'inactive',
  'archived',
  'complete',
  'completed',
  'former',
  'past',
]

const matchesQuery = (value: string, query: string) =>
  value.toLowerCase().includes(query)

export function normalizeProjectDirectoryStatus(status?: string | null): DirectoryStatus {
  const normalized = status?.trim().toLowerCase() ?? ''

  // Airtable status labels are free-form enough that we only classify
  // obviously inactive values as inactive; everything else stays active.
  if (INACTIVE_PROJECT_STATUS_KEYWORDS.some(keyword => normalized.includes(keyword))) {
    return 'Inactive'
  }

  return 'Active'
}

export function deriveSIGDirectoryItems(sigs: SIG[]): SIGDirectoryItem[] {
  return sigs.map((sig) => {
    const activeProjects = (sig.projects ?? []).filter(
      project => normalizeProjectDirectoryStatus(project.status) === 'Active',
    )
    const inactiveProjects = (sig.projects ?? []).filter(
      project => normalizeProjectDirectoryStatus(project.status) === 'Inactive',
    )
    const status: DirectoryStatus = activeProjects.length > 0 ? 'Active' : 'Inactive'

    return {
      ...sig,
      status,
      activeProjects,
      inactiveProjects,
      projectCounts: {
        active: activeProjects.length,
        inactive: inactiveProjects.length,
        total: (sig.projects ?? []).length,
      },
      memberCount: sig.members.length,
    }
  })
}

export function getSIGCountsByStatus(
  sigs: SIGDirectoryItem[],
): Record<DirectoryStatus, number> {
  return {
    Active: sigs.filter(sig => sig.status === 'Active').length,
    Inactive: sigs.filter(sig => sig.status === 'Inactive').length,
  }
}

export function filterSIGDirectoryItems(
  sigs: SIGDirectoryItem[],
  status: DirectoryStatus,
  query: string,
): SIGDirectoryItem[] {
  const normalizedQuery = query.trim().toLowerCase()
  const scoped = sigs.filter(sig => sig.status === status)

  if (!normalizedQuery) {
    return scoped
  }

  return scoped.flatMap((sig) => {
    const sigMatches
      = matchesQuery(sig.name, normalizedQuery)
        || matchesQuery(sig.description ?? '', normalizedQuery)

    if (sigMatches) {
      return [sig]
    }

    // Search stays inside the selected status tab, but active SIGs can still
    // surface inactive work in their secondary subsection when it matches.
    const activeProjects = sig.activeProjects.filter(project =>
      matchesQuery(`${project.name} ${project.description ?? ''}`, normalizedQuery),
    )
    const inactiveProjects = sig.inactiveProjects.filter(project =>
      matchesQuery(`${project.name} ${project.description ?? ''}`, normalizedQuery),
    )

    if (activeProjects.length === 0 && inactiveProjects.length === 0) {
      return []
    }

    return [{
      ...sig,
      activeProjects,
      inactiveProjects,
    }]
  })
}

export function getVisibleProjectCount(
  sig: SIGDirectoryItem,
  status: DirectoryStatus,
): number {
  if (status === 'Inactive') {
    return sig.inactiveProjects.length
  }

  return sig.activeProjects.length + sig.inactiveProjects.length
}

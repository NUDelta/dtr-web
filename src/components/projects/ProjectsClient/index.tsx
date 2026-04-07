'use client'

import { DirectoryStatusTabs, SearchBar } from '@/components/shared'
import ProjectsDirectorySidebar from './ProjectsDirectorySidebar'
import SIGSection from './SIGSection'
import { useProjectsDirectory } from './useProjectsDirectory'

interface ProjectsClientProps {
  sigs: SIG[]
  bannerImages: Record<string, string>
}

const ProjectsClient = ({ sigs, bannerImages }: ProjectsClientProps) => {
  const {
    status,
    setStatus,
    countsByStatus,
    filteredSigs,
    visibleProjectCount,
    query,
    setQuery,
    debouncedQuery,
    reset,
  } = useProjectsDirectory(sigs)

  return (
    <>
      <header className="pb-4 xl:mx-auto xl:max-w-[60rem]">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">SIGs & Projects</h1>
        <p className="mt-1 max-w-3xl text-base text-gray-600 sm:text-lg">
          Browse DTR Special Interest Groups, understand the work each SIG is exploring,
          and jump directly into the projects behind that work.
        </p>

        <div className="mt-6">
          <SearchBar
            value={query}
            onChange={setQuery}
            onClear={reset}
            placeholder={`Search ${status.toLowerCase()} SIGs and projects…`}
            className="w-full sm:mx-auto sm:max-w-xl"
          />
          {debouncedQuery && (
            <p className="mt-2 text-center text-sm text-gray-600">
              {filteredSigs.length}
              {' '}
              SIG
              {filteredSigs.length === 1 ? '' : 's'}
              {' '}
              and
              {' '}
              {visibleProjectCount}
              {' '}
              project
              {visibleProjectCount === 1 ? '' : 's'}
              {' '}
              shown
            </p>
          )}
        </div>

        <DirectoryStatusTabs
          tabs={['Active', 'Inactive']}
          value={status}
          onChange={setStatus}
          counts={countsByStatus}
          ariaLabel="Filter SIGs by activity"
          helperText={status === 'Active'
            ? 'Showing SIGs that currently have active work.'
            : 'Showing SIGs whose linked projects are all inactive.'}
        />
      </header>

      <div className="xl:mx-auto xl:max-w-[60rem]">
        <section
          id="projects-results"
          aria-live="polite"
          className="space-y-6 pb-28 xl:pb-10"
        >
          {filteredSigs.length === 0
            ? (
                <div className="rounded-[28px] border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
                  {debouncedQuery
                    ? (
                        <>
                          No matches for
                          {' '}
                          <span className="font-semibold">{debouncedQuery}</span>
                          {' '}
                          in
                          {' '}
                          {status.toLowerCase()}
                          {' '}
                          SIGs.
                        </>
                      )
                    : (
                        <>
                          No
                          {' '}
                          {status.toLowerCase()}
                          {' '}
                          SIGs to show right now.
                        </>
                      )}
                </div>
              )
            : (
                filteredSigs.map(sig => (
                  <SIGSection
                    key={sig.id}
                    sig={sig}
                    currentStatus={status}
                    bannerImages={bannerImages}
                  />
                ))
              )}
        </section>

        {filteredSigs.length > 0 && (
          <ProjectsDirectorySidebar
            status={status}
            sigs={filteredSigs}
          />
        )}
      </div>
    </>
  )
}

export default ProjectsClient

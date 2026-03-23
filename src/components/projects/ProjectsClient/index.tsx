'use client'

import { DirectoryStatusTabs, SearchBar } from '@/components/shared'
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
      <header className="pb-4">
        <h1 className="text-4xl font-semibold tracking-tight">SIGs & Projects</h1>
        <p className="mt-1 max-w-3xl text-lg text-gray-600">
          Browse DTR Special Interest Groups, understand the work each SIG is exploring,
          and jump directly into the projects behind that work.
        </p>

        <div className="mt-6">
          <SearchBar
            value={query}
            onChange={setQuery}
            onClear={reset}
            placeholder={`Search ${status.toLowerCase()} SIGs and projects…`}
            className="mx-auto max-w-xl"
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

      <section
        id="projects-results"
        aria-live="polite"
        className="grid grid-cols-1 gap-6 pb-10 lg:grid-cols-2 2xl:grid-cols-3"
      >
        {filteredSigs.length === 0
          ? (
              <div className="rounded-[28px] border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600 lg:col-span-2 2xl:col-span-3">
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
    </>
  )
}

export default ProjectsClient

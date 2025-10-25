'use client';

import { useEffect, useMemo, useState } from 'react';

export type ViewMode = 'card' | 'list';
export type StatusTab = 'Active' | 'Alumni';

/**
 * Encapsulates People directory state + derived data:
 * - status (Active/Alumni) and view (Card/List)
 * - keyboard shortcuts (A/U/V)
 * - document.title sync
 * - counts by status
 * - stable role ordering and grouped people by role for current status
 */
export const usePeopleDirectory = (initialPeople: Person[]) => {
  const [status, setStatus] = useState<StatusTab>('Active');
  const [view, setView] = useState<ViewMode>('card');

  // Title sync
  useEffect(() => {
    document.title = `People | DTR — ${status}`;
  }, [status]);

  // Keyboard: A=Active, U=Alumni, V=toggle view
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'a') {
        setStatus('Active');
      }
      if (k === 'u') {
        setStatus('Alumni');
      }
      if (k === 'v') {
        setView(v => (v === 'card' ? 'list' : 'card'));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const countsByStatus = useMemo(
    () => ({
      Active: initialPeople.filter(p => p.status === 'Active').length,
      Alumni: initialPeople.filter(p => p.status === 'Alumni').length,
    }),
    [initialPeople],
  );

  const allRoles = useMemo(() => {
    const set = new Set(initialPeople.map(p => p.role).filter(Boolean));
    const preferred = [
      'Faculty',
      'Ph.D. Candidate',
      'Ph.D. Student',
      'Masters Student Researcher',
      'Undergraduate Student Researcher',
    ];
    const rest = Array.from(set).filter(r => !preferred.includes(r));
    return [...preferred.filter(r => set.has(r)), ...rest.sort()];
  }, [initialPeople]);

  const grouped = useMemo(() => {
    const filtered = initialPeople.filter(p => p.status === status);
    const map = new Map<string, Person[]>();
    for (const p of filtered) {
      if (!map.has(p.role)) {
        map.set(p.role, []);
      }
      map.get(p.role)!.push(p);
    }
    return allRoles
      .filter(r => map.has(r))
      .map(r => ({ role: r, people: map.get(r)! }));
  }, [initialPeople, status, allRoles]);

  return {
    // state
    status,
    setStatus,
    view,
    setView,

    // derived
    countsByStatus,
    allRoles,
    grouped,
  };
};

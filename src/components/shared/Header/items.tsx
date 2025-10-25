import type { LucideProps } from 'lucide-react';
import {
  BookOpen,
  FileText,
  FolderKanban,
  GraduationCap,
  HelpCircle,
  Library,
  UserPlus,
  Users,
} from 'lucide-react';

// Direct root tabs
export const ROOT_LINKS: { href: string; label: string }[] = [
  { href: '/people', label: 'People' },
  { href: '/projects', label: 'Projects' },
];

// Dropdown groups (triggers are buttons)
export const GROUPS: {
  id: string;
  label: string;
  items: { href: string; label: string }[];
}[] = [
  { id: 'learn', label: 'Learn', items: [
    { href: '/method', label: 'Method' },
    { href: '/how-we-work', label: 'How We Work' },
    { href: '/what-we-learn', label: 'What We Learn' },
    { href: '/letters', label: 'Letters & Resources' },
  ] },
  { id: 'join', label: 'Join', items: [
    { href: '/apply', label: 'Apply' },
    { href: '/faq', label: 'FAQ' },
  ] },
];

// Icon mapping by route
export const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  '/people': Users,
  '/projects': FolderKanban,
  '/method': FileText,
  '/how-we-work': BookOpen,
  '/what-we-learn': GraduationCap,
  '/letters': Library,
  '/apply': UserPlus,
  '/faq': HelpCircle,
};

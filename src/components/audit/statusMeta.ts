import type { LucideIcon } from 'lucide-react'
import type { RunStatus } from './types'
import {
  AlertTriangle,
  CheckCircle2,
  Minus,
  Settings,
  X,
} from 'lucide-react'

export const STATUS_META: Record<RunStatus, {
  bgClass: string
  dotClass: string
  icon: LucideIcon
  label: string
  textClass: string
}> = {
  success: {
    label: 'Success',
    icon: CheckCircle2,
    textClass: 'text-green-700',
    bgClass: 'bg-green-50',
    dotClass: 'bg-green-600',
  },
  warning: {
    label: 'Warning',
    icon: AlertTriangle,
    textClass: 'text-amber-700',
    bgClass: 'bg-amber-50',
    dotClass: 'bg-amber-400',
  },
  failure: {
    label: 'Failure',
    icon: X,
    textClass: 'text-red-700',
    bgClass: 'bg-red-50',
    dotClass: 'bg-red-500',
  },
  skipped: {
    label: 'Skipped',
    icon: Minus,
    textClass: 'text-neutral-600',
    bgClass: 'bg-neutral-100',
    dotClass: 'bg-neutral-400',
  },
  running: {
    label: 'Running',
    icon: Settings,
    textClass: 'text-blue-700',
    bgClass: 'bg-blue-50',
    dotClass: 'bg-blue-500',
  },
}

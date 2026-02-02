import {
  WrenchScrewdriverIcon,
  CogIcon,
  SparklesIcon,
  ScaleIcon
} from '@heroicons/react/24/outline'

export interface NavigationItem {
  href: string
  label: string
}

export interface NavigationSection {
  id: string
  label: string
  icon: typeof WrenchScrewdriverIcon
  items: NavigationItem[]
}

export const navigationSections: NavigationSection[] = [
  {
    id: 'troubleshooting',
    label: 'Troubleshooting',
    icon: WrenchScrewdriverIcon,
    items: [
      { href: '/troubleshooting/exit-code-1', label: 'Exit Code 1' },
      { href: '/troubleshooting/dangerously-skip-permissions', label: 'Skip Permissions' },
      { href: '/troubleshooting/5-hour-limit', label: '5 Hour Limit' }
    ]
  },
  {
    id: 'setup',
    label: 'Setup',
    icon: CogIcon,
    items: [
      { href: '/setup/installation', label: 'Installation' },
      { href: '/setup/statusline', label: 'Status Line' },
      { href: '/setup/router', label: 'Router' }
    ]
  },
  {
    id: 'features',
    label: 'Features',
    icon: SparklesIcon,
    items: [
      { href: '/features/sequential-thinking', label: 'Sequential Thinking' }
    ]
  },
  {
    id: 'vs',
    label: 'Comparisons',
    icon: ScaleIcon,
    items: [
      { href: '/vs/cursor', label: 'vs Cursor' }
    ]
  }
]

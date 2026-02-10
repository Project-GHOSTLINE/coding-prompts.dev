import {
  ChartBarIcon,
  CpuChipIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  DevicePhoneMobileIcon,
  BeakerIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

export interface NavigationItem {
  href: string
  label: string
}

export interface NavigationSection {
  id: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  items: NavigationItem[]
}

export const navigationSections: NavigationSection[] = [
  {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: ChartBarIcon,
    items: [
      { href: '/admin/dashboard', label: 'Dashboard Principal' },
      { href: '/admin/dashboard#quick-stats', label: 'Statistiques Rapides' }
    ]
  },
  {
    id: 'seo',
    label: 'SEO Performance',
    icon: MagnifyingGlassIcon,
    items: [
      { href: '/admin/dashboard#seo', label: 'Vue d\'ensemble SEO' },
      { href: '/admin/dashboard#keywords', label: 'Top Keywords' },
      { href: '/admin/dashboard#opportunities', label: 'Opportunités' },
      { href: '/admin/dashboard#devices', label: 'Par Appareil' }
    ]
  },
  {
    id: 'ai-traffic',
    label: 'Trafic AI',
    icon: CpuChipIcon,
    items: [
      { href: '/admin/dashboard#ai-engines', label: 'Moteurs AI' },
      { href: '/admin/dashboard#ai-trends', label: 'Tendances' },
      { href: '/admin/dashboard#ai-landing', label: 'Pages Référées' },
      { href: '/admin/dashboard#ai-ratio', label: 'Ratio AI/Organic' }
    ]
  },
  {
    id: 'content',
    label: 'Performance Contenu',
    icon: DocumentTextIcon,
    items: [
      { href: '/admin/dashboard#content-comparison', label: 'AI vs Organic' },
      { href: '/admin/dashboard#top-pages-ai', label: 'Top Pages AI' },
      { href: '/admin/dashboard#top-pages-organic', label: 'Top Pages Organic' },
      { href: '/admin/dashboard#engagement', label: 'Métriques Engagement' }
    ]
  },
  {
    id: 'testing',
    label: 'Tests AEO',
    icon: BeakerIcon,
    items: [
      { href: '/admin/dashboard#aeo-tests', label: 'Citations AI' }
    ]
  },
  {
    id: 'settings',
    label: 'Configuration',
    icon: Cog6ToothIcon,
    items: [
      { href: '/admin/settings', label: 'Paramètres' },
      { href: '/admin/api-config', label: 'Configuration API' }
    ]
  }
]

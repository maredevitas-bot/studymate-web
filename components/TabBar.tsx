'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/app/subjects', label: '과목', icon: '📚' },
  { href: '/app/planner', label: '플래너', icon: '📅' },
  { href: '/app/analytics', label: '분석', icon: '📊' },
  { href: '/app/settings', label: '설정', icon: '⚙️' },
]

export default function TabBar() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="max-w-2xl mx-auto flex">
        {tabs.map(tab => {
          const active = pathname.startsWith(tab.href)
          return (
            <Link key={tab.href} href={tab.href}
              className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors
                ${active ? 'text-blue-500' : 'text-gray-400'}`}>
              <span className="text-xl">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/lib/navigation';
import { ICONS } from '@/components/ui/icon-map';

export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Navegação principal"
    >
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = ICONS[item.icon];

        if (item.highlight) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-1 flex-col items-center justify-center py-2"
            >
              <span className="touch-target -mt-6 rounded-full bg-brand-600 p-3 text-white shadow-card">
                <Icon size={24} />
              </span>
              <span className="mt-1 text-[11px] font-medium text-slate-700">{item.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`touch-target flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
              active ? 'text-brand-700' : 'text-slate-500'
            }`}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

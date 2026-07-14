'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import type { NavItem } from '@/lib/navigation';
import { ICONS } from '@/components/ui/icon-map';
import { signOut } from '@/lib/auth/actions';

export function Sidebar({ items, userName }: { items: NavItem[]; userName: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`hidden md:flex md:flex-col md:justify-between border-r border-slate-200 bg-white transition-all ${
        collapsed ? 'md:w-[72px]' : 'md:w-64'
      }`}
    >
      <div>
        <div className="flex items-center justify-between px-4 py-4">
          {!collapsed && (
            <span className="truncate text-sm font-semibold text-slate-900">{userName}</span>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="touch-target rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="mt-2 flex flex-col gap-1 px-2">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = ICONS[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <form action={signOut} className="px-2 pb-4">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          <LogOut size={20} />
          {!collapsed && <span>Sair</span>}
        </button>
      </form>
    </aside>
  );
}

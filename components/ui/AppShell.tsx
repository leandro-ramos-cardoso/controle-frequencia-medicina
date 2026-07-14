import { LogOut } from 'lucide-react';
import { Sidebar } from '@/components/ui/Sidebar';
import { BottomNav } from '@/components/ui/BottomNav';
import { signOut } from '@/lib/auth/actions';
import type { NavItem } from '@/lib/navigation';

export function AppShell({
  items,
  userName,
  children,
}: {
  items: NavItem[];
  userName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh overflow-hidden bg-surface">
      <Sidebar items={items} userName={userName} />

      <div className="flex h-dvh flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <span className="truncate text-sm font-semibold text-slate-900">{userName}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="touch-target rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              aria-label="Sair"
            >
              <LogOut size={18} />
            </button>
          </form>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-4 pb-24 md:px-8 md:py-6 md:pb-6">{children}</main>

        <BottomNav items={items} />
      </div>
    </div>
  );
}

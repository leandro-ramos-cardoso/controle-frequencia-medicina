import { Sidebar } from '@/components/ui/Sidebar';
import { BottomNav } from '@/components/ui/BottomNav';
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
    <div className="flex min-h-dvh bg-surface">
      <Sidebar items={items} userName={userName} />

      <div className="flex min-h-dvh flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <span className="text-sm font-semibold text-slate-900">{userName}</span>
        </header>

        <main className="flex-1 px-4 py-4 pb-24 md:px-8 md:py-6 md:pb-6">{children}</main>

        <BottomNav items={items} />
      </div>
    </div>
  );
}

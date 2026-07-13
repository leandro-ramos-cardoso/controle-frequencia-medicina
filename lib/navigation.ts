import type { LucideIcon } from 'lucide-react';
import {
  Home,
  Fingerprint,
  History,
  ClipboardList,
  User,
  LayoutDashboard,
  CheckSquare,
  Users,
  FileBarChart,
  Settings,
  ShieldCheck,
} from 'lucide-react';

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Exibido em destaque na barra inferior mobile (ex: botão de Registrar) */
  highlight?: boolean;
};

export type Role = 'aluno' | 'preceptor' | 'coordenador' | 'administrador';

export const NAV_ITEMS: Record<Role, NavItem[]> = {
  aluno: [
    { label: 'Início', href: '/aluno/dashboard', icon: Home },
    { label: 'Registrar', href: '/aluno/registrar-ponto', icon: Fingerprint, highlight: true },
    { label: 'Histórico', href: '/aluno/historico', icon: History },
    { label: 'Solicitações', href: '/aluno/solicitacoes', icon: ClipboardList },
    { label: 'Perfil', href: '/aluno/perfil', icon: User },
  ],
  preceptor: [
    { label: 'Painel', href: '/preceptor/dashboard', icon: LayoutDashboard },
    { label: 'Aprovações', href: '/preceptor/aprovacoes', icon: CheckSquare },
    { label: 'Alunos', href: '/preceptor/alunos', icon: Users },
    { label: 'Perfil', href: '/preceptor/perfil', icon: User },
  ],
  coordenador: [
    { label: 'Painel', href: '/coordenador/dashboard', icon: LayoutDashboard },
    { label: 'Estágios', href: '/coordenador/estagios', icon: ClipboardList },
    { label: 'Relatórios', href: '/coordenador/relatorios', icon: FileBarChart },
    { label: 'Perfil', href: '/coordenador/perfil', icon: User },
  ],
  administrador: [
    { label: 'Painel', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Cadastros', href: '/admin/cadastros', icon: Users },
    { label: 'Relatórios', href: '/admin/relatorios', icon: FileBarChart },
    { label: 'Auditoria', href: '/admin/auditoria', icon: ShieldCheck },
    { label: 'Config.', href: '/admin/configuracoes', icon: Settings },
  ],
};

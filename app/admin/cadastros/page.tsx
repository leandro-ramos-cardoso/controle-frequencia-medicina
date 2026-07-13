import Link from 'next/link';
import { GraduationCap, Stethoscope, Building2, MapPin, ClipboardList } from 'lucide-react';

const ENTITIES = [
  { href: '/admin/cadastros/alunos', label: 'Alunos', icon: GraduationCap },
  { href: '/admin/cadastros/preceptores', label: 'Preceptores', icon: Stethoscope },
  { href: '/admin/cadastros/instituicoes', label: 'Instituições', icon: Building2 },
  { href: '/admin/cadastros/locais', label: 'Locais de estágio', icon: MapPin },
  { href: '/admin/cadastros/estagios', label: 'Estágios', icon: ClipboardList },
];

export default function CadastrosHubPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">Cadastros</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ENTITIES.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-card hover:border-brand-300"
          >
            <Icon size={24} className="text-brand-600" />
            <span className="text-sm font-medium text-slate-700">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

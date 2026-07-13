import { getAdminStats } from '@/lib/queries/admin';
import { StatCard } from '@/components/dashboard/StatCard';

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Painel administrativo</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Alunos cadastrados" value={stats.studentsCount} />
        <StatCard label="Preceptores ativos" value={stats.preceptorsCount} />
        <StatCard label="Alunos em estágio" value={stats.activeInternshipStudents} />
        <StatCard label="Registros hoje" value={stats.recordsToday} />
        <StatCard label="Pontos pendentes" value={stats.pendingRecords} />
        <StatCard label="Solicitações pendentes" value={stats.pendingRequests} />
        <StatCard label="Fora do perímetro hoje" value={stats.outOfPerimeterToday} />
      </div>

      {/*
        Os gráficos pedidos no item 17 da especificação (frequência por
        período, registros por local etc.) foram implementados na tela de
        Relatórios em vez de duplicados aqui — ver /admin/relatorios.
      */}

      <p className="text-sm text-slate-500">
        Gerencie alunos, preceptores, instituições, locais e estágios em{' '}
        <a href="/admin/cadastros" className="font-medium text-brand-700 hover:underline">
          Cadastros
        </a>
        .
      </p>
    </div>
  );
}

import { listSystemSettings } from '@/lib/queries/admin';
import { createSystemSetting, updateSystemSetting } from '@/lib/admin/actions';
import { SettingRow } from '@/components/admin/SettingRow';
import { CreateForm } from '@/components/admin/CreateForm';

export default async function ConfiguracoesPage() {
  const settings = await listSystemSettings();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">Configurações</h1>

      <CreateForm
        action={createSystemSetting}
        submitLabel="Criar configuração"
        className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:grid-cols-2"
      >
        <input
          name="key"
          required
          placeholder="Chave (ex: data_retention_days) *"
          pattern="[a-z0-9_]+"
          title="Apenas letras minúsculas, números e underscore"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input name="value" required placeholder="Valor *" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input
          name="description"
          placeholder="Descrição"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
        />
      </CreateForm>

      <div className="space-y-2">
        {settings.map((s) => (
          <SettingRow
            key={s.id}
            settingKey={s.key}
            description={s.description}
            value={s.value}
            action={updateSystemSetting.bind(null, s.key)}
          />
        ))}
        {settings.length === 0 && (
          <p className="text-sm text-slate-500">
            Nenhuma configuração cadastrada ainda — insira registros na tabela{' '}
            <code>system_settings</code> via SQL para que apareçam aqui.
          </p>
        )}
      </div>
    </div>
  );
}

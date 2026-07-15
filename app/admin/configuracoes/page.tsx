import { listSystemSettings } from '@/lib/queries/admin';
import { updateSystemSetting } from '@/lib/admin/actions';
import { SettingRow } from '@/components/admin/SettingRow';

export default async function ConfiguracoesPage() {
  const settings = await listSystemSettings();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">Configurações</h1>

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

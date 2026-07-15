import { listLocations, listOptionsForForms } from '@/lib/queries/admin';
import { createLocation, deactivateLocation } from '@/lib/admin/actions';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { CreateForm } from '@/components/admin/CreateForm';

export default async function LocaisPage() {
  const [locations, { institutions }] = await Promise.all([listLocations(), listOptionsForForms()]);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Locais de estágio</h1>

      <CreateForm
        action={createLocation}
        submitLabel="Cadastrar local"
        className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:grid-cols-2"
      >
        <select name="institutionId" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2">
          <option value="">Instituição *</option>
          {institutions.map((i) => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>
        <input name="name" required placeholder="Nome *" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="type" placeholder="Tipo (hospital, ambulatório...)" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="address" placeholder="Endereço" className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2" />
        <input name="latitude" type="number" step="any" required placeholder="Latitude *" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="longitude" type="number" step="any" required placeholder="Longitude *" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="allowedRadiusMeters" type="number" defaultValue={100} placeholder="Raio permitido (m)" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="warningRadiusMeters" type="number" defaultValue={150} placeholder="Raio de atenção (m)" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </CreateForm>

      <div className="space-y-2">
        {locations.map((loc) => (
          <div key={loc.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{loc.name}</p>
              <p className="truncate text-xs text-slate-400">
                {loc.institutions?.name} · raio {loc.allowed_radius_meters}m
              </p>
            </div>
            <DeleteButton action={deactivateLocation.bind(null, loc.id)} />
          </div>
        ))}
        {locations.length === 0 && <p className="text-sm text-slate-500">Nenhum local cadastrado.</p>}
      </div>
    </div>
  );
}

import type { SupabaseClient } from '@supabase/supabase-js';

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

/**
 * Envia um anexo para o bucket privado `attachments` e cria a linha
 * correspondente em `attachments`. Retorna null se nenhum arquivo foi
 * enviado (anexo é opcional em ambos os formulários).
 */
export async function uploadAttachmentIfPresent(
  supabase: SupabaseClient,
  file: File | null,
  params: { ownerProfileId: string; relatedTable: string; relatedId: string }
): Promise<{ error?: string } | null> {
  if (!file || file.size === 0) return null;

  if (file.size > MAX_SIZE_BYTES) {
    return { error: 'O arquivo excede o limite de 10 MB.' };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Formato não suportado. Envie JPG, PNG, WEBP ou PDF.' };
  }

  const path = `${params.ownerProfileId}/${params.relatedTable}/${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabase.storage.from('attachments').upload(path, file, {
    contentType: file.type,
  });
  if (uploadError) {
    return { error: 'Falha ao enviar o anexo. Tente novamente.' };
  }

  const { error: insertError } = await supabase.from('attachments').insert({
    owner_profile_id: params.ownerProfileId,
    related_table: params.relatedTable,
    related_id: params.relatedId,
    file_path: path,
    file_name: file.name,
    mime_type: file.type,
    size_bytes: file.size,
  });
  if (insertError) {
    return { error: 'Anexo enviado, mas não foi possível vinculá-lo à solicitação.' };
  }

  return null;
}

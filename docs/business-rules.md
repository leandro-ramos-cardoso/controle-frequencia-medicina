# Regras de negócio por perfil

## Aluno — pode
Registrar entrada/saída; visualizar seus registros e carga horária; ver
pendências; justificar ausência; solicitar ajuste; acompanhar solicitações;
atualizar alguns dados pessoais; consultar histórico e estágios vinculados.

## Aluno — não pode
Editar registros já aprovados; ver dados de outros alunos; aprovar o próprio
ponto; alterar data/hora/localização manualmente.

## Preceptor — pode
Ver alunos sob sua supervisão; consultar/aprovar/recusar registros; pedir
correções; registrar observações; confirmar presença; validar frequência;
ver relatórios dos alunos vinculados. **Recusa sempre exige justificativa.**

## Coordenador — pode
Cadastrar estágios; vincular alunos e preceptores; consultar registros;
aprovar solicitações; acompanhar carga horária; gerar relatórios; cadastrar
locais; definir horários e regras de tolerância; acompanhar pendências.

## Administrador — pode
Gerenciar usuários, instituições, cursos, locais; cadastrar
alunos/preceptores/coordenadores; criar turmas e períodos acadêmicos;
cadastrar estágios; definir regras (inclusive geofence); consultar
auditoria; exportar dados; bloquear/reativar usuários.

## Sequência de registro de ponto
- Não permitir saída sem entrada prévia.
- Não permitir duas entradas consecutivas.
- Não permitir retorno de intervalo sem início de intervalo.
- Alertar sobre ponto não finalizado ao final do expediente.
- Detectar e bloquear registros duplicados (idempotência).

## Status de validação
`Aprovado · Pendente · Recusado · Em análise · Ajustado · Fora do perímetro ·
Incompleto · Cancelado` — sempre exibidos com ícone + cor (nunca só cor).

## Solicitação de ajuste
Aluno nunca edita o registro original; o sistema cria uma solicitação vinculada,
mantendo o histórico anterior. Motivos: esqueceu de registrar, horário
incorreto, problema de internet/GPS, atividade externa, erro do sistema, outro.

## Justificativa de ausência
Campos: data, estágio, motivo, descrição, preceptor, documento comprobatório,
intervalo da ausência, observação. Status: enviada, em análise, aprovada,
recusada, necessita correção.

## Offline / conexão instável (PWA)
Nunca simular confirmação sem conexão; mostrar "Aguardando sincronização";
armazenar localmente de forma protegida; sincronizar e validar com horário do
servidor ao reconectar; impedir duplicações; marcar registros offline para
análise.

## Notificações
Ponto registrado/aprovado/recusado; solicitação respondida; registro
esquecido; estágio próximo; carga horária incompleta; ausência de saída;
alteração de horário; novo vínculo; documento pendente. Canais: dentro do
sistema, e-mail, (push futuramente).

# Modelo de dados

Fonte: `shared/types.ts` (tipos públicos) e `server/db.ts` (SQLite).

| Tabela | Chave | Relação principal |
|---|---|---|
| `users` | `id` | identidade, modo, localização, nível de verificação |
| `sessions` | `id` | `user_id`; token só em hash; `expires_at` |
| `provider_profiles` | `user_id` | perfil profissional publicado |
| `provider_portfolio` | `(user_id, file_id)` | até 8 imagens |
| `requests` | `id` | `customer_id`; estado OPEN/ASSIGNED/COMPLETED/CANCELLED/DISPUTED |
| `request_photos` | `(request_id, file_id)` | fotos reais |
| `proposals` | `id` | `request_id` + `provider_id`; PENDING/ACCEPTED/REJECTED/WITHDRAWN |
| `conversations` | `id` | `request_id`, `customer_id`, `provider_id` |
| `messages` | `id` | `conversation_id`, `sender_id` |
| `message_attachments` | `(message_id, file_id)` | anexo privado |
| `conversation_reads` | `(conversation_id, user_id)` | leitura |
| `agreements` | `id` | `customer_id`, `provider_id`; aceitação e conclusão bilaterais |
| `completion_photos` | `(agreement_id, file_id)` | prova privada |
| `reviews` | `id` | `request_id`, `author_id`, `target_id`; única por autor/pedido |
| `files` | `id` | owner, MIME real, tamanho, visibilidade, finalidade |
| `notifications` | `id` | `user_id`, link, leitura |
| `reports` | `id` | reporter, alvo, motivo, estado |
| `report_appeals` | `id` | recurso do autor; estado PENDING/ACCEPTED/REJECTED |
| `verification_requests` | `id` | pedido manual de identidade/qualificação |
| `audit_log` | `id` | acções sensíveis |

Regras:

- IDs opacos com prefixo (`usr_`, `req_`, `prop_`, `agr_`, `conv_`, `msg_`, `file_`).
- Nenhuma FK para dados apagados fica pendente; eliminação de conta anonimiza e despublica.
- `reviews` não tem caminho para autoavaliação: o servidor compara autor e alvo com os participantes do acordo.
- Datas em ISO 8601 UTC; a interface formata em `pt-AO`/`en-GB`.

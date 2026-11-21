# Ciclos de serviço

## Ciclo feliz

1. Cliente cria conta, escolhe modo e localização.
2. Publica pedido com categoria, descrição, localização e fotos.
3. Prestador com perfil publicado vê o pedido e envia proposta (valor, prazo, mensagem).
4. Cliente aceita uma proposta. É criado um acordo e uma conversa.
5. Cliente e prestador confirmam cada um o seu lado. Só então o acordo fica `ACTIVE`.
6. Trabalho é feito; prestador submete conclusão com nota e prova fotográfica.
7. Cliente confirma a conclusão, pede correcção ou abre disputa.
8. Após `COMPLETED`, cada parte pode avaliar a outra uma vez, em três critérios.

## Estados

- Pedido: `OPEN → ASSIGNED → COMPLETED`; `CANCELLED`/`DISPUTED`.
- Proposta: `PENDING → ACCEPTED | REJECTED | WITHDRAWN`.
- Acordo: `PENDING_CUSTOMER ⇄ PENDING_PROVIDER → ACTIVE → WORK_SUBMITTED → COMPLETED`; `DISPUTED`/`CANCELLED`.

## Excepções tratadas

- Rejeição de proposta: pedido continua aberto.
- Retirada de proposta: idem.
- Cancelamento do pedido antes de acordo.
- Cancelamento do acordo por qualquer participante antes de concluído.
- Silêncio: não há expiração automática; o acordo permanece pendente e visível.
- Pedido de correcção: volta a `ACTIVE` e permite nova submissão.
- Disputa: bloqueia novas confirmações e fica registada para análise.
- Denúncia + moderação + recurso.

O pagamento não faz parte do ciclo técnico: é combinado directamente entre as partes.

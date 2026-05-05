# Impact Hub API - Documentação Frontend

Esta documentação detalha todas as rotas da API, para facilitar as integrações no lado do Frontend. A API possui validação forte (Zod) e autenticação JWT. Salvo onde especificado o contrário, requisições que pedem **Auth** exigem o cabeçalho `Authorization: Bearer <token>`.

---

## 1. Auth (`Auth`)

### `POST /auth/register`
- **Descrição:** Registra um novo usuário no sistema.
- **Corpo (Body):**
  - `name`: string (min: 2)
  - `email`: string (formato email válido)
  - `password`: string (min: 6)
  - `role`: string (opcional) `enum('user', 'admin')` - default `user`
- **Resposta Sucesso:** `201 Created` contendo `{ id, email }`

### `POST /auth/login`
- **Descrição:** Autentica e gera o token de acesso.
- **Corpo (Body):**
  - `email`: string
  - `password`: string
- **Resposta Sucesso:** `200 OK` contendo `{ token: "..." }`

### `GET /auth/me`
- **Descrição:** Retorna o perfil completo do usuário logado.
- **Headers:** Auth obrigatório.
- **Reposta Sucesso:** `200 OK` contendo:
  - `id`, `name`, `email`, `role`, `reputationScore`, `reputationLevel`

---

## 2. Users (`Users`)

### `GET /users/:id`
- **Descrição:** Retorna os dados públicos de um usuário.
- **Params:** `id` (UUID no path da rota).
- **Headers:** Auth obrigatório.

### `PATCH /users/:id`
- **Descrição:** Atualiza os dados de perfil (apenas o nome, por enquanto).
- **Params:** `id` (UUID).
- **Corpo (Body):** `name` (string, min 2, opcional).
- **Headers:** Auth obrigatório.

### `GET /users/:id/reputation`
- **Descrição:** Retorna o histórico de eventos de reputação daquele usuário.
- **Params:** `id` (UUID).
- **Headers:** Auth obrigatório.
- **Resposta:** Array de eventos (ex: *event_completed*, *impact_validated* e pontuação).

### `GET /users/:id/reservations`
- **Descrição:** Busca todas as reservas já feitas pelo usuário, ideal para exibir no perfil dele.
- **Params:** `id` (UUID).
- **Headers:** Auth obrigatório.

---

## 3. Reservations (`Reservations`)

### `GET /reservations/equivalence`
- **Descrição:** Rota aberta para obter o valor estimado ou cálculo equivalente na hora que o usuário for preencher a reserva.
- **Query (URL):**
  - `days`: número (ex: `?days=3`)
  - `type`: `enum('donation', 'time_impact', 'content_impact')`
  - `subtype`: string (ex: 'cestas_basicas')
- **Resposta:** Retorna `estimatedValue` e `suggestedQuantity`.

### `POST /reservations`
- **Descrição:** Cria uma reserva conectando o valor sugerido. **Nota:** Bloqueado caso o `reputationScore` do user seja negativo.
- **Headers:** Auth obrigatório.
- **Corpo (Body):**
  - `startDate`: string (formato datetime)
  - `endDate`: string (formato datetime)
  - `usageType`: `enum('course', 'social_event', 'content_recording')`
  - `eventTitle`: string (min: 3)
  - `eventDescription`: string (min: 10)
  - `contributionType`: `enum('donation', 'time_impact', 'content_impact')`
  - `contributionSubtype`: string
  - `contributionQuantity`: número (positivo)
  - `contributionUnit`: string
  - `impactCategoryId`: string (UUID válido de uma de nossas 3 categorias de impacto)

### `GET /reservations`
- **Descrição:** Lista as reservas. Comporta-se de dois jeitos: se o usuário for Admin visualiza as de **todos**, se for usuário comum visualiza **somente as dele**.
- **Headers:** Auth obrigatório.

### `GET /reservations/:id`
- **Descrição:** Pega os detalhes de apenas uma reserva específica.
- **Params:** `id` (UUID).
- **Headers:** Auth obrigatório.

### `PATCH /reservations/:id/status` (Acesso Admin)
- **Descrição:** Rota para um administrador mudar o status da reserva.
- **Params:** `id` (UUID).
- **Corpo (Body):**
  - `status`: `enum('pending', 'approved', 'rejected', 'cancelled')` (*Não passe `completed` aqui, use a rota de `/complete`*)
- **Headers:** Auth obrigatório.

### `PATCH /reservations/:id/complete` (Acesso Admin)
- **Descrição:** Dá a reserva como uso finalizado. **Isto gera +10 pontos de evento completado.**
- **Params:** `id` (UUID).
- **Headers:** Auth obrigatório.

---

## 4. Contributions (`Contributions`)

### `GET /contributions/:reservationId`
- **Descrição:** Pega o detalhamento de uma contribuição social ligada à reserva.
- **Params:** `reservationId` (UUID).
- **Headers:** Auth obrigatório.

### `PATCH /contributions/:id/validate` (Acesso Admin)
- **Descrição:** O administrador confirma e valida que a contribuição foi entregue (ex: cestas básicas chegaram). **Gera +20 pontos e se a reserva tb estiver concluída gera +30 extras de impacto.**
- **Params:** `id` (UUID correspondente ao UUID interno do contribution).
- **Headers:** Auth obrigatório.

---

## 5. Impact (`Impact`)

### `GET /impact/summary`
- **Descrição:** Pega o valor total gerado de impacto globalmente na plataforma.
- **Observação:** Não exige Autenticação. Traz um resumo que pode aparecer solto em landing pages.

### `GET /impact/user/:userId`
- **Descrição:** Resume o total gerado monetariamente nas contribuições convertidas de um único usuário.
- **Params:** `userId` (UUID).
- **Observação:** Não necessita de Token JWT obrigatoriamente.

---

## 6. Admin Panel (`Admin`)

### `GET /admin/reservations`
- **Descrição:** Retorna a listagem administrativa com todo o fluxo de reservas.
- **Query (opcional):** `?status=pending` (ou `approved`, etc).
- **Headers:** Auth obrigatório e conta obrigatória de **Administrador**.

### `GET /admin/dashboard`
- **Descrição:** Entrega as métricas gerenciais do hub (Total de usuários, Total de reservas, e total Aguardando Aprovação).
- **Headers:** Auth obrigatório e conta obrigatória de **Administrador**.
- **Resposta Sucesso:** `200 OK` contendo `{ totalUsers, totalReservations, waitingApproval }`.

### `GET /users`
- **Descrição:** Retorna a listagem completa de todos os usuários cadastrados na plataforma.
- **Headers:** Auth obrigatório e conta obrigatória de **Administrador**.
- **Resposta Sucesso:** Array de objetos contendo `id`, `name`, `email`, `role`, `reputationScore`, `reputationLevel` e `createdAt`.

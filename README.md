# WashUp API

Backend NestJS do WashUp, implementado a partir do `API_CONTRACT.md` do frontend Next.js. A API cobre os fluxos atuais de fila operacional, cadastro/autofill por placa, acompanhamento do cliente, clientes/fidelidade e health check.

## Tecnologias

- NestJS e TypeScript
- Prisma ORM
- PostgreSQL via Supabase
- `@nestjs/config`
- `class-validator` e `class-transformer`
- Jest para testes unitarios

## Configuracao

1. Crie um projeto no Supabase e copie a connection string PostgreSQL.
2. Crie um arquivo `.env` local com base em `.env.example`.
3. Ajuste `DATABASE_URL` com a URL do Supabase.

Variaveis:

```env
DATABASE_URL="postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres?schema=public"
PORT=3001
FRONTEND_LOCAL_URL=http://localhost:3000
FRONTEND_PRODUCTION_URL=https://washup.example.com
```

O arquivo `.env` nao deve ser versionado.

## Comandos

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

Outros comandos:

```bash
npm run lint
npm test
npm run build
npm run start:prod
```

## Endpoints Principais

- `GET /health`
- `POST /auth/login`
- `GET /service-orders`
- `POST /service-orders`
- `PATCH /service-orders/:id`
- `PATCH /service-orders/:id/advance`
- `PATCH /service-orders/:id/status`
- `PATCH /service-orders/:id/priority`
- `PATCH /service-orders/reorder`
- `DELETE /service-orders/:id`
- `GET /customers`
- `POST /customers/:id/redeem-benefit`
- `GET /vehicles/by-plate/:plate`
- `GET /tracking/:plate`

## Prisma

Models criados:

- `Customer`: dados cadastrais e fidelidade.
- `Vehicle`: placa original, placa normalizada e unicidade por `normalizedPlate`.
- `ServiceOrder`: dados do atendimento atual, status, posicao e ETA.

A migration inicial esta em `prisma/migrations/20260625000000_init`.

## Seed

O seed e idempotente e recria/atualiza os dados equivalentes aos mocks documentados no contrato.

Placas disponiveis:

- `QWE4A21`: cliente com atendimento em `WAITING`.
- `HJK7B92`: atendimento em `WAITING`.
- `MNB2C18`: atendimento em `WASHING`.
- `RTY9D33`: atendimento em `DONE` e cliente elegivel a fidelidade.
- `VBN1E45`: cliente cadastrado sem atendimento ativo.

## Integracao Com O Frontend

Rode a API em `http://localhost:3001` e configure o frontend com:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

O CORS aceita `FRONTEND_LOCAL_URL` e `FRONTEND_PRODUCTION_URL`.

## Decisoes De Escopo

- `serviceType` fica como `String` no banco para preservar exatamente os valores exibidos pelo frontend, incluindo espacos.
- O backend bloqueia atendimento ativo duplicado para a mesma placa normalizada com `409 Conflict`.
- Tracking por placa retorna apenas o atendimento daquela placa e omite CPF.
- Marca, modelo, cor e ano nao foram criados porque nao aparecem no contrato atual.
- Auth foi implementado de forma minima e compativel com o contrato: `admin@washup.com` / `123456`.

## Deploy

1. Configure as variaveis de ambiente no provedor.
2. Rode `npm run prisma:generate`.
3. Aplique migrations com `npm run prisma:migrate` ou fluxo equivalente do ambiente.
4. Opcionalmente rode `npm run prisma:seed`.
5. Rode `npm run build`.
6. Inicie com `npm run start:prod`.

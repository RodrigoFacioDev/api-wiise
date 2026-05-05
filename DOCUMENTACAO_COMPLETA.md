# 🚀 Guia Completo - Impact Hub API

Bem-vindo à documentação oficial do backend da plataforma **Impact Hub**. Este documento contém todas as instruções necessárias para configurar, rodar e manter o projeto.

---

## 📋 Requisitos Mínimos
- **Node.js**: v22 ou superior.
- **Docker & Docker Compose**: Para rodar o banco de dados PostgreSQL.
- **Gerenciador de pacotes**: npm (padrão) ou yarn.

---

## 🛠️ Instalação e Configuração

### 1. Clonar e Instalar Dependências
```bash
npm install
```

### 2. Variáveis de Ambiente
Copie o arquivo de exemplo e configure suas chaves (especialmente `JWT_SECRET` e `DATABASE_URL`):
```bash
cp .env.example .env
```
*Dica: A `DATABASE_URL` padrão para o Docker é: `postgresql://impact_user:impact_password@localhost:5433/impact_hub`*

---

## 🐳 Docker (Banco de Dados)

O projeto utiliza um container PostgreSQL pré-configurado.

### Subir o Banco
```bash
docker compose up -d
```

### Acessar o Banco via Terminal
Para rodar queries SQL manualmente dentro do container:
```bash
sudo docker exec -it impact-hub-postgres psql -U impact_user -d impact_hub
```

### Problemas comuns
Se receber erro de `permission denied` ao rodar comandos docker, execute:
```bash
sudo usermod -aG docker $USER
```
*(Depois disso, deslogue e logue novamente no seu sistema Linux)*

---

## 🗄️ Banco de Dados e Migrações

O projeto usa **Drizzle ORM**.

- **Criar Migrations**: `npm run generate` (caso mude o schema)
- **Rodar Migrations**: `npm run migrate` ou `make migrate`
- **Popular Banco (Seed)**: 
  - Para dados básicos: `make seed`
  - Para criar 10 reservas de teste: `npx tsx scratch/seed_reservations.ts`

---

## 🚀 Executando o Projeto

### Modo Desenvolvimento (Hot Reload)
```bash
npm run dev
# OU
make dev
```
O servidor subirá em: `http://localhost:3333`

---

## 📖 Documentação da API (Swagger)

A documentação interativa fica disponível em:
👉 [http://localhost:3333/docs](http://localhost:3333/docs)

Lá você pode testar todas as rotas diretamente pelo navegador.

---

## 📑 Paginação Standard

Todas as rotas de listagem (`GET`) suportam paginação.

### Parâmetros de Query
- `pagina` ou `page`: O número da página (inicia em 1).
- `limit`: Quantidade de itens por página (padrão 10).

**Exemplo:** `GET /reservations?pagina=2&limit=5`

### Formato de Resposta
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "pagina": 2,
    "limit": 5,
    "totalPages": 20
  }
}
```

---

## 📂 Estrutura do Projeto
- `src/db/schema`: Definições das tabelas do banco.
- `src/modules`: Lógica de negócio dividida por módulos (Auth, Users, Reservations, Admin, Impact).
- `src/shared`: Middlewares, Schemas Zod e Erros globais.

---

## 🛡️ Admin e Permissões
Para transformar um usuário comum em administrador via banco de dados:
```sql
UPDATE users SET role = 'admin' WHERE email = 'seu-email@exemplo.com';
```

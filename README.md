# 🚀 Impact Hub - API & AI Agent

Sistema de agendamento de espaços de impacto social, onde o pagamento é feito através de contribuições sociais mensuráveis. Este repositório contém o **Backend (Node.js)** e o **AI Agent (Python)**.

---

## 🛠️ Pré-requisitos

Antes de começar, você precisará instalar as seguintes ferramentas:

| Ferramenta | Descrição | Link para Download |
| :--- | :--- | :--- |
| **Node.js** | Ambiente de execução para a API (v22+) | [Download Node.js](https://nodejs.org/) |
| **Python** | Linguagem para o AI Agent (v3.10+) | [Download Python](https://www.python.org/downloads/) |
| **Docker** | Para rodar o banco de dados PostgreSQL | [Download Docker](https://www.docker.com/products/docker-desktop/) |
| **Git** | Para versionamento de código | [Download Git](https://git-scm.com/downloads) |
| **Make** | (Opcional) Facilita a execução de comandos | *Já vem no Linux/Mac* |

---

## 🏁 Passo a Passo para Rodar o Projeto

### 1. Configurar Variáveis de Ambiente
Você precisa configurar dois arquivos `.env`:

**Na raiz do projeto (API):**
```bash
cp .env.example .env
```

**Dentro da pasta `ai_agent` (Agent):**
```bash
cp ai_agent/.env.example ai_agent/.env  # Caso exista, ou crie um novo
```

---

### 2. Subir o Banco de Dados
Certifique-se de que o Docker está aberto e execute:
```bash
docker compose up -d
```

---

### 3. Configurar a API (Backend)
Instale as dependências e prepare o banco:
```bash
# Instalar pacotes
npm install

# Rodar migrations (criar tabelas)
make migrate

# Inserir dados iniciais (opcional)
make seed
```

---

### 4. Configurar o AI Agent (IA)
Crie um ambiente virtual e instale as dependências:
```bash
# Criar ambiente virtual (venv)
python3 -m venv venv

# Ativar o ambiente
source venv/bin/activate  # No Linux/Mac
# venv\Scripts\activate   # No Windows

# Instalar dependências
make agent-install
```

---

## 🚀 Como Executar

Para rodar o projeto completo, você precisará de dois terminais abertos:

### Terminal 1: API
```bash
make dev
```
*Acesse a documentação Swagger em: [http://localhost:3333/docs](http://localhost:3333/docs)*

### Terminal 2: AI Agent
```bash
source venv/bin/activate
make agent-dev
```
*O agente rodará em: `http://localhost:8000`*

---

## 🧪 Testando o Agente (CURL)

Você pode testar se o agente está funcionando enviando um comando via terminal:

```bash
curl -X POST http://localhost:8000/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "Olá, quem é você?", "thread_id": "teste-1"}'
```

---

## 🆘 Solução de Problemas Comuns

### Erro de CORS
Se o frontend não conseguir falar com o agente, certifique-se de que o `CORSMiddleware` está configurado no `ai_agent/main.py`. (Já configurado por padrão nesta versão).

### Erro "uvicorn: command not found"
Isso acontece quando o ambiente virtual não está ativo. Lembre-se de rodar `source venv/bin/activate` antes do `make agent-dev`.

### Erro de Permissão no Docker
No Linux, se o docker falhar, tente:
```bash
sudo usermod -aG docker $USER
```
*(Reinicie a sessão do sistema após este comando)*

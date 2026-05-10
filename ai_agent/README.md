# AI Agent - Impact Hub

Este é um agente inteligente desenvolvido com **FastAPI**, **LangChain** e **LangGraph** para tirar dúvidas sobre o Impact Hub.

## Tecnologias
- **FastAPI**: Interface de API.
- **LangGraph**: Orquestração do comportamento do agente (Stateful).
- **LangChain**: Integração com LLMs (GPT-4o).
- **Tools**: O agente possui ferramentas para consultar informações do sistema e calcular equivalências.

## Como Rodar

1. **Instalar dependências:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configurar Variáveis de Ambiente:**
   Crie um arquivo `.env` na pasta `ai-agent`:
   ```env
   OPENAI_API_KEY=sua_chave_aqui
   API_URL=http://localhost:3333
   ```

3. **Iniciar a API:**
   ```bash
   python -m ai_agent.main
   ```
   Ou use uvicorn diretamente da raiz do projeto:
   ```bash
   uvicorn ai-agent.main:app --reload --port 8000
   ```

## Endpoints
- `GET /health`: Verifica se o serviço está online.
- `POST /chat`: Envia uma mensagem para o agente.
  - Body: `{"message": "Como funciona o sistema de reputação?"}`

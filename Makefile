.PHONY: dev generate migrate seed test build agent-dev agent-install

dev:
	npx tsx watch src/server.ts

generate:
	npx drizzle-kit generate

migrate:
	npx drizzle-kit migrate

seed:
	npx tsx src/db/seed.ts

test:
	npx vitest run

build:
	npx tsc

agent-install:
	python3 -m pip install -r ai_agent/requirements.txt

agent-dev:
	uvicorn ai_agent.main:app --reload --port 8000

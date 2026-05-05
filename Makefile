.PHONY: dev generate migrate seed test build

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

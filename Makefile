.PHONY: install build test lint lint:fix commit prepare dev esm-test cjs-test

install:
	pnpm install

build:
	pnpm build

test:
	pnpm test

test:watch:
	pnpm test:watch

test:coverage:
	pnpm test:coverage

lint:
	pnpx biome check .

lint:fix:
	pnpx biome check --write .

dev:
	pnpm dev

esm-test:
	pnpm test:esm

cjs-test:
	pnpm test:cjs

commit:
	git add .
	git commit

prepare:
	husky install

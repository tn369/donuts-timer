.PHONY: install dev build lint format test clean

install:
	npm install

dev:
	npm run dev

build:
	npm run build

lint:
	npm run lint

format:
	npm run format

test:
	npm run test

clean:
	rm -rf node_modules dist

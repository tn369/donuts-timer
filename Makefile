.PHONY: install dev build lint format clean

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

clean:
	rm -rf node_modules dist

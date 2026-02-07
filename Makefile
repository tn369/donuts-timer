NPM = npm
TSC = npx tsc
VITE = npx vite
VITEST = npx vitest
PRETTIER = npx prettier
ESLINT = npx eslint
STYLELINT = npx stylelint

.PHONY: help install dev build lint format fix test tdd coverage preview clean type-check ci

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	$(NPM) install

dev: ## Start development server
	$(VITE)

build: ## Build for production
	$(NPM) run build

type-check: ## Run type check
	$(TSC) -b

lint: ## Run linting (JS and CSS)
	$(NPM) run lint

format: ## Format code with Prettier
	$(PRETTIER) --write .

fix: ## Automatically fix linting and formatting issues
	$(PRETTIER) --write .
	$(ESLINT) . --fix
	$(STYLELINT) "src/**/*.css" --fix

test: ## Run tests
	$(VITEST) run

tdd: ## Run tests in watch mode
	$(VITEST)

coverage: ## Run tests with coverage report
	$(VITEST) run --coverage

ci: lint type-check test ## Run all checks for CI (lint, type-check, test)

preview: ## Preview production build
	$(VITE) preview

clean: ## Remove build artifacts and dependencies
	rm -rf node_modules dist

SHELL := /bin/sh

FRONTEND_DIR := packages/frontend
NPM := npm --prefix $(FRONTEND_DIR)

.PHONY: help install dev build preview test test-watch lint check clean

help: ## Show available commands
	@awk 'BEGIN {FS = ":.*##"; printf "Usage: make <command>\n\nCommands:\n"} /^[a-zA-Z0-9_-]+:.*##/ {printf "  %-14s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install frontend dependencies
	$(NPM) ci

dev: ## Start the Vite development server
	$(NPM) run dev

build: ## Type-check and build the production PWA
	$(NPM) run build

preview: ## Preview the production build locally
	$(NPM) run preview

test: ## Run the test suite once
	$(NPM) test

test-watch: ## Run tests in watch mode
	$(NPM) run test:watch

lint: ## Run ESLint
	$(NPM) run lint

check: lint test build ## Run linting, tests, and the production build

clean: ## Remove generated frontend output and TypeScript caches
	rm -rf $(FRONTEND_DIR)/dist $(FRONTEND_DIR)/node_modules/.tmp

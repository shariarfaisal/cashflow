# Cashflow Application Makefile
# =============================

# Variables
DB_FILE = cashflow.db
DB_BACKUP_DIR = ./backups
MIGRATION_DIR = ./migrations
FRONTEND_DIR = ./frontend
BUILD_DIR = ./build/bin
APP_NAME = cashflow

# Colors for output
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
BLUE = \033[0;34m
NC = \033[0m # No Color

# Default target
.PHONY: help
help: ## Display this help message
	@echo "$(BLUE)Cashflow Application - Available Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

# ========== Database Commands ==========

.PHONY: migrate-up
migrate-up: ## Apply all pending migrations
	@echo "$(YELLOW)Applying database migrations...$(NC)"
	@for file in $(MIGRATION_DIR)/*.sql; do \
		if [ -f "$$file" ] && [[ "$$(basename $$file)" != old_* ]]; then \
			echo "$(BLUE)Applying: $$(basename $$file)$(NC)"; \
			sqlite3 $(DB_FILE) < $$file || exit 1; \
		fi; \
	done
	@echo "$(GREEN)✓ Migrations applied successfully$(NC)"

.PHONY: migrate-reset
migrate-reset: ## Drop all tables and re-run migrations
	@echo "$(YELLOW)Resetting database...$(NC)"
	@rm -f $(DB_FILE)
	@echo "$(BLUE)Creating new database...$(NC)"
	@sqlite3 $(DB_FILE) < $(MIGRATION_DIR)/001_init_schema.sql
	@echo "$(GREEN)✓ Database reset successfully$(NC)"

.PHONY: db-init
db-init: ## Initialize database with schema
	@echo "$(YELLOW)Initializing database...$(NC)"
	@sqlite3 $(DB_FILE) < $(MIGRATION_DIR)/001_init_schema.sql
	@echo "$(GREEN)✓ Database initialized successfully$(NC)"

.PHONY: db-backup
db-backup: ## Create timestamped backup of database
	@mkdir -p $(DB_BACKUP_DIR)
	@BACKUP_NAME="$(DB_FILE).backup_$$(date +%Y%m%d_%H%M%S)"; \
	cp $(DB_FILE) $(DB_BACKUP_DIR)/$$BACKUP_NAME && \
	echo "$(GREEN)✓ Database backed up to: $(DB_BACKUP_DIR)/$$BACKUP_NAME$(NC)"

.PHONY: db-restore
db-restore: ## Restore database from latest backup
	@if [ -z "$(BACKUP)" ]; then \
		LATEST=$$(ls -t $(DB_BACKUP_DIR)/*.backup_* 2>/dev/null | head -1); \
		if [ -z "$$LATEST" ]; then \
			echo "$(RED)✗ No backup found$(NC)"; \
			exit 1; \
		fi; \
		cp $$LATEST $(DB_FILE); \
		echo "$(GREEN)✓ Database restored from: $$LATEST$(NC)"; \
	else \
		cp $(BACKUP) $(DB_FILE); \
		echo "$(GREEN)✓ Database restored from: $(BACKUP)$(NC)"; \
	fi

# ========== Development Commands ==========

.PHONY: dev
dev: ## Run Wails in development mode
	@echo "$(YELLOW)Starting Wails development server...$(NC)"
	wails dev

.PHONY: dev-frontend
dev-frontend: ## Run frontend development server only
	@echo "$(YELLOW)Starting frontend development server...$(NC)"
	@cd $(FRONTEND_DIR) && npm run dev

.PHONY: run
run: build ## Build and run the application
	@echo "$(YELLOW)Running application...$(NC)"
	@./$(BUILD_DIR)/$(APP_NAME)

# ========== Code Generation ==========

.PHONY: sqlc
sqlc: ## Generate Go code from SQL queries
	@echo "$(YELLOW)Generating SQL code...$(NC)"
	@sqlc generate
	@echo "$(GREEN)✓ SQL code generated successfully$(NC)"

.PHONY: sqlc-verify
sqlc-verify: ## Verify SQL queries without generating code
	@echo "$(YELLOW)Verifying SQL queries...$(NC)"
	@sqlc compile
	@echo "$(GREEN)✓ SQL queries verified$(NC)"

.PHONY: wails-generate
wails-generate: ## Generate Wails bindings
	@echo "$(YELLOW)Generating Wails bindings...$(NC)"
	@wails generate
	@echo "$(GREEN)✓ Wails bindings generated$(NC)"

# ========== Build Commands ==========

.PHONY: build
build: ## Build the application for production
	@echo "$(YELLOW)Building application...$(NC)"
	@wails build
	@echo "$(GREEN)✓ Application built successfully$(NC)"

.PHONY: build-debug
build-debug: ## Build with debug symbols
	@echo "$(YELLOW)Building application with debug symbols...$(NC)"
	@wails build -debug
	@echo "$(GREEN)✓ Debug build completed$(NC)"

.PHONY: build-clean
build-clean: ## Build after cleaning
	@$(MAKE) clean
	@$(MAKE) build

.PHONY: clean
clean: ## Remove build artifacts and generated files
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	@rm -rf $(BUILD_DIR)
	@rm -f $(APP_NAME)
	@rm -rf $(FRONTEND_DIR)/dist
	@rm -rf $(FRONTEND_DIR)/node_modules/.vite
	@echo "$(GREEN)✓ Cleaned successfully$(NC)"

# ========== Frontend Commands ==========

.PHONY: npm-install
npm-install: ## Install frontend dependencies
	@echo "$(YELLOW)Installing frontend dependencies...$(NC)"
	@cd $(FRONTEND_DIR) && npm install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

.PHONY: npm-update
npm-update: ## Update frontend dependencies
	@echo "$(YELLOW)Updating frontend dependencies...$(NC)"
	@cd $(FRONTEND_DIR) && npm update
	@echo "$(GREEN)✓ Dependencies updated$(NC)"

.PHONY: lint
lint: ## Run TypeScript type checking
	@echo "$(YELLOW)Running TypeScript type check...$(NC)"
	@cd $(FRONTEND_DIR) && npm run lint
	@echo "$(GREEN)✓ Type check completed$(NC)"

.PHONY: frontend-build
frontend-build: ## Build frontend assets
	@echo "$(YELLOW)Building frontend...$(NC)"
	@cd $(FRONTEND_DIR) && npm run build
	@echo "$(GREEN)✓ Frontend built successfully$(NC)"

# ========== Testing Commands ==========

.PHONY: test
test: ## Run Go tests
	@echo "$(YELLOW)Running tests...$(NC)"
	@go test ./...
	@echo "$(GREEN)✓ Tests completed$(NC)"

.PHONY: test-coverage
test-coverage: ## Run tests with coverage report
	@echo "$(YELLOW)Running tests with coverage...$(NC)"
	@go test -coverprofile=coverage.out ./...
	@go tool cover -html=coverage.out -o coverage.html
	@echo "$(GREEN)✓ Coverage report generated: coverage.html$(NC)"

.PHONY: test-verbose
test-verbose: ## Run tests in verbose mode
	@echo "$(YELLOW)Running tests (verbose)...$(NC)"
	@go test -v ./...

# ========== Utility Commands ==========

.PHONY: deps
deps: ## Download Go dependencies
	@echo "$(YELLOW)Downloading Go dependencies...$(NC)"
	@go mod download
	@echo "$(GREEN)✓ Dependencies downloaded$(NC)"

.PHONY: tidy
tidy: ## Tidy Go modules
	@echo "$(YELLOW)Tidying Go modules...$(NC)"
	@go mod tidy
	@echo "$(GREEN)✓ Go modules tidied$(NC)"

.PHONY: fmt
fmt: ## Format Go code
	@echo "$(YELLOW)Formatting Go code...$(NC)"
	@go fmt ./...
	@echo "$(GREEN)✓ Code formatted$(NC)"

.PHONY: vet
vet: ## Run Go vet
	@echo "$(YELLOW)Running go vet...$(NC)"
	@go vet ./...
	@echo "$(GREEN)✓ Go vet completed$(NC)"

# ========== Combined Commands ==========

.PHONY: setup
setup: npm-install deps sqlc ## Initial project setup
	@echo "$(GREEN)✓ Project setup completed$(NC)"

.PHONY: check
check: fmt vet lint test ## Run all checks (format, vet, lint, test)
	@echo "$(GREEN)✓ All checks passed$(NC)"

.PHONY: all
all: clean deps npm-install sqlc build ## Clean and rebuild everything
	@echo "$(GREEN)✓ Full build completed$(NC)"

# ========== Git Commands ==========

.PHONY: git-status
git-status: ## Show git status
	@git status

.PHONY: git-diff
git-diff: ## Show git diff
	@git diff

# ========== Docker Commands (if needed in future) ==========

.PHONY: docker-build
docker-build: ## Build Docker image (placeholder)
	@echo "$(YELLOW)Docker support not yet implemented$(NC)"

.PHONY: docker-run
docker-run: ## Run in Docker container (placeholder)
	@echo "$(YELLOW)Docker support not yet implemented$(NC)"

# Prevent make from trying to remake the Makefile
Makefile: ;
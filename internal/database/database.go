package database

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	"cashflow/internal/db/sqlc"
	_ "github.com/mattn/go-sqlite3"
)

type Database struct {
	conn    *sql.DB
	queries *db.Queries
}

func New() (*Database, error) {
	// Get user's home directory for database storage
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, fmt.Errorf("failed to get home directory: %w", err)
	}

	// Create app data directory
	appDataDir := filepath.Join(homeDir, ".cashflow")
	if err := os.MkdirAll(appDataDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create app data directory: %w", err)
	}

	// Database file path
	dbPath := filepath.Join(appDataDir, "cashflow.db")

	// Open database connection
	conn, err := sql.Open("sqlite3", dbPath+"?_foreign_keys=on")
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Set connection pool settings
	conn.SetMaxOpenConns(1) // SQLite doesn't benefit from multiple connections
	conn.SetMaxIdleConns(1)

	// Test connection
	if err := conn.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Run migrations
	if err := runMigrations(conn); err != nil {
		return nil, fmt.Errorf("failed to run migrations: %w", err)
	}

	// Create queries instance
	queries := db.New(conn)

	return &Database{
		conn:    conn,
		queries: queries,
	}, nil
}

func runMigrations(conn *sql.DB) error {
	// Create users table
	usersMigration := `
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL DEFAULT 'Default User',
    email TEXT,
    preferences TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO users (id, name) VALUES ('default', 'Default User');
`

	if _, err := conn.Exec(usersMigration); err != nil {
		return fmt.Errorf("failed to create users table: %w", err)
	}

	// Create simple_transactions tables
	transactionsMigration := `
CREATE TABLE IF NOT EXISTS simple_transactions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'sale', 'purchase')),
    description TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount >= 0),
    transaction_date DATE NOT NULL,
    category TEXT,
    tags TEXT,
    customer_vendor TEXT,
    payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'cheque', 'upi', 'wallet', 'other')),
    payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'partial', 'cancelled')),
    reference_number TEXT,
    invoice_number TEXT,
    notes TEXT,
    attachments TEXT,
    tax_amount REAL DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    net_amount REAL GENERATED ALWAYS AS (amount - discount_amount + tax_amount) STORED,
    currency TEXT DEFAULT 'USD',
    exchange_rate REAL DEFAULT 1.0,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency TEXT CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    recurring_end_date DATE,
    parent_transaction_id TEXT REFERENCES simple_transactions(id),
    created_by TEXT NOT NULL DEFAULT 'default' REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_simple_transactions_date ON simple_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_simple_transactions_type ON simple_transactions(type);
CREATE INDEX IF NOT EXISTS idx_simple_transactions_category ON simple_transactions(category);
CREATE INDEX IF NOT EXISTS idx_simple_transactions_customer_vendor ON simple_transactions(customer_vendor);
CREATE INDEX IF NOT EXISTS idx_simple_transactions_payment_status ON simple_transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_simple_transactions_created_by ON simple_transactions(created_by);
CREATE INDEX IF NOT EXISTS idx_simple_transactions_deleted_at ON simple_transactions(deleted_at);
CREATE INDEX IF NOT EXISTS idx_simple_transactions_amount ON simple_transactions(amount);
`

	if _, err := conn.Exec(transactionsMigration); err != nil {
		return fmt.Errorf("failed to create simple_transactions table: %w", err)
	}

	// Create payment_methods table
	paymentMethodsMigration := `
CREATE TABLE IF NOT EXISTS payment_methods (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO payment_methods (name, description) VALUES
    ('Cash', 'Cash payment'),
    ('Credit Card', 'Credit card payment'),
    ('Debit Card', 'Debit card payment'),
    ('Bank Transfer', 'Bank wire transfer'),
    ('Check', 'Check payment'),
    ('PayPal', 'PayPal digital payment'),
    ('Venmo', 'Venmo digital payment'),
    ('Other', 'Other payment method');
`

	if _, err := conn.Exec(paymentMethodsMigration); err != nil {
		return fmt.Errorf("failed to create payment_methods table: %w", err)
	}

	// Create categories table
	categoriesMigration := `
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'both')),
    color TEXT,
    icon TEXT,
    parent_id TEXT REFERENCES categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO categories (name, type, color, icon) VALUES
    ('Sales Revenue', 'income', '#10B981', 'dollar-sign'),
    ('Service Income', 'income', '#10B981', 'briefcase'),
    ('Other Income', 'income', '#10B981', 'plus-circle'),
    ('Product Purchases', 'expense', '#EF4444', 'shopping-cart'),
    ('Operating Expenses', 'expense', '#EF4444', 'settings'),
    ('Salaries & Wages', 'expense', '#EF4444', 'users'),
    ('Rent', 'expense', '#EF4444', 'home'),
    ('Utilities', 'expense', '#EF4444', 'zap'),
    ('Marketing', 'expense', '#EF4444', 'megaphone'),
    ('Office Supplies', 'expense', '#EF4444', 'paperclip'),
    ('Travel', 'expense', '#EF4444', 'plane'),
    ('Meals & Entertainment', 'expense', '#EF4444', 'coffee'),
    ('Insurance', 'expense', '#EF4444', 'shield'),
    ('Taxes', 'expense', '#EF4444', 'file-text'),
    ('Bank Fees', 'expense', '#EF4444', 'credit-card'),
    ('Professional Services', 'expense', '#EF4444', 'briefcase'),
    ('Equipment', 'expense', '#EF4444', 'tool'),
    ('Software & Subscriptions', 'expense', '#EF4444', 'cloud'),
    ('Repairs & Maintenance', 'expense', '#EF4444', 'wrench'),
    ('Other Expenses', 'expense', '#EF4444', 'minus-circle');
`

	if _, err := conn.Exec(categoriesMigration); err != nil {
		return fmt.Errorf("failed to create categories table: %w", err)
	}

	// Create transactions table (new structure with FK to categories and payment methods)
	newTransactionsMigration := `
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'sale', 'purchase')),
    description TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount >= 0),
    transaction_date DATE NOT NULL,
    category_id TEXT REFERENCES categories(id),
    tags TEXT,
    customer_vendor TEXT,
    payment_method_id TEXT REFERENCES payment_methods(id),
    payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'partial', 'cancelled')),
    reference_number TEXT,
    invoice_number TEXT,
    notes TEXT,
    attachments TEXT,
    tax_amount REAL DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    net_amount REAL GENERATED ALWAYS AS (amount - discount_amount + tax_amount) STORED,
    currency TEXT DEFAULT 'USD',
    exchange_rate REAL DEFAULT 1.0,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency TEXT CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    recurring_end_date DATE,
    parent_transaction_id TEXT REFERENCES transactions(id),
    created_by TEXT NOT NULL DEFAULT 'default' REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_vendor ON transactions(customer_vendor);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON transactions(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON transactions(created_by);
CREATE INDEX IF NOT EXISTS idx_transactions_deleted_at ON transactions(deleted_at);
CREATE INDEX IF NOT EXISTS idx_transactions_amount ON transactions(amount);
`

	if _, err := conn.Exec(newTransactionsMigration); err != nil {
		return fmt.Errorf("failed to create transactions table: %w", err)
	}

	// Create transaction_templates table
	templatesMigration := `
CREATE TABLE IF NOT EXISTS transaction_templates (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'sale', 'purchase')),
    description TEXT,
    amount REAL,
    category TEXT,
    tags TEXT,
    customer_vendor TEXT,
    payment_method TEXT,
    tax_amount REAL DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    notes TEXT,
    usage_count INTEGER DEFAULT 0,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_by TEXT NOT NULL DEFAULT 'default' REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

	if _, err := conn.Exec(templatesMigration); err != nil {
		return fmt.Errorf("failed to create transaction_templates table: %w", err)
	}

	// Create saved_transaction_filters table
	filtersMigration := `
CREATE TABLE IF NOT EXISTS saved_transaction_filters (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    filter_config TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_by TEXT NOT NULL DEFAULT 'default' REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

	if _, err := conn.Exec(filtersMigration); err != nil {
		return fmt.Errorf("failed to create saved_transaction_filters table: %w", err)
	}

	return nil
}

func (d *Database) Close() error {
	return d.conn.Close()
}

func (d *Database) Queries() *db.Queries {
	return d.queries
}

func (d *Database) Conn() *sql.DB {
	return d.conn
}
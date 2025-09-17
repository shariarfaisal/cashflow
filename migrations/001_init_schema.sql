-- +goose Up
-- Complete schema for cashflow application

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT 'default',
    name TEXT NOT NULL,
    email TEXT,
    preferences TEXT, -- JSON configuration
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default user
INSERT INTO users (id, name) VALUES ('default', 'Default User')
ON CONFLICT(id) DO NOTHING;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'both')),
    color TEXT,
    icon TEXT,
    parent_id TEXT REFERENCES categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table with all fields including due_amount
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),

    -- Transaction basics
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'sale', 'purchase')),
    description TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount >= 0),
    transaction_date DATE NOT NULL,

    -- Enhanced fields
    category_id TEXT REFERENCES categories(id),
    tags TEXT, -- JSON array of tags
    customer_vendor TEXT,
    payment_method_id TEXT REFERENCES payment_methods(id),
    payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'partial', 'cancelled')),

    -- Additional details
    reference_number TEXT,
    invoice_number TEXT,
    notes TEXT,
    attachments TEXT, -- JSON array of attachment URLs

    -- Financial details
    tax_amount REAL DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    due_amount REAL DEFAULT 0,
    net_amount REAL GENERATED ALWAYS AS (amount - discount_amount + tax_amount - due_amount) STORED,
    currency TEXT DEFAULT 'USD',
    exchange_rate REAL DEFAULT 1.0,

    -- Recurring transaction support
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency TEXT CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    recurring_end_date DATE,
    parent_transaction_id TEXT REFERENCES transactions(id),

    -- Metadata
    created_by TEXT NOT NULL DEFAULT 'default' REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_vendor ON transactions(customer_vendor);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON transactions(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON transactions(created_by);
CREATE INDEX IF NOT EXISTS idx_transactions_deleted_at ON transactions(deleted_at);
CREATE INDEX IF NOT EXISTS idx_transactions_amount ON transactions(amount);
CREATE INDEX IF NOT EXISTS idx_transactions_due_amount ON transactions(due_amount);

-- Insert default categories
INSERT INTO categories (name, type, color, icon) VALUES
    ('Salary', 'income', '#10B981', 'wallet'),
    ('Freelance', 'income', '#3B82F6', 'briefcase'),
    ('Investment', 'income', '#8B5CF6', 'trending-up'),
    ('Other Income', 'income', '#6B7280', 'plus-circle'),
    ('Food & Dining', 'expense', '#EF4444', 'utensils'),
    ('Transportation', 'expense', '#F59E0B', 'car'),
    ('Shopping', 'expense', '#EC4899', 'shopping-bag'),
    ('Bills & Utilities', 'expense', '#06B6D4', 'file-text'),
    ('Entertainment', 'expense', '#A855F7', 'film'),
    ('Healthcare', 'expense', '#84CC16', 'heart'),
    ('Education', 'expense', '#6366F1', 'book'),
    ('Home & Garden', 'expense', '#F97316', 'home'),
    ('Other Expenses', 'expense', '#6B7280', 'minus-circle')
ON CONFLICT DO NOTHING;

-- Insert default payment methods
INSERT INTO payment_methods (name, description) VALUES
    ('Cash', 'Cash payment'),
    ('Credit Card', 'Credit card payment'),
    ('Debit Card', 'Debit card payment'),
    ('Bank Transfer', 'Bank wire transfer'),
    ('PayPal', 'PayPal payment'),
    ('Venmo', 'Venmo payment'),
    ('Zelle', 'Zelle payment'),
    ('Check', 'Check payment'),
    ('Cryptocurrency', 'Crypto payment'),
    ('Other', 'Other payment method')
ON CONFLICT DO NOTHING;

-- +goose Down
-- Drop all tables in reverse order
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS payment_methods;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
-- +goose Up
-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default payment methods
INSERT OR IGNORE INTO payment_methods (name, description) VALUES
    ('Cash', 'Cash payment'),
    ('Credit Card', 'Credit card payment'),
    ('Debit Card', 'Debit card payment'),
    ('Bank Transfer', 'Bank wire transfer'),
    ('Check', 'Check payment'),
    ('PayPal', 'PayPal digital payment'),
    ('Venmo', 'Venmo digital payment'),
    ('Zelle', 'Zelle digital payment'),
    ('Cryptocurrency', 'Cryptocurrency payment'),
    ('Other', 'Other payment method');

-- Create categories table (already exists, but adding CRUD support)
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

-- Insert default categories if not exists
INSERT OR IGNORE INTO categories (name, type, color, icon) VALUES
    ('Salary', 'income', '#10B981', 'dollar-sign'),
    ('Freelance', 'income', '#3B82F6', 'briefcase'),
    ('Investment', 'income', '#8B5CF6', 'trending-up'),
    ('Other Income', 'income', '#10B981', 'plus-circle'),
    ('Food & Dining', 'expense', '#EF4444', 'utensils'),
    ('Transportation', 'expense', '#F59E0B', 'car'),
    ('Shopping', 'expense', '#EC4899', 'shopping-bag'),
    ('Entertainment', 'expense', '#8B5CF6', 'film'),
    ('Bills & Utilities', 'expense', '#F97316', 'file-text'),
    ('Healthcare', 'expense', '#14B8A6', 'heart'),
    ('Education', 'expense', '#3B82F6', 'book'),
    ('Travel', 'expense', '#06B6D4', 'plane'),
    ('Other Expense', 'expense', '#EF4444', 'minus-circle');

-- Create new transactions table (renamed from simple_transactions)
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),

    -- Transaction basics
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'sale', 'purchase')),
    description TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount >= 0),
    transaction_date DATE NOT NULL,

    -- Enhanced fields (category is now optional, payment_method references payment_methods)
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
    net_amount REAL GENERATED ALWAYS AS (amount - discount_amount + tax_amount) STORED,
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

-- Copy data from simple_transactions to transactions if exists
INSERT INTO transactions (
    id, type, description, amount, transaction_date,
    tags, customer_vendor, payment_status,
    reference_number, invoice_number, notes, attachments,
    tax_amount, discount_amount, currency, exchange_rate,
    is_recurring, recurring_frequency, recurring_end_date, parent_transaction_id,
    created_by, created_at, updated_at, deleted_at
)
SELECT
    id, type, description, amount, transaction_date,
    tags, customer_vendor, payment_status,
    reference_number, invoice_number, notes, attachments,
    tax_amount, discount_amount, currency, exchange_rate,
    is_recurring, recurring_frequency, recurring_end_date, parent_transaction_id,
    created_by, created_at, updated_at, deleted_at
FROM simple_transactions
WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='simple_transactions');

-- Update category names to category_ids based on matching
UPDATE transactions
SET category_id = (SELECT id FROM categories WHERE name =
    (SELECT category FROM simple_transactions WHERE simple_transactions.id = transactions.id))
WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='simple_transactions');

-- Update payment methods to payment_method_ids
UPDATE transactions
SET payment_method_id = (
    SELECT id FROM payment_methods
    WHERE LOWER(name) = LOWER(
        CASE (SELECT payment_method FROM simple_transactions WHERE simple_transactions.id = transactions.id)
            WHEN 'cash' THEN 'Cash'
            WHEN 'card' THEN 'Credit Card'
            WHEN 'bank_transfer' THEN 'Bank Transfer'
            WHEN 'cheque' THEN 'Check'
            WHEN 'upi' THEN 'Other'
            WHEN 'wallet' THEN 'Other'
            WHEN 'other' THEN 'Other'
            ELSE 'Cash'
        END
    )
)
WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='simple_transactions');

-- Create indexes for better query performance
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_customer_vendor ON transactions(customer_vendor);
CREATE INDEX idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX idx_transactions_payment_method ON transactions(payment_method_id);
CREATE INDEX idx_transactions_created_by ON transactions(created_by);
CREATE INDEX idx_transactions_deleted_at ON transactions(deleted_at);
CREATE INDEX idx_transactions_amount ON transactions(amount);

-- Drop old tables and related objects
DROP TABLE IF EXISTS saved_transaction_filters;
DROP TABLE IF EXISTS transaction_templates;
DROP TABLE IF EXISTS transaction_categories;
DROP TABLE IF EXISTS simple_transactions;

-- +goose Down
-- Recreate simple_transactions table
CREATE TABLE IF NOT EXISTS simple_transactions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    transaction_date DATE NOT NULL,
    category TEXT,
    tags TEXT,
    customer_vendor TEXT,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'completed',
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
    recurring_frequency TEXT,
    recurring_end_date DATE,
    parent_transaction_id TEXT,
    created_by TEXT NOT NULL DEFAULT 'default',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Copy data back
INSERT INTO simple_transactions
SELECT
    t.id, t.type, t.description, t.amount, t.transaction_date,
    c.name as category, t.tags, t.customer_vendor,
    pm.name as payment_method, t.payment_status,
    t.reference_number, t.invoice_number, t.notes, t.attachments,
    t.tax_amount, t.discount_amount, t.currency, t.exchange_rate,
    t.is_recurring, t.recurring_frequency, t.recurring_end_date, t.parent_transaction_id,
    t.created_by, t.created_at, t.updated_at, t.deleted_at
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id;

-- Drop new tables
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS payment_methods;
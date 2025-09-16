-- +goose Up
-- Create simple_transactions table for basic bookkeeping
CREATE TABLE IF NOT EXISTS simple_transactions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),

    -- Transaction basics
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'sale', 'purchase')),
    description TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount >= 0),
    transaction_date DATE NOT NULL,

    -- Enhanced fields
    category TEXT,
    tags TEXT, -- JSON array of tags
    customer_vendor TEXT,
    payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'cheque', 'upi', 'wallet', 'other')),
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
    parent_transaction_id TEXT REFERENCES simple_transactions(id),

    -- Metadata
    created_by TEXT NOT NULL DEFAULT 'default' REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    -- Indexes for performance
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create indexes for better query performance
CREATE INDEX idx_simple_transactions_date ON simple_transactions(transaction_date);
CREATE INDEX idx_simple_transactions_type ON simple_transactions(type);
CREATE INDEX idx_simple_transactions_category ON simple_transactions(category);
CREATE INDEX idx_simple_transactions_customer_vendor ON simple_transactions(customer_vendor);
CREATE INDEX idx_simple_transactions_payment_status ON simple_transactions(payment_status);
CREATE INDEX idx_simple_transactions_created_by ON simple_transactions(created_by);
CREATE INDEX idx_simple_transactions_deleted_at ON simple_transactions(deleted_at);
CREATE INDEX idx_simple_transactions_amount ON simple_transactions(amount);

-- Create transaction_categories table for managing categories
CREATE TABLE IF NOT EXISTS transaction_categories (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'both')),
    color TEXT,
    icon TEXT,
    parent_id TEXT REFERENCES transaction_categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT OR IGNORE INTO transaction_categories (name, type, color, icon) VALUES
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

-- Create transaction_templates table for quick entry
CREATE TABLE IF NOT EXISTS transaction_templates (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'sale', 'purchase')),
    description TEXT,
    amount REAL,
    category TEXT,
    tags TEXT, -- JSON array of tags
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

-- Create saved_transaction_filters table
CREATE TABLE IF NOT EXISTS saved_transaction_filters (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    filter_config TEXT NOT NULL, -- JSON configuration
    is_default BOOLEAN DEFAULT FALSE,
    created_by TEXT NOT NULL DEFAULT 'default' REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- +goose Down
DROP TABLE IF EXISTS saved_transaction_filters;
DROP TABLE IF EXISTS transaction_templates;
DROP TABLE IF EXISTS transaction_categories;
DROP TABLE IF EXISTS simple_transactions;
-- name: CreateTransaction :one
INSERT INTO transactions (
    type, description, amount, transaction_date,
    category_id, tags, customer_vendor, payment_method_id,
    payment_status, reference_number, invoice_number,
    notes, attachments, tax_amount, discount_amount,
    currency, exchange_rate, is_recurring, recurring_frequency,
    recurring_end_date, parent_transaction_id, created_by
) VALUES (
    ?, ?, ?, ?,
    ?, ?, ?, ?,
    ?, ?, ?,
    ?, ?, ?, ?,
    ?, ?, ?, ?,
    ?, ?, ?
) RETURNING *;

-- name: GetTransaction :one
SELECT * FROM transactions
WHERE id = ? AND deleted_at IS NULL;

-- name: ListTransactions :many
SELECT * FROM transactions
WHERE deleted_at IS NULL
    AND created_by = sqlc.arg('created_by')
    AND (sqlc.arg('from_date') = '' OR transaction_date >= sqlc.arg('from_date'))
    AND (sqlc.arg('to_date') = '' OR transaction_date <= sqlc.arg('to_date'))
    AND (sqlc.arg('type_filter') = '' OR type = sqlc.arg('type_filter'))
    AND (sqlc.arg('category_filter') = '' OR category_id = sqlc.arg('category_filter'))
    AND (sqlc.arg('payment_status_filter') = '' OR payment_status = sqlc.arg('payment_status_filter'))
    AND (sqlc.arg('customer_vendor_search') = '' OR customer_vendor LIKE '%' || sqlc.arg('customer_vendor_search') || '%')
    AND (sqlc.arg('description_search') = '' OR description LIKE '%' || sqlc.arg('description_search') || '%')
ORDER BY transaction_date DESC, created_at DESC
LIMIT sqlc.arg('limit') OFFSET sqlc.arg('offset');

-- name: UpdateTransaction :one
UPDATE transactions
SET
    type = ?,
    description = ?,
    amount = ?,
    transaction_date = ?,
    category_id = ?,
    tags = ?,
    customer_vendor = ?,
    payment_method_id = ?,
    payment_status = ?,
    reference_number = ?,
    invoice_number = ?,
    notes = ?,
    attachments = ?,
    tax_amount = ?,
    discount_amount = ?,
    currency = ?,
    exchange_rate = ?,
    is_recurring = ?,
    recurring_frequency = ?,
    recurring_end_date = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? AND deleted_at IS NULL
RETURNING *;

-- name: DeleteTransaction :exec
UPDATE transactions
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = ? AND deleted_at IS NULL;

-- name: GetTransactionStats :one
SELECT
    COUNT(CASE WHEN type IN ('income', 'sale') THEN 1 END) as total_income_count,
    COUNT(CASE WHEN type IN ('expense', 'purchase') THEN 1 END) as total_expense_count,
    COALESCE(SUM(CASE WHEN type IN ('income', 'sale') THEN net_amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN type IN ('expense', 'purchase') THEN net_amount ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN type IN ('income', 'sale') THEN net_amount ELSE -net_amount END), 0) as net_profit,
    COUNT(*) as total_transactions,
    COALESCE(AVG(net_amount), 0) as average_transaction,
    COALESCE(SUM(CASE WHEN type IN ('income', 'sale') AND payment_status = 'pending' THEN net_amount ELSE 0 END), 0) as pending_income,
    COALESCE(SUM(CASE WHEN type IN ('expense', 'purchase') AND payment_status = 'pending' THEN net_amount ELSE 0 END), 0) as pending_expenses
FROM transactions
WHERE deleted_at IS NULL
    AND created_by = sqlc.arg('created_by')
    AND (sqlc.arg('from_date') = '' OR transaction_date >= sqlc.arg('from_date'))
    AND (sqlc.arg('to_date') = '' OR transaction_date <= sqlc.arg('to_date'));

-- name: GetTransactionsByCategory :many
SELECT
    category_id,
    type,
    COUNT(*) as count,
    SUM(net_amount) as total_amount
FROM transactions
WHERE deleted_at IS NULL
    AND created_by = sqlc.arg('created_by')
    AND (sqlc.arg('from_date') = '' OR transaction_date >= sqlc.arg('from_date'))
    AND (sqlc.arg('to_date') = '' OR transaction_date <= sqlc.arg('to_date'))
    AND category_id IS NOT NULL
GROUP BY category_id, type
ORDER BY total_amount DESC;

-- name: GetTopCustomersVendors :many
SELECT
    customer_vendor,
    type,
    COUNT(*) as transaction_count,
    SUM(net_amount) as total_amount
FROM transactions
WHERE deleted_at IS NULL
    AND created_by = ?
    AND customer_vendor IS NOT NULL
    AND customer_vendor != ''
    AND (? = '' OR transaction_date >= ?)
    AND (? = '' OR transaction_date <= ?)
GROUP BY customer_vendor, type
ORDER BY total_amount DESC
LIMIT ?;

-- name: GetMonthlyTrend :many
SELECT
    strftime('%Y-%m', transaction_date) as month,
    type,
    COUNT(*) as count,
    SUM(net_amount) as total_amount
FROM transactions
WHERE deleted_at IS NULL
    AND created_by = ?
    AND (? = '' OR transaction_date >= ?)
    AND (? = '' OR transaction_date <= ?)
GROUP BY month, type
ORDER BY month DESC;

-- name: GetDailyTransactionSummary :many
SELECT
    transaction_date,
    SUM(CASE WHEN type IN ('income', 'sale') THEN net_amount ELSE 0 END) as daily_income,
    SUM(CASE WHEN type IN ('expense', 'purchase') THEN net_amount ELSE 0 END) as daily_expense,
    SUM(CASE WHEN type IN ('income', 'sale') THEN net_amount ELSE -net_amount END) as daily_profit,
    COUNT(*) as transaction_count
FROM transactions
WHERE deleted_at IS NULL
    AND created_by = ?
    AND (? = '' OR transaction_date >= ?)
    AND (? = '' OR transaction_date <= ?)
GROUP BY transaction_date
ORDER BY transaction_date DESC;

-- name: SearchTransactions :many
SELECT * FROM transactions
WHERE deleted_at IS NULL
    AND created_by = ?
    AND (
        description LIKE '%' || ? || '%'
        OR customer_vendor LIKE '%' || ? || '%'
        OR reference_number LIKE '%' || ? || '%'
        OR invoice_number LIKE '%' || ? || '%'
        OR notes LIKE '%' || ? || '%'
    )
ORDER BY transaction_date DESC, created_at DESC
LIMIT ? OFFSET ?;

-- name: GetRecentTransactions :many
SELECT * FROM transactions
WHERE deleted_at IS NULL
    AND created_by = ?
ORDER BY created_at DESC
LIMIT ?;

-- name: CountTransactions :one
SELECT COUNT(*) as count FROM transactions
WHERE deleted_at IS NULL
    AND created_by = sqlc.arg('created_by')
    AND (sqlc.arg('from_date') = '' OR transaction_date >= sqlc.arg('from_date'))
    AND (sqlc.arg('to_date') = '' OR transaction_date <= sqlc.arg('to_date'))
    AND (sqlc.arg('type_filter') = '' OR type = sqlc.arg('type_filter'))
    AND (sqlc.arg('category_filter') = '' OR category_id = sqlc.arg('category_filter'))
    AND (sqlc.arg('payment_status_filter') = '' OR payment_status = sqlc.arg('payment_status_filter'))
    AND (sqlc.arg('customer_vendor_search') = '' OR customer_vendor LIKE '%' || sqlc.arg('customer_vendor_search') || '%')
    AND (sqlc.arg('description_search') = '' OR description LIKE '%' || sqlc.arg('description_search') || '%');

-- name: GetDescriptionSuggestions :many
SELECT DISTINCT description, COUNT(*) as frequency
FROM transactions
WHERE deleted_at IS NULL
    AND created_by = ?
    AND description IS NOT NULL
    AND description != ''
    AND (? = '' OR type = ?)
    AND (? = '' OR description LIKE '%' || ? || '%')
GROUP BY description
ORDER BY frequency DESC, description ASC
LIMIT ?;

-- name: GetCustomerVendorSuggestions :many
SELECT DISTINCT customer_vendor, COUNT(*) as frequency
FROM transactions
WHERE deleted_at IS NULL
    AND created_by = ?
    AND customer_vendor IS NOT NULL
    AND customer_vendor != ''
    AND (? = '' OR type = ?)
    AND (? = '' OR customer_vendor LIKE '%' || ? || '%')
GROUP BY customer_vendor
ORDER BY frequency DESC, customer_vendor ASC
LIMIT ?;
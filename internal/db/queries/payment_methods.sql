-- name: CreatePaymentMethod :one
INSERT INTO payment_methods (
    name, description, is_active
) VALUES (
    ?, ?, ?
) RETURNING *;

-- name: GetPaymentMethod :one
SELECT * FROM payment_methods
WHERE id = ?;

-- name: ListPaymentMethods :many
SELECT * FROM payment_methods
ORDER BY name ASC;

-- name: ListActivePaymentMethods :many
SELECT * FROM payment_methods
WHERE is_active = TRUE
ORDER BY name ASC;

-- name: UpdatePaymentMethod :one
UPDATE payment_methods
SET
    name = ?,
    description = ?,
    is_active = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?
RETURNING *;

-- name: DeletePaymentMethod :exec
DELETE FROM payment_methods
WHERE id = ?;

-- name: DeactivatePaymentMethod :exec
UPDATE payment_methods
SET
    is_active = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: GetPaymentMethodName :one
SELECT name FROM payment_methods
WHERE id = ?
LIMIT 1;

-- name: CountTransactionsByPaymentMethod :one
SELECT COUNT(*) as count FROM transactions
WHERE payment_method_id = ? AND deleted_at IS NULL;
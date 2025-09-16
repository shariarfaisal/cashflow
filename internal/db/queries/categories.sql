-- name: CreateCategory :one
INSERT INTO categories (
    name, type, color, icon, parent_id, is_active
) VALUES (
    ?, ?, ?, ?, ?, ?
) RETURNING *;

-- name: GetCategory :one
SELECT * FROM categories
WHERE id = ?;

-- name: ListCategories :many
SELECT * FROM categories
ORDER BY type, name ASC;

-- name: ListActiveCategories :many
SELECT * FROM categories
WHERE is_active = TRUE
ORDER BY type, name ASC;

-- name: ListCategoriesByType :many
SELECT * FROM categories
WHERE (type = ? OR type = 'both')
    AND is_active = TRUE
ORDER BY name ASC;

-- name: UpdateCategory :one
UPDATE categories
SET
    name = ?,
    type = ?,
    color = ?,
    icon = ?,
    parent_id = ?,
    is_active = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?
RETURNING *;

-- name: DeleteCategory :exec
DELETE FROM categories
WHERE id = ?;

-- name: DeactivateCategory :exec
UPDATE categories
SET
    is_active = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- name: GetCategoryByName :one
SELECT * FROM categories
WHERE name = ? AND is_active = TRUE
LIMIT 1;

-- name: GetCategoryName :one
SELECT name FROM categories
WHERE id = ?
LIMIT 1;

-- name: CountTransactionsByCategory :one
SELECT COUNT(*) as count FROM transactions
WHERE category_id = ? AND deleted_at IS NULL;

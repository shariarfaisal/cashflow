package services

import (
	"context"
	"database/sql"
	"fmt"

	"cashflow/internal/database"
	"cashflow/internal/db/sqlc"
)

type CategoryService struct {
	db *database.Database
}

func NewCategoryService(db *database.Database) *CategoryService {
	return &CategoryService{db: db}
}

// Category request/response types
type CreateCategoryParams struct {
	Name      string
	Type      string // 'income', 'expense', 'both'
	Color     string
	Icon      string
	ParentID  string
	IsActive  bool
}

type UpdateCategoryParams struct {
	Name      string
	Type      string
	Color     string
	Icon      string
	ParentID  string
	IsActive  bool
}

// CreateCategory creates a new category
func (s *CategoryService) CreateCategory(ctx context.Context, params CreateCategoryParams) (*db.Category, error) {
	category, err := s.db.Queries().CreateCategory(ctx, db.CreateCategoryParams{
		Name:     params.Name,
		Type:     params.Type,
		Color:    toSqlNullString(params.Color),
		Icon:     toSqlNullString(params.Icon),
		ParentID: toSqlNullString(params.ParentID),
		IsActive: toSqlNullBool(params.IsActive),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create category: %w", err)
	}
	return &category, nil
}

// GetCategory retrieves a category by ID
func (s *CategoryService) GetCategory(ctx context.Context, id string) (*db.Category, error) {
	category, err := s.db.Queries().GetCategory(ctx, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("category not found")
		}
		return nil, fmt.Errorf("failed to get category: %w", err)
	}
	return &category, nil
}

// GetCategoryByName retrieves a category by name
func (s *CategoryService) GetCategoryByName(ctx context.Context, name string) (*db.Category, error) {
	category, err := s.db.Queries().GetCategoryByName(ctx, name)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("category not found")
		}
		return nil, fmt.Errorf("failed to get category: %w", err)
	}
	return &category, nil
}

// ListCategories lists all categories
func (s *CategoryService) ListCategories(ctx context.Context) ([]db.Category, error) {
	categories, err := s.db.Queries().ListCategories(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list categories: %w", err)
	}
	return categories, nil
}

// ListActiveCategories lists only active categories
func (s *CategoryService) ListActiveCategories(ctx context.Context) ([]db.Category, error) {
	categories, err := s.db.Queries().ListActiveCategories(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list active categories: %w", err)
	}
	return categories, nil
}

// ListCategoriesByType lists categories by type (income/expense/both)
func (s *CategoryService) ListCategoriesByType(ctx context.Context, categoryType string) ([]db.Category, error) {
	categories, err := s.db.Queries().ListCategoriesByType(ctx, categoryType)
	if err != nil {
		return nil, fmt.Errorf("failed to list categories by type: %w", err)
	}
	return categories, nil
}

// UpdateCategory updates an existing category
func (s *CategoryService) UpdateCategory(ctx context.Context, id string, params UpdateCategoryParams) (*db.Category, error) {
	category, err := s.db.Queries().UpdateCategory(ctx, db.UpdateCategoryParams{
		ID:       id,
		Name:     params.Name,
		Type:     params.Type,
		Color:    toSqlNullString(params.Color),
		Icon:     toSqlNullString(params.Icon),
		ParentID: toSqlNullString(params.ParentID),
		IsActive: toSqlNullBool(params.IsActive),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update category: %w", err)
	}
	return &category, nil
}

// DeleteCategory deletes a category if no dependencies exist
func (s *CategoryService) DeleteCategory(ctx context.Context, id string) error {
	// Check for dependencies first
	count, err := s.db.Queries().CountTransactionsByCategory(ctx, toSqlNullString(id))
	if err != nil {
		return fmt.Errorf("failed to check category dependencies: %w", err)
	}

	if count > 0 {
		return fmt.Errorf("cannot delete category: it is used in %d transaction(s)", count)
	}

	err = s.db.Queries().DeleteCategory(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete category: %w", err)
	}
	return nil
}

// CheckCategoryDependencies checks if a category has any dependent transactions
func (s *CategoryService) CheckCategoryDependencies(ctx context.Context, id string) (int64, error) {
	count, err := s.db.Queries().CountTransactionsByCategory(ctx, toSqlNullString(id))
	if err != nil {
		return 0, fmt.Errorf("failed to check category dependencies: %w", err)
	}
	return count, nil
}

// DeactivateCategory deactivates a category
func (s *CategoryService) DeactivateCategory(ctx context.Context, id string) error {
	err := s.db.Queries().DeactivateCategory(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to deactivate category: %w", err)
	}
	return nil
}
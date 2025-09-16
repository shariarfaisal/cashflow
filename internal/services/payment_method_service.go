package services

import (
	"context"
	"database/sql"
	"fmt"

	"cashflow/internal/database"
	"cashflow/internal/db/sqlc"
)

type PaymentMethodService struct {
	db *database.Database
}

func NewPaymentMethodService(db *database.Database) *PaymentMethodService {
	return &PaymentMethodService{db: db}
}

// CreatePaymentMethod creates a new payment method
func (s *PaymentMethodService) CreatePaymentMethod(ctx context.Context, name, description string, isActive bool) (*db.PaymentMethod, error) {
	paymentMethod, err := s.db.Queries().CreatePaymentMethod(ctx, db.CreatePaymentMethodParams{
		Name:        name,
		Description: toSqlNullString(description),
		IsActive:    toSqlNullBool(isActive),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create payment method: %w", err)
	}
	return &paymentMethod, nil
}

// GetPaymentMethod retrieves a payment method by ID
func (s *PaymentMethodService) GetPaymentMethod(ctx context.Context, id string) (*db.PaymentMethod, error) {
	paymentMethod, err := s.db.Queries().GetPaymentMethod(ctx, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("payment method not found")
		}
		return nil, fmt.Errorf("failed to get payment method: %w", err)
	}
	return &paymentMethod, nil
}

// ListPaymentMethods lists all payment methods
func (s *PaymentMethodService) ListPaymentMethods(ctx context.Context) ([]db.PaymentMethod, error) {
	paymentMethods, err := s.db.Queries().ListPaymentMethods(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list payment methods: %w", err)
	}
	return paymentMethods, nil
}

// ListActivePaymentMethods lists only active payment methods
func (s *PaymentMethodService) ListActivePaymentMethods(ctx context.Context) ([]db.PaymentMethod, error) {
	paymentMethods, err := s.db.Queries().ListActivePaymentMethods(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list active payment methods: %w", err)
	}
	return paymentMethods, nil
}

// UpdatePaymentMethod updates an existing payment method
func (s *PaymentMethodService) UpdatePaymentMethod(ctx context.Context, id, name, description string, isActive bool) (*db.PaymentMethod, error) {
	paymentMethod, err := s.db.Queries().UpdatePaymentMethod(ctx, db.UpdatePaymentMethodParams{
		ID:          id,
		Name:        name,
		Description: toSqlNullString(description),
		IsActive:    toSqlNullBool(isActive),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update payment method: %w", err)
	}
	return &paymentMethod, nil
}

// DeletePaymentMethod deletes a payment method if no dependencies exist
func (s *PaymentMethodService) DeletePaymentMethod(ctx context.Context, id string) error {
	// Check for dependencies first
	count, err := s.db.Queries().CountTransactionsByPaymentMethod(ctx, toSqlNullString(id))
	if err != nil {
		return fmt.Errorf("failed to check payment method dependencies: %w", err)
	}

	if count > 0 {
		return fmt.Errorf("cannot delete payment method: it is used in %d transaction(s)", count)
	}

	err = s.db.Queries().DeletePaymentMethod(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete payment method: %w", err)
	}
	return nil
}

// CheckPaymentMethodDependencies checks if a payment method has any dependent transactions
func (s *PaymentMethodService) CheckPaymentMethodDependencies(ctx context.Context, id string) (int64, error) {
	count, err := s.db.Queries().CountTransactionsByPaymentMethod(ctx, toSqlNullString(id))
	if err != nil {
		return 0, fmt.Errorf("failed to check payment method dependencies: %w", err)
	}
	return count, nil
}

// DeactivatePaymentMethod deactivates a payment method
func (s *PaymentMethodService) DeactivatePaymentMethod(ctx context.Context, id string) error {
	err := s.db.Queries().DeactivatePaymentMethod(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to deactivate payment method: %w", err)
	}
	return nil
}

// Helper functions are now in utils.go
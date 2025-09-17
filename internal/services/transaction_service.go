package services

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"cashflow/internal/database"
	db "cashflow/internal/db/sqlc"
)

type TransactionService struct {
	db *database.Database
}

func NewTransactionService(db *database.Database) *TransactionService {
	return &TransactionService{db: db}
}

// CreateTransaction creates a new transaction
func (s *TransactionService) CreateTransaction(ctx context.Context, params CreateTransactionParams) (*db.Transaction, error) {
	// Prepare tags and attachments as JSON strings
	tagsJSON, _ := json.Marshal(params.Tags)
	attachmentsJSON, _ := json.Marshal(params.Attachments)

	// Set defaults if not provided
	if params.CreatedBy == "" {
		params.CreatedBy = "default"
	}
	if params.Currency == "" {
		params.Currency = "USD"
	}
	if params.ExchangeRate == 0 {
		params.ExchangeRate = 1.0
	}
	if params.PaymentStatus == "" {
		params.PaymentStatus = "completed"
	}

	// Parse the transaction date
	transactionTime, _ := time.Parse("2006-01-02", params.TransactionDate)

	transaction, err := s.db.Queries().CreateTransaction(ctx, db.CreateTransactionParams{
		Type:                 params.Type,
		Description:          params.Description,
		Amount:               params.Amount,
		TransactionDate:      transactionTime,
		CategoryID:           toSqlNullString(params.Category),
		Tags:                 toSqlNullString(string(tagsJSON)),
		CustomerVendor:       toSqlNullString(params.CustomerVendor),
		PaymentMethodID:      toSqlNullString(params.PaymentMethod),
		PaymentStatus:        toSqlNullString(params.PaymentStatus),
		ReferenceNumber:      toSqlNullString(params.ReferenceNumber),
		InvoiceNumber:        toSqlNullString(params.InvoiceNumber),
		Notes:                toSqlNullString(params.Notes),
		Attachments:          toSqlNullString(string(attachmentsJSON)),
		TaxAmount:            toSqlNullFloat64(params.TaxAmount),
		DiscountAmount:       toSqlNullFloat64(params.DiscountAmount),
		DueAmount:            toSqlNullFloat64(params.DueAmount),
		Currency:             toSqlNullString(params.Currency),
		ExchangeRate:         toSqlNullFloat64(params.ExchangeRate),
		IsRecurring:          toSqlNullBool(params.IsRecurring),
		RecurringFrequency:   toSqlNullString(params.RecurringFrequency),
		RecurringEndDate:     toSqlNullTime(params.RecurringEndDate),
		ParentTransactionID:  toSqlNullString(params.ParentTransactionID),
		CreatedBy:            params.CreatedBy,
	})

	return &transaction, err
}

// GetTransaction retrieves a transaction by ID
func (s *TransactionService) GetTransaction(ctx context.Context, id string) (*db.Transaction, error) {
	transaction, err := s.db.Queries().GetTransaction(ctx, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("transaction not found")
		}
		return nil, err
	}
	return &transaction, nil
}

// Helper function to convert string array to comma-separated string for SQL filtering
func arrayToCommaSeparated(arr []string) string {
	if len(arr) == 0 {
		return ""
	}
	return strings.Join(arr, ",")
}

// ListTransactions lists transactions with filters
func (s *TransactionService) ListTransactions(ctx context.Context, params ListTransactionParams) ([]db.Transaction, error) {
	// Set defaults
	if params.CreatedBy == "" {
		params.CreatedBy = "default"
	}
	if params.Limit == 0 {
		params.Limit = 50
	}

	result, err := s.db.Queries().ListTransactions(ctx, db.ListTransactionsParams{
		CreatedBy:             params.CreatedBy,
		FromDate:              params.FromDate,
		ToDate:                params.ToDate,
		TypeFilter:            arrayToCommaSeparated(params.TypeFilter),
		CategoryFilter:        arrayToCommaSeparated(params.CategoryFilter),
		PaymentStatusFilter:   arrayToCommaSeparated(params.PaymentStatusFilter),
		PaymentMethodFilter:   arrayToCommaSeparated(params.PaymentMethodFilter),
		CustomerVendorSearch:  params.CustomerVendorSearch,
		DescriptionSearch:     params.DescriptionSearch,
		MinDueAmount:          params.MinDueAmount,
		MaxDueAmount:          params.MaxDueAmount,
		Limit:                 int64(params.Limit),
		Offset:                int64(params.Offset),
	})

	return result, err
}

// UpdateTransaction updates an existing transaction
func (s *TransactionService) UpdateTransaction(ctx context.Context, id string, params UpdateTransactionParams) (*db.Transaction, error) {
	// Prepare tags and attachments as JSON strings
	tagsJSON, _ := json.Marshal(params.Tags)
	attachmentsJSON, _ := json.Marshal(params.Attachments)

	// Parse the transaction date
	transactionTime, _ := time.Parse("2006-01-02", params.TransactionDate)

	transaction, err := s.db.Queries().UpdateTransaction(ctx, db.UpdateTransactionParams{
		ID:                   id,
		Type:                 params.Type,
		Description:          params.Description,
		Amount:               params.Amount,
		TransactionDate:      transactionTime,
		CategoryID:           toSqlNullString(params.Category),
		Tags:                 toSqlNullString(string(tagsJSON)),
		CustomerVendor:       toSqlNullString(params.CustomerVendor),
		PaymentMethodID:      toSqlNullString(params.PaymentMethod),
		PaymentStatus:        toSqlNullString(params.PaymentStatus),
		ReferenceNumber:      toSqlNullString(params.ReferenceNumber),
		InvoiceNumber:        toSqlNullString(params.InvoiceNumber),
		Notes:                toSqlNullString(params.Notes),
		Attachments:          toSqlNullString(string(attachmentsJSON)),
		TaxAmount:            toSqlNullFloat64(params.TaxAmount),
		DiscountAmount:       toSqlNullFloat64(params.DiscountAmount),
		DueAmount:            toSqlNullFloat64(params.DueAmount),
		Currency:             toSqlNullString(params.Currency),
		ExchangeRate:         toSqlNullFloat64(params.ExchangeRate),
		IsRecurring:          toSqlNullBool(params.IsRecurring),
		RecurringFrequency:   toSqlNullString(params.RecurringFrequency),
		RecurringEndDate:     toSqlNullTime(params.RecurringEndDate),
	})

	return &transaction, err
}

// DeleteTransaction soft deletes a transaction
func (s *TransactionService) DeleteTransaction(ctx context.Context, id string) error {
	return s.db.Queries().DeleteTransaction(ctx, id)
}

// GetTransactionStats gets transaction statistics
func (s *TransactionService) GetTransactionStats(ctx context.Context, params StatsParams) (*db.GetTransactionStatsRow, error) {
	if params.CreatedBy == "" {
		params.CreatedBy = "default"
	}

	stats, err := s.db.Queries().GetTransactionStats(ctx, db.GetTransactionStatsParams{
		CreatedBy: params.CreatedBy,
		FromDate:  params.FromDate,
		ToDate:    params.ToDate,
	})

	return &stats, err
}

// GetTransactionsByCategory gets transactions grouped by category
func (s *TransactionService) GetTransactionsByCategory(ctx context.Context, params StatsParams) ([]db.GetTransactionsByCategoryRow, error) {
	if params.CreatedBy == "" {
		params.CreatedBy = "default"
	}

	return s.db.Queries().GetTransactionsByCategory(ctx, db.GetTransactionsByCategoryParams{
		CreatedBy: params.CreatedBy,
		FromDate:  params.FromDate,
		ToDate:    params.ToDate,
	})
}

// GetCategories retrieves all transaction categories
func (s *TransactionService) GetCategories(ctx context.Context, typeFilter string) ([]db.Category, error) {
	// For now, ignore typeFilter since SQLC doesn't support it in current query
	return s.db.Queries().ListCategories(ctx)
}

// GetRecentTransactions gets recent transactions
func (s *TransactionService) GetRecentTransactions(ctx context.Context, limit int) ([]db.Transaction, error) {
	return s.db.Queries().GetRecentTransactions(ctx, db.GetRecentTransactionsParams{
		CreatedBy: "default",
		Limit:     int64(limit),
	})
}

// SearchTransactions searches transactions
func (s *TransactionService) SearchTransactions(ctx context.Context, searchTerm string, limit, offset int) ([]db.Transaction, error) {
	return s.db.Queries().SearchTransactions(ctx, db.SearchTransactionsParams{
		CreatedBy:       "default",
		Column2:         toSqlNullString(searchTerm),
		Column3:         toSqlNullString(searchTerm),
		Column4:         toSqlNullString(searchTerm),
		Column5:         toSqlNullString(searchTerm),
		Column6:         toSqlNullString(searchTerm),
		Limit:           int64(limit),
		Offset:          int64(offset),
	})
}

// GetDescriptionSuggestions retrieves description suggestions based on search term and type
func (s *TransactionService) GetDescriptionSuggestions(ctx context.Context, createdBy, transactionType, search string, limit int) ([]SuggestionItem, error) {
	if limit <= 0 {
		limit = 10
	}

	results, err := s.db.Queries().GetDescriptionSuggestions(ctx, db.GetDescriptionSuggestionsParams{
		CreatedBy:  createdBy,
		Column2:    transactionType,
		Column4:    toSqlNullString(search),
		Limit:      int64(limit),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get description suggestions: %w", err)
	}

	suggestions := make([]SuggestionItem, len(results))
	for i, result := range results {
		suggestions[i] = SuggestionItem{
			Value:     result.Description,
			Frequency: result.Frequency,
		}
	}
	return suggestions, nil
}

// GetCustomerVendorSuggestions retrieves customer/vendor suggestions based on search term and type
func (s *TransactionService) GetCustomerVendorSuggestions(ctx context.Context, createdBy, transactionType, search string, limit int) ([]SuggestionItem, error) {
	if limit <= 0 {
		limit = 10
	}

	results, err := s.db.Queries().GetCustomerVendorSuggestions(ctx, db.GetCustomerVendorSuggestionsParams{
		CreatedBy:  createdBy,
		Column2:    transactionType,
		Column4:    toSqlNullString(search),
		Limit:      int64(limit),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get customer/vendor suggestions: %w", err)
	}

	suggestions := make([]SuggestionItem, len(results))
	for i, result := range results {
		suggestions[i] = SuggestionItem{
			Value:     result.CustomerVendor.String,
			Frequency: result.Frequency,
		}
	}
	return suggestions, nil
}

// Parameter types
type CreateTransactionParams struct {
	Type                string    `json:"type"`
	Description         string    `json:"description"`
	Amount              float64   `json:"amount"`
	TransactionDate     string    `json:"transaction_date"`
	Category            string    `json:"category"`
	Tags                []string  `json:"tags"`
	CustomerVendor      string    `json:"customer_vendor"`
	PaymentMethod       string    `json:"payment_method"`
	PaymentStatus       string    `json:"payment_status"`
	ReferenceNumber     string    `json:"reference_number"`
	InvoiceNumber       string    `json:"invoice_number"`
	Notes               string    `json:"notes"`
	Attachments         []string  `json:"attachments"`
	TaxAmount           float64   `json:"tax_amount"`
	DiscountAmount      float64   `json:"discount_amount"`
	DueAmount           float64   `json:"due_amount"`
	Currency            string    `json:"currency"`
	ExchangeRate        float64   `json:"exchange_rate"`
	IsRecurring         bool      `json:"is_recurring"`
	RecurringFrequency  string    `json:"recurring_frequency"`
	RecurringEndDate    string    `json:"recurring_end_date"`
	ParentTransactionID string    `json:"parent_transaction_id"`
	CreatedBy           string    `json:"created_by"`
}

type UpdateTransactionParams struct {
	Type               string   `json:"type"`
	Description        string   `json:"description"`
	Amount             float64  `json:"amount"`
	TransactionDate    string   `json:"transaction_date"`
	Category           string   `json:"category"`
	Tags               []string `json:"tags"`
	CustomerVendor     string   `json:"customer_vendor"`
	PaymentMethod      string   `json:"payment_method"`
	PaymentStatus      string   `json:"payment_status"`
	ReferenceNumber    string   `json:"reference_number"`
	InvoiceNumber      string   `json:"invoice_number"`
	Notes              string   `json:"notes"`
	Attachments        []string `json:"attachments"`
	TaxAmount          float64  `json:"tax_amount"`
	DiscountAmount     float64  `json:"discount_amount"`
	DueAmount          float64  `json:"due_amount"`
	Currency           string   `json:"currency"`
	ExchangeRate       float64  `json:"exchange_rate"`
	IsRecurring        bool     `json:"is_recurring"`
	RecurringFrequency string   `json:"recurring_frequency"`
	RecurringEndDate   string   `json:"recurring_end_date"`
}

type ListTransactionParams struct {
	CreatedBy             string   `json:"created_by"`
	FromDate              string   `json:"from_date"`
	ToDate                string   `json:"to_date"`
	TypeFilter            []string `json:"type"`
	CategoryFilter        []string `json:"category"`
	PaymentStatusFilter   []string `json:"payment_status"`
	PaymentMethodFilter   []string `json:"payment_method"`
	CustomerVendorSearch  string   `json:"customer_vendor"`
	DescriptionSearch     string   `json:"search"`
	MinDueAmount          float64  `json:"min_due_amount"`
	MaxDueAmount          float64  `json:"max_due_amount"`
	Limit                 int      `json:"limit"`
	Offset                int      `json:"offset"`
}

type StatsParams struct {
	CreatedBy string `json:"created_by"`
	FromDate  string `json:"from_date"`
	ToDate    string `json:"to_date"`
}

// SuggestionItem represents a suggestion with frequency
type SuggestionItem struct {
	Value     string `json:"value"`
	Frequency int64  `json:"frequency"`
}

// Helper functions are now in utils.go
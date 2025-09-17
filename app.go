package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"

	"cashflow/internal/database"
	"cashflow/internal/db/sqlc"
	"cashflow/internal/models"
	"cashflow/internal/services"
)

// App struct
type App struct {
	ctx                  context.Context
	userService          *services.UserService
	transactionService   *services.TransactionService
	paymentMethodService *services.PaymentMethodService
	categoryService      *services.CategoryService
	db                   *database.Database
}

// NewApp creates a new App application struct
func NewApp() *App {
	// Initialize database
	database, err := database.New()
	if err != nil {
		panic(fmt.Sprintf("Failed to initialize database: %v", err))
	}

	return &App{
		userService:          services.NewUserService(),
		transactionService:   services.NewTransactionService(database),
		paymentMethodService: services.NewPaymentMethodService(database),
		categoryService:      services.NewCategoryService(database),
		db:                   database,
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// shutdown is called when the app is closing
func (a *App) shutdown(ctx context.Context) {
	if a.db != nil {
		a.db.Close()
	}
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, Welcome to CashFlow!", name)
}

// Transaction Management Methods

// CreateTransaction creates a new transaction
func (a *App) CreateTransaction(params services.CreateTransactionParams) (*TransactionResponse, error) {
	transaction, err := a.transactionService.CreateTransaction(a.ctx, params)
	if err != nil {
		return nil, err
	}
	return a.convertTransaction(transaction), nil
}

// GetTransaction retrieves a transaction by ID
func (a *App) GetTransaction(id string) (*TransactionResponse, error) {
	transaction, err := a.transactionService.GetTransaction(a.ctx, id)
	if err != nil {
		return nil, err
	}
	return a.convertTransaction(transaction), nil
}

// ListTransactions lists transactions with filters
func (a *App) ListTransactions(params services.ListTransactionParams) ([]TransactionResponse, error) {
	transactions, err := a.transactionService.ListTransactions(a.ctx, params)
	if err != nil {
		return nil, err
	}

	result := make([]TransactionResponse, 0, len(transactions))
	for _, t := range transactions {
		result = append(result, *a.convertTransaction(&t))
	}
	return result, nil
}

// UpdateTransaction updates an existing transaction
func (a *App) UpdateTransaction(id string, params services.UpdateTransactionParams) (*TransactionResponse, error) {
	transaction, err := a.transactionService.UpdateTransaction(a.ctx, id, params)
	if err != nil {
		return nil, err
	}
	return a.convertTransaction(transaction), nil
}

// DeleteTransaction deletes a transaction
func (a *App) DeleteTransaction(id string) error {
	return a.transactionService.DeleteTransaction(a.ctx, id)
}

// GetTransactionStats gets transaction statistics
func (a *App) GetTransactionStats(params services.StatsParams) (*TransactionStats, error) {
	stats, err := a.transactionService.GetTransactionStats(a.ctx, params)
	if err != nil {
		return nil, err
	}

	// Helper function to convert interface{} to float64
	toFloat64 := func(i interface{}) float64 {
		if i == nil {
			return 0
		}
		switch v := i.(type) {
		case float64:
			return v
		case int64:
			return float64(v)
		default:
			return 0
		}
	}

	return &TransactionStats{
		TotalIncome:        toFloat64(stats.TotalIncome),
		TotalExpenses:      toFloat64(stats.TotalExpenses),
		NetProfit:          toFloat64(stats.NetProfit),
		TotalTransactions:  int(stats.TotalTransactions),
		TotalIncomeCount:   int(stats.TotalIncomeCount),
		TotalExpenseCount:  int(stats.TotalExpenseCount),
		AverageTransaction: toFloat64(stats.AverageTransaction),
		PendingIncome:      toFloat64(stats.PendingIncome),
		PendingExpenses:    toFloat64(stats.PendingExpenses),
	}, nil
}

// GetTransactionsByCategory gets transactions grouped by category
func (a *App) GetTransactionsByCategory(params services.StatsParams) ([]CategorySummary, error) {
	categories, err := a.transactionService.GetTransactionsByCategory(a.ctx, params)
	if err != nil {
		return nil, err
	}

	result := make([]CategorySummary, 0, len(categories))
	for _, c := range categories {
		result = append(result, CategorySummary{
			Category:    nullStringToString(c.CategoryID),
			Type:        c.Type,
			Count:       int(c.Count),
			TotalAmount: nullFloat64ToFloat64(c.TotalAmount),
		})
	}
	return result, nil
}

// Category Management Methods

// CreateCategory creates a new category
func (a *App) CreateCategory(params services.CreateCategoryParams) (*CategoryResponse, error) {
	category, err := a.categoryService.CreateCategory(a.ctx, params)
	if err != nil {
		return nil, err
	}
	return convertCategory(category), nil
}

// GetCategory retrieves a category by ID
func (a *App) GetCategory(id string) (*CategoryResponse, error) {
	category, err := a.categoryService.GetCategory(a.ctx, id)
	if err != nil {
		return nil, err
	}
	return convertCategory(category), nil
}

// ListCategories lists all categories
func (a *App) ListCategories() ([]CategoryResponse, error) {
	categories, err := a.categoryService.ListCategories(a.ctx)
	if err != nil {
		return nil, err
	}

	result := make([]CategoryResponse, 0, len(categories))
	for _, c := range categories {
		result = append(result, *convertCategory(&c))
	}
	return result, nil
}

// ListActiveCategories lists only active categories
func (a *App) ListActiveCategories() ([]CategoryResponse, error) {
	categories, err := a.categoryService.ListActiveCategories(a.ctx)
	if err != nil {
		return nil, err
	}

	result := make([]CategoryResponse, 0, len(categories))
	for _, c := range categories {
		result = append(result, *convertCategory(&c))
	}
	return result, nil
}

// ListCategoriesByType lists categories by type
func (a *App) ListCategoriesByType(categoryType string) ([]CategoryResponse, error) {
	categories, err := a.categoryService.ListCategoriesByType(a.ctx, categoryType)
	if err != nil {
		return nil, err
	}

	result := make([]CategoryResponse, 0, len(categories))
	for _, c := range categories {
		result = append(result, *convertCategory(&c))
	}
	return result, nil
}

// UpdateCategory updates an existing category
func (a *App) UpdateCategory(id string, params services.UpdateCategoryParams) (*CategoryResponse, error) {
	category, err := a.categoryService.UpdateCategory(a.ctx, id, params)
	if err != nil {
		return nil, err
	}
	return convertCategory(category), nil
}

// DeleteCategory deletes a category
func (a *App) DeleteCategory(id string) error {
	return a.categoryService.DeleteCategory(a.ctx, id)
}

// DeactivateCategory deactivates a category
func (a *App) DeactivateCategory(id string) error {
	return a.categoryService.DeactivateCategory(a.ctx, id)
}

// CheckCategoryDependencies checks if a category has dependent transactions
func (a *App) CheckCategoryDependencies(id string) (int64, error) {
	return a.categoryService.CheckCategoryDependencies(a.ctx, id)
}

// Payment Method Management Methods

// CreatePaymentMethod creates a new payment method
func (a *App) CreatePaymentMethod(name, description string, isActive bool) (*PaymentMethodResponse, error) {
	paymentMethod, err := a.paymentMethodService.CreatePaymentMethod(a.ctx, name, description, isActive)
	if err != nil {
		return nil, err
	}
	return convertPaymentMethod(paymentMethod), nil
}

// GetPaymentMethod retrieves a payment method by ID
func (a *App) GetPaymentMethod(id string) (*PaymentMethodResponse, error) {
	paymentMethod, err := a.paymentMethodService.GetPaymentMethod(a.ctx, id)
	if err != nil {
		return nil, err
	}
	return convertPaymentMethod(paymentMethod), nil
}

// ListPaymentMethods lists all payment methods
func (a *App) ListPaymentMethods() ([]PaymentMethodResponse, error) {
	paymentMethods, err := a.paymentMethodService.ListPaymentMethods(a.ctx)
	if err != nil {
		return nil, err
	}

	result := make([]PaymentMethodResponse, 0, len(paymentMethods))
	for _, pm := range paymentMethods {
		result = append(result, *convertPaymentMethod(&pm))
	}
	return result, nil
}

// ListActivePaymentMethods lists only active payment methods
func (a *App) ListActivePaymentMethods() ([]PaymentMethodResponse, error) {
	paymentMethods, err := a.paymentMethodService.ListActivePaymentMethods(a.ctx)
	if err != nil {
		return nil, err
	}

	result := make([]PaymentMethodResponse, 0, len(paymentMethods))
	for _, pm := range paymentMethods {
		result = append(result, *convertPaymentMethod(&pm))
	}
	return result, nil
}

// UpdatePaymentMethod updates an existing payment method
func (a *App) UpdatePaymentMethod(id, name, description string, isActive bool) (*PaymentMethodResponse, error) {
	paymentMethod, err := a.paymentMethodService.UpdatePaymentMethod(a.ctx, id, name, description, isActive)
	if err != nil {
		return nil, err
	}
	return convertPaymentMethod(paymentMethod), nil
}

// DeletePaymentMethod deletes a payment method
func (a *App) DeletePaymentMethod(id string) error {
	return a.paymentMethodService.DeletePaymentMethod(a.ctx, id)
}

// DeactivatePaymentMethod deactivates a payment method
func (a *App) DeactivatePaymentMethod(id string) error {
	return a.paymentMethodService.DeactivatePaymentMethod(a.ctx, id)
}

// CheckPaymentMethodDependencies checks if a payment method has dependent transactions
func (a *App) CheckPaymentMethodDependencies(id string) (int64, error) {
	return a.paymentMethodService.CheckPaymentMethodDependencies(a.ctx, id)
}

// SearchTransactions searches transactions
func (a *App) SearchTransactions(searchTerm string, limit, offset int) ([]TransactionResponse, error) {
	if limit == 0 {
		limit = 50
	}

	transactions, err := a.transactionService.SearchTransactions(a.ctx, searchTerm, limit, offset)
	if err != nil {
		return nil, err
	}

	result := make([]TransactionResponse, 0, len(transactions))
	for _, t := range transactions {
		result = append(result, *a.convertTransaction(&t))
	}
	return result, nil
}

// GetRecentTransactions gets recent transactions
func (a *App) GetRecentTransactions(limit int) ([]TransactionResponse, error) {
	if limit == 0 {
		limit = 10
	}

	transactions, err := a.transactionService.GetRecentTransactions(a.ctx, limit)
	if err != nil {
		return nil, err
	}

	result := make([]TransactionResponse, 0, len(transactions))
	for _, t := range transactions {
		result = append(result, *a.convertTransaction(&t))
	}
	return result, nil
}

// GetDescriptionSuggestions retrieves description suggestions for auto-complete
func (a *App) GetDescriptionSuggestions(transactionType, search string) ([]services.SuggestionItem, error) {
	return a.transactionService.GetDescriptionSuggestions(a.ctx, "default", transactionType, search, 10)
}

// GetCustomerVendorSuggestions retrieves customer/vendor suggestions for auto-complete
func (a *App) GetCustomerVendorSuggestions(transactionType, search string) ([]services.SuggestionItem, error) {
	return a.transactionService.GetCustomerVendorSuggestions(a.ctx, "default", transactionType, search, 10)
}

// User Management Methods (keeping existing)

// GetUser retrieves a user by ID
func (a *App) GetUser(id string) (*models.User, error) {
	return a.userService.GetUser(id)
}

// CreateUser creates a new user
func (a *App) CreateUser(req models.UserCreateRequest) (*models.User, error) {
	return a.userService.CreateUser(&req)
}

// UpdateUser updates an existing user
func (a *App) UpdateUser(id string, req models.UserUpdateRequest) (*models.User, error) {
	return a.userService.UpdateUser(id, &req)
}

// DeleteUser deletes a user by ID
func (a *App) DeleteUser(id string) error {
	return a.userService.DeleteUser(id)
}

// Response types for frontend

type TransactionResponse struct {
	ID                  string   `json:"id"`
	Type                string   `json:"type"`
	Description         string   `json:"description"`
	Amount              float64  `json:"amount"`
	TransactionDate     string   `json:"transaction_date"`
	Category            string   `json:"category"`
	CategoryID          string   `json:"category_id"`
	Tags                []string `json:"tags"`
	CustomerVendor      string   `json:"customer_vendor"`
	PaymentMethod       string   `json:"payment_method"`
	PaymentMethodID     string   `json:"payment_method_id"`
	PaymentStatus       string   `json:"payment_status"`
	ReferenceNumber     string   `json:"reference_number"`
	InvoiceNumber       string   `json:"invoice_number"`
	Notes               string   `json:"notes"`
	Attachments         []string `json:"attachments"`
	TaxAmount           float64  `json:"tax_amount"`
	DiscountAmount      float64  `json:"discount_amount"`
	DueAmount           float64  `json:"due_amount"`
	NetAmount           float64  `json:"net_amount"`
	Currency            string   `json:"currency"`
	ExchangeRate        float64  `json:"exchange_rate"`
	IsRecurring         bool     `json:"is_recurring"`
	RecurringFrequency  string   `json:"recurring_frequency"`
	RecurringEndDate    string   `json:"recurring_end_date"`
	ParentTransactionID string   `json:"parent_transaction_id"`
	CreatedBy           string   `json:"created_by"`
	CreatedAt           string   `json:"created_at"`
	UpdatedAt           string   `json:"updated_at"`
}

type TransactionStats struct {
	TotalIncome        float64 `json:"total_income"`
	TotalExpenses      float64 `json:"total_expenses"`
	NetProfit          float64 `json:"net_profit"`
	TotalTransactions  int     `json:"total_transactions"`
	TotalIncomeCount   int     `json:"total_income_count"`
	TotalExpenseCount  int     `json:"total_expense_count"`
	AverageTransaction float64 `json:"average_transaction"`
	PendingIncome      float64 `json:"pending_income"`
	PendingExpenses    float64 `json:"pending_expenses"`
}

type CategorySummary struct {
	Category    string  `json:"category"`
	Type        string  `json:"type"`
	Count       int     `json:"count"`
	TotalAmount float64 `json:"total_amount"`
}

type CategoryResponse struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Type      string `json:"type"`
	Color     string `json:"color"`
	Icon      string `json:"icon"`
	ParentID  string `json:"parent_id"`
	IsActive  bool   `json:"is_active"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type PaymentMethodResponse struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	IsActive    bool   `json:"is_active"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

// Helper functions

func (a *App) convertTransaction(t *db.Transaction) *TransactionResponse {
	var tags []string
	var attachments []string

	if t.Tags.Valid && t.Tags.String != "" {
		json.Unmarshal([]byte(t.Tags.String), &tags)
	}
	if t.Attachments.Valid && t.Attachments.String != "" {
		json.Unmarshal([]byte(t.Attachments.String), &attachments)
	}

	// Get category name if category_id is present
	categoryName := ""
	if t.CategoryID.Valid && t.CategoryID.String != "" {
		if name, err := a.db.Queries().GetCategoryName(a.ctx, t.CategoryID.String); err == nil {
			categoryName = name
		}
	}

	// Get payment method name if payment_method_id is present
	paymentMethodName := ""
	if t.PaymentMethodID.Valid && t.PaymentMethodID.String != "" {
		if name, err := a.db.Queries().GetPaymentMethodName(a.ctx, t.PaymentMethodID.String); err == nil {
			paymentMethodName = name
		}
	}

	return &TransactionResponse{
		ID:                  t.ID,
		Type:                t.Type,
		Description:         t.Description,
		Amount:              t.Amount,
		TransactionDate:     t.TransactionDate.Format("2006-01-02"),
		Category:            categoryName,
		CategoryID:          nullStringToString(t.CategoryID),
		Tags:                tags,
		CustomerVendor:      nullStringToString(t.CustomerVendor),
		PaymentMethod:       paymentMethodName,
		PaymentMethodID:     nullStringToString(t.PaymentMethodID),
		PaymentStatus:       nullStringToString(t.PaymentStatus),
		ReferenceNumber:     nullStringToString(t.ReferenceNumber),
		InvoiceNumber:       nullStringToString(t.InvoiceNumber),
		Notes:               nullStringToString(t.Notes),
		Attachments:         attachments,
		TaxAmount:           nullFloat64ToFloat64(t.TaxAmount),
		DiscountAmount:      nullFloat64ToFloat64(t.DiscountAmount),
		DueAmount:           nullFloat64ToFloat64(t.DueAmount),
		NetAmount:           nullFloat64ToFloat64(t.NetAmount),
		Currency:            nullStringToString(t.Currency),
		ExchangeRate:        nullFloat64ToFloat64(t.ExchangeRate),
		IsRecurring:         nullBoolToBool(t.IsRecurring),
		RecurringFrequency:  nullStringToString(t.RecurringFrequency),
		RecurringEndDate:    nullTimeToString(t.RecurringEndDate),
		ParentTransactionID: nullStringToString(t.ParentTransactionID),
		CreatedBy:           t.CreatedBy,
		CreatedAt:           nullTimeToString(t.CreatedAt),
		UpdatedAt:           nullTimeToString(t.UpdatedAt),
	}
}

func nullStringToString(ns sql.NullString) string {
	if ns.Valid {
		return ns.String
	}
	return ""
}

func nullFloat64ToFloat64(nf sql.NullFloat64) float64 {
	if nf.Valid {
		return nf.Float64
	}
	return 0
}

func nullBoolToBool(nb sql.NullBool) bool {
	if nb.Valid {
		return nb.Bool
	}
	return false
}

func nullTimeToString(nt sql.NullTime) string {
	if nt.Valid {
		return nt.Time.Format("2006-01-02")
	}
	return ""
}

func convertCategory(c *db.Category) *CategoryResponse {
	return &CategoryResponse{
		ID:        c.ID,
		Name:      c.Name,
		Type:      c.Type,
		Color:     nullStringToString(c.Color),
		Icon:      nullStringToString(c.Icon),
		ParentID:  nullStringToString(c.ParentID),
		IsActive:  nullBoolToBool(c.IsActive),
		CreatedAt: nullTimeToString(c.CreatedAt),
		UpdatedAt: nullTimeToString(c.UpdatedAt),
	}
}

func convertPaymentMethod(pm *db.PaymentMethod) *PaymentMethodResponse {
	return &PaymentMethodResponse{
		ID:          pm.ID,
		Name:        pm.Name,
		Description: nullStringToString(pm.Description),
		IsActive:    nullBoolToBool(pm.IsActive),
		CreatedAt:   nullTimeToString(pm.CreatedAt),
		UpdatedAt:   nullTimeToString(pm.UpdatedAt),
	}
}
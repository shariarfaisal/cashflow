package services

import (
	"database/sql"
	"time"
)

// toSqlNullString converts a string to sql.NullString
func toSqlNullString(s string) sql.NullString {
	return sql.NullString{
		String: s,
		Valid:  s != "",
	}
}

// toSqlNullFloat64 converts a float64 to sql.NullFloat64
func toSqlNullFloat64(f float64) sql.NullFloat64 {
	return sql.NullFloat64{
		Float64: f,
		Valid:   true,
	}
}

// toSqlNullBool converts a bool to sql.NullBool
func toSqlNullBool(b bool) sql.NullBool {
	return sql.NullBool{
		Bool:  b,
		Valid: true,
	}
}

// toSqlNullTime converts a string to sql.NullTime
func toSqlNullTime(s string) sql.NullTime {
	if s == "" {
		return sql.NullTime{Valid: false}
	}
	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		return sql.NullTime{Valid: false}
	}
	return sql.NullTime{
		Time:  t,
		Valid: true,
	}
}
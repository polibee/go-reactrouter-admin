package config

import "strings"

func normalizeDatabaseConnection(value string) string {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "mysql":
		return "mysql"
	case "postgres", "postgresql":
		return "postgres"
	default:
		return "postgres"
	}
}

func defaultDatabasePort(connection string) string {
	if connection == "mysql" {
		return "3306"
	}
	return "5432"
}

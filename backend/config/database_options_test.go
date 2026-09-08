package config

import "testing"

func TestNormalizeDatabaseConnectionSupportsOnlyConfiguredDrivers(t *testing.T) {
	tests := []struct {
		name string
		got  string
		want string
	}{
		{name: "mysql", got: "mysql", want: "mysql"},
		{name: "postgres alias", got: "postgresql", want: "postgres"},
		{name: "empty defaults to postgres", got: "", want: "postgres"},
		{name: "unknown defaults to postgres", got: "sqlite", want: "postgres"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := normalizeDatabaseConnection(tt.got); got != tt.want {
				t.Fatalf("normalizeDatabaseConnection(%q) = %q, want %q", tt.got, got, tt.want)
			}
		})
	}
}

func TestDefaultDatabasePortFollowsConnection(t *testing.T) {
	if got := defaultDatabasePort("mysql"); got != "3306" {
		t.Fatalf("mysql port = %q, want 3306", got)
	}
	if got := defaultDatabasePort("postgres"); got != "5432" {
		t.Fatalf("postgres port = %q, want 5432", got)
	}
}

package controllers

import "testing"

func TestNormalizeListQueryUsesSafeDefaults(t *testing.T) {
	query := normalizeListQuery(0, 0, "  admin  ")

	if query.Page != 1 {
		t.Fatalf("expected page 1, got %d", query.Page)
	}
	if query.PageSize != 25 {
		t.Fatalf("expected page size 25, got %d", query.PageSize)
	}
	if query.Search != "admin" {
		t.Fatalf("expected trimmed search, got %q", query.Search)
	}
}

func TestNormalizeListQueryClampsPageSize(t *testing.T) {
	if query := normalizeListQuery(-4, 500, ""); query.Page != 1 || query.PageSize != 100 {
		t.Fatalf("expected clamped query, got %+v", query)
	}

	if query := normalizeListQuery(3, 10, ""); query.Page != 3 || query.PageSize != 10 {
		t.Fatalf("expected valid query unchanged, got %+v", query)
	}
}

package controllers

import (
	"strings"

	contractshttp "github.com/goravel/framework/contracts/http"
)

const (
	defaultPageSize = 25
	maxPageSize     = 100
)

// ListQuery is the transport-level pagination and search contract shared by
// Core resource list endpoints.
type ListQuery struct {
	Page     int
	PageSize int
	Search   string
}

func normalizeListQuery(page, pageSize int, search string) ListQuery {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = defaultPageSize
	}
	if pageSize > maxPageSize {
		pageSize = maxPageSize
	}

	return ListQuery{Page: page, PageSize: pageSize, Search: strings.TrimSpace(search)}
}

func listQueryFromRequest(ctx contractshttp.Context) ListQuery {
	return normalizeListQuery(
		ctx.Request().InputInt("page", 1),
		ctx.Request().InputInt("pageSize", defaultPageSize),
		ctx.Request().Input("search"),
	)
}

# API Conventions

## Base paths

- Core API: `/api/v1`
- Admin API: `/api/v1/admin`
- Runtime plugin API: `/api/v1/plugins/{pluginId}`
- Aggregated OpenAPI: `/openapi.json`
- Plugin OpenAPI: `/openapi/plugins/{pluginId}.json`
- Core authentication contract: `contracts/core-auth.openapi.json`

Core browser authentication uses an HttpOnly `go_reactrouter_access_token`
cookie. API clients may also send the same JWT as a standard `Authorization:
Bearer <token>` header. The backend accepts both forms, while frontend browser
code uses `credentials: include` and never reads the token directly.

## Success response

```json
{
  "data": {},
  "message": "",
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 0
  },
  "requestId": "request-id"
}
```

## Error response

```json
{
  "error": {
    "code": "validation_failed",
    "message": "The request is invalid.",
    "fields": {
      "email": ["The email is invalid."]
    }
  },
  "requestId": "request-id"
}
```

## Resource list query

The first remote provider supports:

```text
page
pageSize
search
sort
filter[field]
```

The frontend maps this contract to `ResourceDataProvider<T>` and never assembles endpoint URLs in resource pages.

## Required status codes

| Status | Meaning |
| --- | --- |
| 200 | Successful read or update |
| 201 | Successful create |
| 204 | Successful delete with no body |
| 401 | Missing or expired authentication |
| 403 | Authenticated but unauthorized |
| 404 | Resource or route not found |
| 409 | Conflict |
| 422 | Validation failure |
| 429 | Rate limited |
| 500 | Unexpected server failure |

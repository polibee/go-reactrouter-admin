package contracts

// APIMeta contains optional pagination information shared by Core and plugin
// APIs. It intentionally stays transport-focused so domain packages do not
// depend on HTTP framework types.
type APIMeta struct {
	Page     int `json:"page,omitempty"`
	PageSize int `json:"pageSize,omitempty"`
	Total    int `json:"total,omitempty"`
}

type APIResponse[T any] struct {
	Data      T        `json:"data"`
	Message   string   `json:"message,omitempty"`
	Meta      *APIMeta `json:"meta,omitempty"`
	RequestID string   `json:"requestId,omitempty"`
}

type APIFieldErrors map[string][]string

type APIError struct {
	Code    string         `json:"code"`
	Message string         `json:"message"`
	Fields  APIFieldErrors `json:"fields,omitempty"`
}

type APIErrorResponse struct {
	Error     APIError `json:"error"`
	RequestID string   `json:"requestId,omitempty"`
}

func Success[T any](data T) APIResponse[T] {
	return APIResponse[T]{Data: data}
}

func Failure(code, message string) APIErrorResponse {
	return APIErrorResponse{Error: APIError{Code: code, Message: message}}
}

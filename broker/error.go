package broker

// EventError represents an event code which provides a more de.
type EventError struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
}

// Error implements error interface.
func (e *EventError) Error() string { return e.Message }

// Represents a set of errors used in the handlers.
var (
	ErrBadRequest      = &EventError{Status: 400, Message: "The request was invalid or cannot be otherwise served."}
	ErrUnauthorized    = &EventError{Status: 401, Message: "The security key provided is not authorized to perform this operation."}
	ErrPaymentRequired = &EventError{Status: 402, Message: "The request can not be served, as the payment is required to proceed."}
	ErrForbidden       = &EventError{Status: 403, Message: "The request is understood, but it has been refused or access is not allowed."}
	ErrNotFound        = &EventError{Status: 404, Message: "The resource requested does not exist."}
	ErrServerError     = &EventError{Status: 500, Message: "An unexpected condition was encountered and no more specific message is suitable."}
	ErrNotImplemented  = &EventError{Status: 501, Message: "The server either does not recognize the request method, or it lacks the ability to fulfill the request."}
)

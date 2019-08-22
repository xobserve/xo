package http

const (
	// StatusContinue RFC 7231, 6.2.1
	StatusContinue = 100
	// StatusSwitchingProtocols RFC 7231, 6.2.2
	StatusSwitchingProtocols = 101
	//StatusProcessing RFC 2518, 10.1
	StatusProcessing = 102

	// StatusOK RFC 7231, 6.3.1
	StatusOK = 200
	// StatusCreated RFC 7231, 6.3.2
	StatusCreated = 201
	// StatusAccepted RFC 7231, 6.3.3
	StatusAccepted = 202
	// StatusNonAuthoritativeInfo RFC 7231, 6.3.4
	StatusNonAuthoritativeInfo = 203
	// StatusNoContent RFC 7231, 6.3.5
	StatusNoContent = 204
	// StatusResetContent RFC 7231, 6.3.6
	StatusResetContent = 205
	// StatusPartialContent RFC 7233, 4.1
	StatusPartialContent = 206
	// StatusMultiStatus RFC 4918, 11.1
	StatusMultiStatus = 207
	// StatusAlreadyReported RFC 5842, 7.1
	StatusAlreadyReported = 208
	// StatusIMUsed RFC 3229, 10.4.1
	StatusIMUsed = 226
	// StatusMultipleChoices RFC 7231, 6.4.1
	StatusMultipleChoices = 300
	// StatusMovedPermanently RFC 7231, 6.4.2
	StatusMovedPermanently = 301
	// StatusFound RFC 7231, 6.4.3
	StatusFound = 302
	// StatusSeeOther RFC 7231, 6.4.4
	StatusSeeOther = 303
	// StatusNotModified RFC 7232, 4.1
	StatusNotModified = 304
	// StatusUseProxy RFC 7231, 6.4.5
	StatusUseProxy = 305
	_              = 306
	// StatusTemporaryRedirect RFC 7231, 6.4.7
	StatusTemporaryRedirect = 307
	// StatusPermanentRedirect RFC 7538, 3
	StatusPermanentRedirect = 308

	// StatusBadRequest RFC 7231, 6.5.1
	StatusBadRequest = 400
	// StatusUnauthorized RFC 7235, 3.1
	StatusUnauthorized = 401
	// StatusPaymentRequired RFC 7231, 6.5.2
	StatusPaymentRequired = 402
	// StatusForbidden RFC 7231, 6.5.3
	StatusForbidden = 403
	// StatusNotFound RFC 7231, 6.5.4
	StatusNotFound = 404
	// StatusMethodNotAllowed RFC 7231, 6.5.5
	StatusMethodNotAllowed = 405
	// StatusNotAcceptable RFC 7231, 6.5.6
	StatusNotAcceptable = 406
	// StatusProxyAuthRequired RFC 7235, 3.2
	StatusProxyAuthRequired = 407
	// StatusRequestTimeout RFC 7231, 6.5.7
	StatusRequestTimeout = 408
	// StatusConflict RFC 7231, 6.5.8
	StatusConflict = 409
	// StatusGone RFC 7231, 6.5.9
	StatusGone = 410
	// StatusLengthRequired RFC 7231, 6.5.10
	StatusLengthRequired = 411
	// StatusPreconditionFailed RFC 7232, 4.2
	StatusPreconditionFailed = 412
	// StatusRequestEntityTooLarge RFC 7231, 6.5.11
	StatusRequestEntityTooLarge = 413
	// StatusRequestURITooLong RFC 7231, 6.5.12
	StatusRequestURITooLong = 414
	// StatusUnsupportedMediaType RFC 7231, 6.5.13
	StatusUnsupportedMediaType = 415
	// StatusRequestedRangeNotSatisfiable RFC 7233, 4.4
	StatusRequestedRangeNotSatisfiable = 416
	// StatusExpectationFailed RFC 7231, 6.5.14
	StatusExpectationFailed = 417
	// StatusTeapot RFC 7168, 2.3.3
	StatusTeapot = 418
	// StatusMisdirectedRequest RFC 7540, 9.1.2
	StatusMisdirectedRequest = 421
	// StatusUnprocessableEntity RFC 4918, 11.2
	StatusUnprocessableEntity = 422
	// StatusLocked RFC 4918, 11.3
	StatusLocked = 423
	// StatusFailedDependency RFC 4918, 11.4
	StatusFailedDependency = 424
	// StatusTooEarly RFC 8470, 5.2.
	StatusTooEarly = 425
	// StatusUpgradeRequired RFC 7231, 6.5.15
	StatusUpgradeRequired = 426
	// StatusPreconditionRequired RFC 6585, 3
	StatusPreconditionRequired = 428
	// StatusTooManyRequests RFC 6585, 4
	StatusTooManyRequests = 429
	// StatusRequestHeaderFieldsTooLarge RFC 6585, 5
	StatusRequestHeaderFieldsTooLarge = 431
	// StatusUnavailableForLegalReasons RFC 7725, 3
	StatusUnavailableForLegalReasons = 451

	// StatusInternalServerError RFC 7231, 6.6.1
	StatusInternalServerError = 500
	// StatusNotImplemented RFC 7231, 6.6.2
	StatusNotImplemented = 501
	// StatusBadGateway RFC 7231, 6.6.3
	StatusBadGateway = 502
	// StatusServiceUnavailable RFC 7231, 6.6.4
	StatusServiceUnavailable = 503
	// StatusGatewayTimeout RFC 7231, 6.6.5
	StatusGatewayTimeout = 504
	// StatusHTTPVersionNotSupported RFC 7231, 6.6.6
	StatusHTTPVersionNotSupported = 505
	// StatusVariantAlsoNegotiates RFC 2295, 8.1
	StatusVariantAlsoNegotiates = 506
	// StatusInsufficientStorage RFC 4918, 11.5
	StatusInsufficientStorage = 507
	// StatusLoopDetected RFC 5842, 7.2
	StatusLoopDetected = 508
	// StatusNotExtended RFC 2774, 7
	StatusNotExtended = 510
	// StatusNetworkAuthenticationRequired RFC 6585, 6
	StatusNetworkAuthenticationRequired = 511
)

package misc

import (
	"encoding/base64"

	"go.uber.org/zap"
)

// Logger is the log interface
var Logger *zap.Logger

// Base64 is the base64 handler
var Base64 = base64.NewEncoding("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/")

package utils

import (
	"encoding/hex"

	"go.opentelemetry.io/collector/pdata/pcommon"
)

func TraceIDToHexOrEmptyString(traceID pcommon.TraceID) string {
	if !traceID.IsEmpty() {
		return hex.EncodeToString(traceID[:])
	}
	return ""
}

func SpanIDToHexOrEmptyString(spanID pcommon.SpanID) string {
	if !spanID.IsEmpty() {
		return hex.EncodeToString(spanID[:])
	}
	return ""
}

func GetStringValueFromResource(resource pcommon.Resource, key string, defaultValue string) string {
	value, found := resource.Attributes().Get(key)
	if !found {
		return defaultValue
	}
	return value.AsString()
}

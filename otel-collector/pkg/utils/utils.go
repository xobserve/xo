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

func GetTenantNameFromResource(resource pcommon.Resource) string {
	tenant, found := resource.Attributes().Get("tenantId")
	if !found {
		return "default"
	}
	return tenant.AsString()
}

func GetEnvNameFromResource(resource pcommon.Resource) string {
	env, found := resource.Attributes().Get("environment")
	if !found {
		return "default"
	}
	return env.AsString()
}

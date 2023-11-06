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

func GetTenantFromResource(resource pcommon.Resource) string {
	tenant, found := resource.Attributes().Get("xobserve.tenant")
	if !found {
		return "default"
	}
	return tenant.AsString()
}

func GetNamespaceFromResource(resource pcommon.Resource) string {
	env, found := resource.Attributes().Get("xobserve.namespace")
	if !found {
		return "default"
	}
	return env.AsString()
}

func GetGroupFromResource(resource pcommon.Resource) string {
	group, found := resource.Attributes().Get("xobserve.group")
	if !found {
		return "default"
	}
	return group.AsString()
}

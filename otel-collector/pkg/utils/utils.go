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

func GetTeamIdFromResource(resource pcommon.Resource) string {
	teamId, found := resource.Attributes().Get("xo.teamId")
	if !found {
		return "1"
	}
	return teamId.AsString()
}

func GetNamespaceFromResource(resource pcommon.Resource) string {
	namespace, found := resource.Attributes().Get("xo.namespace")
	if !found {
		return "default"
	}
	return namespace.AsString()
}

func GetClusterFromResource(resource pcommon.Resource) string {
	cluster, found := resource.Attributes().Get("xo.cluster")
	if !found {
		return "default"
	}
	return cluster.AsString()
}

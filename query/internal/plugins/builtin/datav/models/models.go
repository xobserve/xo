package models

const (
	DefaultOperationsTable         string = "distributed_signoz_operations"
	DefaultIndexTable              string = "distributed_signoz_index_v2"
	DefaultErrorTable              string = "distributed_signoz_error_index_v2"
	DefaultDurationTable           string = "distributed_durationSort"
	DefaultUsageExplorerTable      string = "distributed_usage_explorer"
	DefaultSpansTable              string = "distributed_signoz_spans"
	DefaultDependencyGraphTable    string = "distributed_dependency_graph_minutes_v2"
	DefaultTopLevelOperationsTable string = "distributed_top_level_operations"
	DefaultSpanAttributeTable      string = "distributed_span_attributes"
	DefaultSpanAttributeKeysTable  string = "distributed_span_attributes_keys"
	DefaultLogsTable               string = "distributed_logs"
	DefaultLogsLocalTable          string = "logs"
	DefaultLogAttributeKeysTable   string = "distributed_logs_attribute_keys"
	DefaultLogResourceKeysTable    string = "distributed_logs_resource_keys"
	DefaultLogTagAttributeTable    string = "distributed_tag_attributes"
)

const (
	LogsSelectSQL = "SELECT " +
		"timestamp, id, trace_id, span_id, trace_flags, severity, severity_number, body, namespace, service, host, " +
		"CAST((attributes_string_key, attributes_string_value), 'Map(String, String)') as  attributes_string,CAST((attributes_int64_key, attributes_int64_value), 'Map(String, Int64)') as  attributes_int64,CAST((attributes_float64_key, attributes_float64_value), 'Map(String, Float64)') as  attributes_float64,CAST((resources_string_key, resources_string_value), 'Map(String, String)') as resources_string"

	LogSelectSQL = "SELECT " +
		"timestamp, id, trace_id, span_id, trace_flags, severity, severity_number, body, namespace, service, host, " +
		"CAST((attributes_string_key, attributes_string_value), 'Map(String, String)') as  attributes_string,CAST((attributes_int64_key, attributes_int64_value), 'Map(String, Int64)') as  attributes_int64, CAST((attributes_float64_key, attributes_float64_value), 'Map(String, Float64)') as  attributes_float64, CAST((resources_string_key, resources_string_value), 'Map(String, String)') as resources_string "
)

type SearchToken struct {
	Key      string
	Value    string
	Operator string
}

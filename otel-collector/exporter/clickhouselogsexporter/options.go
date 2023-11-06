package clickhouselogsexporter

// default log tables
const (
	DefaultLogDatabase      string = "xobserve_logs"
	DefaultLogDatasource    string = "tcp://127.0.0.1:9000/?database=xobserve_logs"
	DefaultLogsTable        string = "distributed_logs"
	DefaultLogTagAttributes string = "distributed_log_tag_attributes"
)

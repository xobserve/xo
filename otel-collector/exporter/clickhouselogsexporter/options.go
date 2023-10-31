package clickhouselogsexporter

const (
	DefaultLogDatabase      string = "datav_logs"
	DefaultLogDatasource    string = "tcp://127.0.0.1:9000/?database=datav_logs"
	DefaultLogsTable        string = "distributed_logs"
	DefaultLogTagAttributes string = "distributed_log_tag_attributes"
)

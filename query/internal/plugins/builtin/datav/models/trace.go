package models

// Trace list item
type TraceIndex struct {
	TraceID    string               `json:"traceID"`
	Duration   uint64               `json:"duration"`
	StartTime  int64                `json:"startTime"`
	TraceName  string               `json:"traceName"`
	Services   []*TraceServiceIndex `json:"services"`
	StatusCode string               `json:"statusCode"`
}

type TraceServiceIndex struct {
	Name     string `json:"name"`
	NumSpans uint64 `json:"numSpans"`
	Errors   uint64 `json:"errors"`
}

package models

// Trace list item
type TraceIndex struct {
	TraceId        string               `json:"traceID"`
	Duration       uint64               `json:"duration"`
	StartTime      uint64               `json:"startTime"`
	TraceName      string               `json:"traceName"`
	Services       []*TraceServiceIndex `json:"services"`
	RespStatusCode string               `json:"respStatusCode"`
}

type TraceServiceIndex struct {
	Name     string `json:"name"`
	NumSpans uint64 `json:"numSpans"`
	Errors   uint64 `json:"errors"`
}

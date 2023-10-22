package clickhouselogsexporter

import (
	"strings"

	"github.com/DataObserve/datav/otel-collector/pkg/usage"
	"go.opencensus.io/metric/metricdata"
	"go.opencensus.io/stats"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/tag"
)

const (
	SigNozSentLogRecordsKey      = "singoz_sent_log_records"
	SigNozSentLogRecordsBytesKey = "singoz_sent_log_records_bytes"
)

var (
	// Measures for usage
	ExporterSigNozSentLogRecords = stats.Int64(
		SigNozSentLogRecordsKey,
		"Number of signoz log records successfully sent to destination.",
		stats.UnitDimensionless)
	ExporterSigNozSentLogRecordsBytes = stats.Int64(
		SigNozSentLogRecordsBytesKey,
		"Total size of signoz log records successfully sent to destination.",
		stats.UnitDimensionless)

	// Views for usage
	LogsCountView = &view.View{
		Name:        "signoz_logs_count",
		Measure:     ExporterSigNozSentLogRecords,
		Description: "The number of logs exported to signoz",
		Aggregation: view.Sum(),
		TagKeys:     []tag.Key{usage.TagTenantKey},
	}
	LogsSizeView = &view.View{
		Name:        "signoz_logs_bytes",
		Measure:     ExporterSigNozSentLogRecordsBytes,
		Description: "The size of logs exported to signoz",
		Aggregation: view.Sum(),
		TagKeys:     []tag.Key{usage.TagTenantKey},
	}
)

func UsageExporter(metrics []*metricdata.Metric) (map[string]usage.Usage, error) {
	data := map[string]usage.Usage{}
	for _, metric := range metrics {
		if strings.Contains(metric.Descriptor.Name, "signoz_logs_count") {
			for _, v := range metric.TimeSeries {
				tenant := v.LabelValues[0].Value
				if d, ok := data[tenant]; ok {
					d.Count = v.Points[0].Value.(int64)
					data[tenant] = d
				} else {
					data[tenant] = usage.Usage{
						Count: v.Points[0].Value.(int64),
					}
				}
			}
		} else if strings.Contains(metric.Descriptor.Name, "signoz_logs_bytes") {
			for _, v := range metric.TimeSeries {
				tenant := v.LabelValues[0].Value
				if d, ok := data[tenant]; ok {
					d.Size = v.Points[0].Value.(int64)
					data[tenant] = d
				} else {
					data[tenant] = usage.Usage{
						Size: v.Points[0].Value.(int64),
					}
				}
			}
		}
	}
	return data, nil
}

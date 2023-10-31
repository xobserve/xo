package clickhousetracesexporter

import (
	"strings"

	"github.com/DataObserve/datav/otel-collector/pkg/usage"
	"go.opencensus.io/metric/metricdata"
	"go.opencensus.io/stats"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/tag"
)

const (
	SentSpansKey      = "datav_sent_spans"
	SentSpansBytesKey = "datav_sent_spans_bytes"
)

var (
	// Measures for usage
	ExporterSentSpans = stats.Int64(
		SentSpansKey,
		"Number of datav log records successfully sent to destination.",
		stats.UnitDimensionless)
	ExporterSentSpansBytes = stats.Int64(
		SentSpansBytesKey,
		"Total size of datav log records successfully sent to destination.",
		stats.UnitDimensionless)

	// Views for usage
	SpansCountView = &view.View{
		Name:        "datav_spans_count",
		Measure:     ExporterSentSpans,
		Description: "The number of spans exported to datav",
		Aggregation: view.Sum(),
		TagKeys:     []tag.Key{usage.TagTenantKey},
	}
	SpansCountBytesView = &view.View{
		Name:        "datav_spans_bytes",
		Measure:     ExporterSentSpansBytes,
		Description: "The size of spans exported to datav",
		Aggregation: view.Sum(),
		TagKeys:     []tag.Key{usage.TagTenantKey},
	}
)

func UsageExporter(metrics []*metricdata.Metric) (map[string]usage.Usage, error) {
	data := map[string]usage.Usage{}
	for _, metric := range metrics {
		if strings.Contains(metric.Descriptor.Name, "datav_spans_count") {
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
		} else if strings.Contains(metric.Descriptor.Name, "datav_spans_bytes") {
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

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
	SigNozSentSpansKey      = "singoz_sent_spans"
	SigNozSentSpansBytesKey = "singoz_sent_spans_bytes"
)

var (
	// Measures for usage
	ExporterSigNozSentSpans = stats.Int64(
		SigNozSentSpansKey,
		"Number of signoz log records successfully sent to destination.",
		stats.UnitDimensionless)
	ExporterSigNozSentSpansBytes = stats.Int64(
		SigNozSentSpansBytesKey,
		"Total size of signoz log records successfully sent to destination.",
		stats.UnitDimensionless)

	// Views for usage
	SpansCountView = &view.View{
		Name:        "signoz_spans_count",
		Measure:     ExporterSigNozSentSpans,
		Description: "The number of spans exported to signoz",
		Aggregation: view.Sum(),
		TagKeys:     []tag.Key{usage.TagTenantKey},
	}
	SpansCountBytesView = &view.View{
		Name:        "signoz_spans_bytes",
		Measure:     ExporterSigNozSentSpansBytes,
		Description: "The size of spans exported to signoz",
		Aggregation: view.Sum(),
		TagKeys:     []tag.Key{usage.TagTenantKey},
	}
)

func UsageExporter(metrics []*metricdata.Metric) (map[string]usage.Usage, error) {
	data := map[string]usage.Usage{}
	for _, metric := range metrics {
		if strings.Contains(metric.Descriptor.Name, "signoz_spans_count") {
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
		} else if strings.Contains(metric.Descriptor.Name, "signoz_spans_bytes") {
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

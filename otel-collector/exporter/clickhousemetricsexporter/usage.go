package clickhousemetricsexporter

import (
	"strings"

	"github.com/DataObserve/observex/otel-collector/pkg/usage"
	"go.opencensus.io/metric/metricdata"
	"go.opencensus.io/stats"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/tag"
)

const (
	SentMetricPointsKey      = "observex_sent_metric_points"
	SentMetricPointsBytesKey = "observex_sent_metric_points_bytes"
)

var (
	// Measures for usage
	ExporterSentMetricPoints = stats.Int64(
		SentMetricPointsKey,
		"Number of observex log records successfully sent to destination.",
		stats.UnitDimensionless)
	ExporterSentMetricPointsBytes = stats.Int64(
		SentMetricPointsBytesKey,
		"Total size of observex log records successfully sent to destination.",
		stats.UnitDimensionless)

	// Views for usage
	MetricPointsCountView = &view.View{
		Name:        "observex_metric_points_count",
		Measure:     ExporterSentMetricPoints,
		Description: "The number of observex exported to observex",
		Aggregation: view.Sum(),
		TagKeys:     []tag.Key{usage.TagTenantKey},
	}
	MetricPointsBytesView = &view.View{
		Name:        "observex_metric_points_bytes",
		Measure:     ExporterSentMetricPointsBytes,
		Description: "The size of logs exported to observex",
		Aggregation: view.Sum(),
		TagKeys:     []tag.Key{usage.TagTenantKey},
	}
)

func UsageExporter(metrics []*metricdata.Metric) (map[string]usage.Usage, error) {
	data := map[string]usage.Usage{}
	for _, metric := range metrics {
		if strings.Contains(metric.Descriptor.Name, "observex_metric_points_count") {
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
		} else if strings.Contains(metric.Descriptor.Name, "observex_metric_points_bytes") {
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

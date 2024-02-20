package otel

import (
	"context"
	"time"

	"go.opentelemetry.io/contrib/instrumentation/runtime"
	"go.opentelemetry.io/otel"
	otlpmetric "go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc"
	"go.opentelemetry.io/otel/sdk/metric"
)

var MetricProvider *metric.MeterProvider

func InitMetricProvider() error {
	exporter, err := otlpmetric.New(
		context.Background(),
		otlpmetric.WithInsecure(),
	)
	if err != nil {
		return err
	}
	read := metric.NewPeriodicReader(exporter, metric.WithInterval(15*time.Second))
	mp := metric.NewMeterProvider(metric.WithReader(read))
	otel.SetMeterProvider(mp)
	MetricProvider = mp

	return nil
}

func InitRuntimeStats() error {
	return runtime.Start(runtime.WithMinimumReadMemStatsInterval(time.Second))
}

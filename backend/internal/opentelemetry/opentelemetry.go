package ot

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/DataObserve/datav/backend/pkg/colorlog"
	"github.com/DataObserve/datav/backend/pkg/config"
	"go.opentelemetry.io/contrib/instrumentation/runtime"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/exporters/stdout/stdouttrace"
	"go.opentelemetry.io/otel/propagation"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
	sdkresource "go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/trace"
)

var TraceProvider *sdktrace.TracerProvider
var MeterProvider *sdkmetric.MeterProvider
var Tracer trace.Tracer

var logger = colorlog.RootLogger.New("logger", "ot")

func InitOpentelemetry() {
	TraceProvider = initTracerProvider()

	MeterProvider = initMeterProvider()

	err := runtime.Start(runtime.WithMinimumReadMemStatsInterval(time.Second))
	if err != nil {
		logger.Crit("Error instrument go runtime", "error", err)
	}

	Tracer = TraceProvider.Tracer("")
}

func initResource() *sdkresource.Resource {
	// initResourcesOnce.Do(func() {
	// 	resource, _ = sdkresource.Merge(
	// 		sdkresource.Default(),
	// 		sdkresource.New(
	// 			context.Background(),
	// 			semconv.ServiceName("datav"),
	// 		),
	// 	)
	// })
	resource, err := sdkresource.New(
		context.Background(),
		sdkresource.WithAttributes(
			attribute.String("service.name", config.Data.Common.AppName),
			// attribute.String("library.language", "go"),
		),
		sdkresource.WithHost(),
	)

	if err != nil {
		logger.Crit("Error init opentelemetry resource", "error", err)
	}

	return resource
	// return sdkresource.NewWithAttributes(
	// 	semconv.SchemaURL,
	// 	semconv.ServiceNameKey.String(config.Data.Common.AppName),
	// )
}

func initTracerProvider() *sdktrace.TracerProvider {
	exp, err := newExporter(config.Data.SelfMonitoring.OtlpExportor)
	if err != nil {
		logger.Crit("Error new exporter", "error", err)
	}

	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exp),
		sdktrace.WithResource(initResource()),
	)
	otel.SetTracerProvider(tp)
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext{}, propagation.Baggage{}))
	return tp
}

func initMeterProvider() *sdkmetric.MeterProvider {
	mp := sdkmetric.NewMeterProvider(
		sdkmetric.WithResource(initResource()),
	)
	otel.SetMeterProvider(mp)
	return mp
}

// newExporter returns a console exporter.
func newExporter(exporterType string) (sdktrace.SpanExporter, error) {
	var exporter sdktrace.SpanExporter
	var err error
	switch exporterType {
	case "jaeger":
		return nil, errors.New("jaeger exporter is no longer supported, please use otlp")
	case "otlp":
		var opts []otlptracehttp.Option = []otlptracehttp.Option{
			otlptracehttp.WithInsecure(),
		}
		if config.Data.SelfMonitoring.OtlpEndpoint != "" {
			opts = append(opts, otlptracehttp.WithEndpoint(config.Data.SelfMonitoring.OtlpEndpoint))
		}
		exporter, err = otlptrace.New(
			context.Background(),
			otlptracehttp.NewClient(opts...),
		)
	case "stdout":
		exporter, err = stdouttrace.New(
			stdouttrace.WithPrettyPrint(),
		)
	default:
		return nil, fmt.Errorf("unrecognized exporter type %s", exporterType)
	}

	return exporter, err
}

// Copyright (c) 2019 The Jaeger Authors.
// Copyright (c) 2017 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package log

import (
	"context"

	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func createLogger() *zap.Logger {
	encoderCfg := zap.NewProductionEncoderConfig()
	encoderCfg.TimeKey = "ts"
	encoderCfg.EncodeTime = zapcore.ISO8601TimeEncoder

	config := zap.Config{
		Level:             zap.NewAtomicLevelAt(zap.InfoLevel),
		Development:       false,
		DisableCaller:     false,
		DisableStacktrace: false,
		Sampling:          nil,
		Encoding:          "json",
		EncoderConfig:     encoderCfg,
		OutputPaths: []string{
			"stderr",
		},
		ErrorOutputPaths: []string{
			"stderr",
		},
		InitialFields: map[string]interface{}{},
	}

	l, _ := config.Build()
	return l
}

var L = createLogger()

// For returns a context-aware Logger. If the context
// contains a span, all logging calls are also
// echo-ed into the span.
func WithTrace(ctx context.Context) *zap.Logger {
	if span := trace.SpanFromContext(ctx); span != nil {
		f := []zapcore.Field{
			zap.String("trace_id", span.SpanContext().TraceID().String()),
			zap.String("span_id", span.SpanContext().SpanID().String()),
		}
		return L.With(f...)
	}
	return L
}

// Logger is a simplified abstraction of the zap.Logger
type Logger interface {
	Debug(msg string, fields ...zapcore.Field)
	Info(msg string, fields ...zapcore.Field)
	Error(msg string, fields ...zapcore.Field)
	Fatal(msg string, fields ...zapcore.Field)
	With(fields ...zapcore.Field) Logger
}

// wrapper delegates all calls to the underlying zap.Logger
type wrapper struct {
	logger *zap.Logger
}

// Debug logs an debug msg with fields
func (l wrapper) Debug(msg string, fields ...zapcore.Field) {
	l.logger.Debug(msg, fields...)
}

// Info logs an info msg with fields
func (l wrapper) Info(msg string, fields ...zapcore.Field) {
	l.logger.Info(msg, fields...)
}

// Error logs an error msg with fields
func (l wrapper) Error(msg string, fields ...zapcore.Field) {
	l.logger.Error(msg, fields...)
}

// Fatal logs a fatal error msg with fields
func (l wrapper) Fatal(msg string, fields ...zapcore.Field) {
	l.logger.Fatal(msg, fields...)
}

// With creates a child logger, and optionally adds some context fields to that logger.
func (l wrapper) With(fields ...zapcore.Field) Logger {
	return wrapper{logger: l.logger.With(fields...)}
}

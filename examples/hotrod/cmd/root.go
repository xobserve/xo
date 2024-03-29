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

package cmd

import (
	"os"

	"github.com/spf13/cobra"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"hotrod/services/config"

	"hotrod/pkg/metrics/expvar"
	"hotrod/pkg/metrics/prometheus"

	"github.com/jaegertracing/jaeger/pkg/metrics"
)

var (
	logger         *zap.Logger
	metricsFactory metrics.Factory
)

// RootCmd represents the base command when called without any subcommands
var RootCmd = &cobra.Command{
	Use:   "examples-hotrod",
	Short: "HotR.O.D. - A tracing demo application",
	Long:  `HotR.O.D. - A tracing demo application.`,
}

// Execute adds all child commands to the root command sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	if err := RootCmd.Execute(); err != nil {
		logger.Fatal("We bowled a googly", zap.Error(err))
		os.Exit(-1)
	}
}

func init() {
	addFlags(RootCmd)
	cobra.OnInitialize(onInitialize)
}

// onInitialize is called before the command is executed.
func onInitialize() {
	var err error
	logger, err = newLogger()
	if err != nil {
		panic("init logger error:" + err.Error())
	}

	switch metricsBackend {
	case "expvar":
		metricsFactory = expvar.NewFactory(10) // 10 buckets for histograms
		logger.Info("*** Using expvar as metrics backend " + expvarDepr)
	case "prometheus":
		metricsFactory = prometheus.New().Namespace(metrics.NSOptions{Name: "hotrod", Tags: nil})
		logger.Info("Using Prometheus as metrics backend")
	default:
		logger.Fatal("unsupported metrics backend " + metricsBackend)
	}
	if config.MySQLGetDelay != fixDBConnDelay {
		logger.Info("fix: overriding MySQL query delay", zap.Duration("old", config.MySQLGetDelay), zap.Duration("new", fixDBConnDelay))
		config.MySQLGetDelay = fixDBConnDelay
	}
	if fixDBConnDisableMutex {
		logger.Info("fix: disabling db connection mutex")
		config.MySQLMutexDisabled = true
	}
	if config.RouteWorkerPoolSize != fixRouteWorkerPoolSize {
		logger.Info("fix: overriding route worker pool size", zap.Int("old", config.RouteWorkerPoolSize), zap.Int("new", fixRouteWorkerPoolSize))
		config.RouteWorkerPoolSize = fixRouteWorkerPoolSize
	}

	if customerPort != 8081 {
		logger.Info("changing customer service port", zap.Int("old", 8081), zap.Int("new", customerPort))
	}

	if driverPort != 8082 {
		logger.Info("changing driver service port", zap.Int("old", 8082), zap.Int("new", driverPort))
	}

	if frontendPort != 8080 {
		logger.Info("changing frontend service port", zap.Int("old", 8080), zap.Int("new", frontendPort))
	}

	if routePort != 8083 {
		logger.Info("changing route service port", zap.Int("old", 8083), zap.Int("new", routePort))
	}

	if basepath != "" {
		logger.Info("changing basepath for frontend", zap.String("old", "/"), zap.String("new", basepath))
	}
}

func logError(logger *zap.Logger, err error) error {
	if err != nil {
		logger.Error("Error running command", zap.Error(err))
	}
	return err
}

func newLogger(options ...zap.Option) (*zap.Logger, error) {
	cfg := zap.NewProductionConfig()
	cfg.OutputPaths = []string{
		"/var/log/out.log", "stderr",
	}
	cfg.ErrorOutputPaths = []string{
		"/var/log/out.log", "stderr",
	}
	cfg.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	zapOptions := []zap.Option{
		zap.AddStacktrace(zapcore.FatalLevel),
		zap.AddCallerSkip(1),
	}
	if !verbose {
		zapOptions = append(zapOptions,
			zap.IncreaseLevel(zap.LevelEnablerFunc(func(l zapcore.Level) bool { return l != zapcore.DebugLevel })),
		)
	}

	return cfg.Build(zapOptions...)
}

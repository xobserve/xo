package main

import (
	"fmt"
	"os"

	"log"

	"github.com/DataObserve/datav/otel-collector/components"
	"github.com/DataObserve/datav/otel-collector/pkg/config"
	"github.com/DataObserve/datav/otel-collector/pkg/logger"
	"github.com/spf13/cobra"
	flag "github.com/spf13/pflag"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"go.opentelemetry.io/collector/component"
	"go.opentelemetry.io/collector/featuregate"
	"go.opentelemetry.io/collector/otelcol"
)

func main() {
	// Command line flags
	flagSet, err := buildAndParseFlagSet(featuregate.GlobalRegistry())
	if err != nil {
		log.Fatalf("Failed to parse args %v", err)
	}

	logger.SetupErrorLogger(flagSet)

	info := component.BuildInfo{
		Command:     "datav-otel-collector",
		Description: "Datav OTel Collector",
		Version:     "latest",
	}
	factories, err := components.Components()
	if err != nil {
		log.Fatalf("failed to build components %v", err)
	}
	params := otelcol.CollectorSettings{
		Factories:      factories,
		BuildInfo:      info,
		LoggingOptions: []zap.Option{logger.WrapCoreOpt(flagSet)},
		ConfigProvider: config.GetConfigProvider(flagSet),
	}

	if err = run(params, flagSet); err != nil {
		log.Fatal(err)
	}
}

func run(params otelcol.CollectorSettings, flagSet *flag.FlagSet) error {
	return runInteractive(params, flagSet)
}

func buildAndParseFlagSet(featuregate *featuregate.Registry) (*flag.FlagSet, error) {
	flagSet := config.Flags(featuregate)
	if err := flagSet.Parse(os.Args[1:]); err != nil {
		return nil, err
	}
	return flagSet, nil
}

func runInteractive(params otelcol.CollectorSettings, flagSet *flag.FlagSet) error {
	cmd := newCommand(params, flagSet)
	err := cmd.Execute()
	if err != nil {
		return fmt.Errorf("application run finished with error: %w", err)
	}
	return nil
}

// newCommand constructs a new cobra.Command using the given settings.
func newCommand(params otelcol.CollectorSettings, flagSet *flag.FlagSet) *cobra.Command {
	rootCmd := &cobra.Command{
		Use:          params.BuildInfo.Command,
		Version:      params.BuildInfo.Version,
		SilenceUsage: true,
		RunE: func(cmd *cobra.Command, args []string) error {
			col, err := otelcol.NewCollector(params)
			if err != nil {
				return fmt.Errorf("failed to construct the application: %w", err)
			}
			return col.Run(cmd.Context())
		},
	}
	rootCmd.Flags().AddFlagSet(flagSet)
	return rootCmd
}

func initZapLog() (*zap.Logger, error) {
	config := zap.NewProductionConfig()
	config.EncoderConfig.EncodeLevel = zapcore.LowercaseLevelEncoder
	config.EncoderConfig.TimeKey = "timestamp"
	config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	logger, err := config.Build()
	return logger, err
}

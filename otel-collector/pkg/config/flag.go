package config

import (
	"fmt"
	"os"
	"path"

	flag "github.com/spf13/pflag"
	"go.opentelemetry.io/collector/featuregate"
	otelcolFeatureGate "go.opentelemetry.io/collector/featuregate"
)

func Flags(featuregate *featuregate.Registry) *flag.FlagSet {
	f := flag.NewFlagSet("Collector CLI Options", flag.ExitOnError)
	f.Usage = func() {
		fmt.Println(f.FlagUsages())
		os.Exit(0)
	}
	f.String("config", "", "File path for collector configuration")

	pwd, _ := os.Getwd()
	f.String("logpath", path.Join(pwd, "xobserve-otel-collector.log"), "File path for collector log")
	f.Var(NewFlag(otelcolFeatureGate.GlobalRegistry()), "feature-gates",
		"Comma-delimited list of feature gate identifiers. Prefix with '-' to disable the feature. '+' or no prefix will enable the feature.")
	return f
}

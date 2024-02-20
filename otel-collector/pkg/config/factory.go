package config

import (
	"log"

	flag "github.com/spf13/pflag"
	"go.opentelemetry.io/collector/confmap"
	"go.opentelemetry.io/collector/confmap/converter/expandconverter"
	"go.opentelemetry.io/collector/confmap/provider/fileprovider"
	"go.opentelemetry.io/collector/otelcol"
)

func GetConfigProvider(flagSet *flag.FlagSet) otelcol.ConfigProvider {
	configFilePath, _ := flagSet.GetString("config")

	if configFilePath == "" {
		configFilePath = "./config/collector.yaml"
	}

	providers := []confmap.Provider{
		fileprovider.New(),
	}

	mapProviders := make(map[string]confmap.Provider, len(providers))
	for _, provider := range providers {
		mapProviders[provider.Scheme()] = provider
	}

	// create Config Provider Settings
	settings := otelcol.ConfigProviderSettings{
		ResolverSettings: confmap.ResolverSettings{
			URIs:       []string{configFilePath},
			Providers:  mapProviders,
			Converters: []confmap.Converter{expandconverter.New(confmap.ConverterSettings{})},
		},
	}

	// get New config Provider
	config_provider, err := otelcol.NewConfigProvider(settings)

	if err != nil {
		log.Panicf("Err on creating Config Provider: %v\n", err)
	}

	return config_provider
}

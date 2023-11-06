// Copyright The OpenTelemetry Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package clickhousetracesexporter

import (
	"errors"

	"go.opentelemetry.io/collector/component"
	"go.uber.org/multierr"
)

// Config defines configuration for tracing exporter.
type Config struct {
	Options    `mapstructure:",squash"`
	DSN        string `mapstructure:"dsn"`
	Migrations string `mapstructure:"migrations"`
	// Docker Multi Node Cluster is a flag to enable the docker multi node cluster. Default is false.
	DockerMultiNodeCluster bool `mapstructure:"docker_multi_node_cluster"`
	// LowCardinalExceptionGrouping is a flag to enable exception grouping by serviceName + exceptionType. Default is false.
	LowCardinalExceptionGrouping bool `mapstructure:"low_cardinal_exception_grouping"`
}

var _ component.Config = (*Config)(nil)

var (
	errConfigNoDSN = errors.New("dsn must be specified")
)

// Validate validates the clickhouse server configuration.
func (cfg *Config) Validate() (err error) {
	if cfg.DSN == "" {
		err = multierr.Append(err, errConfigNoDSN)
	}
	return err
}

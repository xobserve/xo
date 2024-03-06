package metrics

import (
	"context"

	"github.com/xobserve/xo/otel-collector/internal/migrationmanager/migrators/basemigrator"
)

const (
	name            = "metrics"
	database        = "xobserve_metrics"
	migrationFolder = "migrations/metrics"
)

type MetricsMigrator struct {
	*basemigrator.BaseMigrator
}

func (m *MetricsMigrator) Migrate(ctx context.Context) error {
	err := m.BaseMigrator.Migrate(ctx, database, migrationFolder)
	if err != nil {
		return err
	}

	return nil
}

func (m *MetricsMigrator) Name() string {
	return name
}

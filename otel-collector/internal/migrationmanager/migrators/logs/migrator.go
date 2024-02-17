package logs

import (
	"context"

	"github.com/xObserve/xObserve/otel-collector/internal/migrationmanager/migrators/basemigrator"
)

const (
	name            = "logs"
	database        = "xobserve_logs"
	migrationFolder = "migrations/logs"
)

type LogsMigrator struct {
	*basemigrator.BaseMigrator
}

func (m *LogsMigrator) Migrate(ctx context.Context) error {
	return m.BaseMigrator.Migrate(ctx, database, migrationFolder)
}

func (m *LogsMigrator) Name() string {
	return name
}

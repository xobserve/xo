package traces

import (
	"context"

	"github.com/xObserve/xObserve/otel-collector/internal/migrationmanager/migrators/basemigrator"
)

const (
	name            = "traces"
	database        = "xobserve_traces"
	migrationFolder = "migrations/traces"
)

type TracesMigrator struct {
	*basemigrator.BaseMigrator
}

func (m *TracesMigrator) Migrate(ctx context.Context) error {
	err := m.BaseMigrator.Migrate(ctx, database, migrationFolder)
	if err != nil {
		return err
	}

	return m.initFeatures()
}

func (m *TracesMigrator) Name() string {
	return name
}

func (m *TracesMigrator) initFeatures() error {
	return nil
}

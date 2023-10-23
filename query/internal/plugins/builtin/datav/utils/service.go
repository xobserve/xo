package obutils

import (
	"context"
	"fmt"

	ch "github.com/ClickHouse/clickhouse-go/v2"
	obmodels "github.com/DataObserve/datav/query/internal/plugins/builtin/datav/models"
	"github.com/DataObserve/datav/query/pkg/config"
)

func GetServiceAndOperations(ctx context.Context, conn ch.Conn) (*map[string][]string, error) {
	operations := map[string][]string{}
	query := fmt.Sprintf(`SELECT DISTINCT name, serviceName FROM %s.%s`, config.Data.Observability.DefaultTraceDB, obmodels.DefaultTopLevelOperationsTable)

	rows, err := conn.Query(ctx, query)

	if err != nil {
		return nil, err
	}

	defer rows.Close()
	for rows.Next() {
		var name, serviceName string
		if err := rows.Scan(&name, &serviceName); err != nil {
			return nil, err
		}
		if _, ok := operations[serviceName]; !ok {
			operations[serviceName] = []string{}
		}
		operations[serviceName] = append(operations[serviceName], name)
	}
	return &operations, nil
}

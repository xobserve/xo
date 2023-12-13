package datasource

import (
	"context"
	"encoding/json"

	"github.com/xObserve/xObserve/query/pkg/models"
)

func ImportFromJSON(ctx context.Context, raw string, teamId int64, u *models.User) error {
	var ds *models.Datasource
	err := json.Unmarshal([]byte(raw), &ds)
	if err != nil {
		return err
	}
	ds.TeamId = teamId

	return createDatasource(ctx, ds, u)
}

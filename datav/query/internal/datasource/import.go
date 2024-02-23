package datasource

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/xobserve/xo/query/pkg/db"
	"github.com/xobserve/xo/query/pkg/models"
)

func ImportFromJSON(ctx context.Context, raw string, teamId int64, u *models.User) error {
	var ds *models.Datasource
	err := json.Unmarshal([]byte(raw), &ds)
	if err != nil {
		return err
	}
	ds.TeamId = teamId

	tx, err := db.Conn.Begin()
	if err != nil {
		return fmt.Errorf("new user error: %w", err)
	}
	defer tx.Rollback()

	err = models.ImportDatasource(ctx, ds, tx, false)
	if err != nil {
		return fmt.Errorf("import datasource error: %w", err)
	}

	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("commit transaction error: %w", err)
	}

	return nil
}

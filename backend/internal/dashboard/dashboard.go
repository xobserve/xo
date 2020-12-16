package dashboard

import (
	"database/sql"
	"fmt"
	"strings"

	"github.com/opendatav/datav/backend/pkg/db"
	"github.com/opendatav/datav/backend/pkg/log"
	"github.com/opendatav/datav/backend/pkg/models"
	"github.com/opendatav/datav/backend/pkg/utils/simplejson"
)

var logger = log.RootLogger.New("logger", "dashboard")

func QueryByFolderId(folderId int) []*models.Dashboard {
	dashes := make([]*models.Dashboard, 0)

	rows, err := db.SQL.Query("SELECT id,uid,title,data FROM dashboard WHERE folder_id=?", folderId)
	if err != nil {
		if err != sql.ErrNoRows {
			logger.Warn("query dashboard by folderId error", "error", err)
		}
		return dashes
	}

	for rows.Next() {
		var rawJSON []byte
		dash := &models.Dashboard{}
		err := rows.Scan(&dash.Id, &dash.Uid, &dash.Title, &rawJSON)
		if err != nil {
			logger.Warn("query dashboard by folderId ,scan error", "error", err)
			continue
		}

		data := simplejson.New()
		err = data.UnmarshalJSON(rawJSON)
		dash.Data = data

		dashes = append(dashes, dash)
	}

	return dashes
}

func QueryDashboardsByIds(ids []string) []*models.Dashboard {
	idStr := strings.Join(ids, "','")
	idStr = "'" + idStr + "'"

	dashes := make([]*models.Dashboard, 0)

	q := fmt.Sprintf("SELECT id,uid,title,data FROM dashboard WHERE id in (%s)", idStr)
	rows, err := db.SQL.Query(q)
	if err != nil {
		if err != sql.ErrNoRows {
			logger.Warn("query dashboard by folderId error", "error", err)
		}
		return dashes
	}

	for rows.Next() {
		var rawJSON []byte
		dash := &models.Dashboard{}
		err := rows.Scan(&dash.Id, &dash.Uid, &dash.Title, &rawJSON)
		if err != nil {
			logger.Warn("query dashboard by folderId ,scan error", "error", err)
			continue
		}

		data := simplejson.New()
		err = data.UnmarshalJSON(rawJSON)
		dash.Data = data

		dashes = append(dashes, dash)
	}

	return dashes
}

func QueryDashboardMeta(id int64) (*models.DashboardMeta, error) {
	dashMeta := &models.DashboardMeta{}
	err := db.SQL.QueryRow(`SELECT version, owned_by,created_by, folder_id, created,updated FROM dashboard WHERE id=?`, id).Scan(
		&dashMeta.Version, &dashMeta.OwnedBy, &dashMeta.CreatedBy, &dashMeta.FolderId, &dashMeta.Created, &dashMeta.Updated,
	)
	if err != nil {
		return nil, err
	}

	return dashMeta, nil
}

func DeleteDashboard(id int64) error {
	// delete dashboard annotations
	_, err := db.SQL.Exec("DELETE FROM annotation WHERE dashboard_id=?", id)
	if err != nil {
		return err
	}

	// delete dashboard team acl
	_, err = db.SQL.Exec("DELETE FROM dashboard_acl WHERE dashboard_id=?", id)
	if err != nil {
		return err
	}

	// delete dashboard user acl
	_, err = db.SQL.Exec("DELETE FROM dashboard_user_acl WHERE dashboard_id=?", id)
	if err != nil {
		return err
	}

	// delete dashboard alert
	_, err = db.SQL.Exec("DELETE FROM alert WHERE dashboard_id=?", id)
	if err != nil {
		return err
	}

	// delete dashboard alert states
	_, err = db.SQL.Exec("DELETE FROM alert_states WHERE dashboard_id=?", id)
	if err != nil {
		return err
	}

	// delete dashboard alert history
	_, err = db.SQL.Exec("DELETE FROM alert_history WHERE dashboard_id=?", id)
	if err != nil {
		return err
	}

	// delete dashboard
	_, err = db.SQL.Exec("DELETE FROM dashboard WHERE id=?", id)
	if err != nil {
		return err
	}

	return nil
}

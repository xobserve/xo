package sidemenu

import (
	"encoding/json"

	"github.com/savecost/datav/backend/pkg/db"
	"github.com/savecost/datav/backend/pkg/log"
	"github.com/savecost/datav/backend/pkg/models"
)

var logger = log.RootLogger.New("logger", "server")

func QuerySideMenu(id int64, teamId int64) (*models.SideMenu, error) {
	menu := &models.SideMenu{}
	var rawJson []byte
	err := db.SQL.QueryRow("SELECT id,team_id,is_public,desc,data from sidemenu WHERE id=? or team_id=?", id, teamId).Scan(&menu.Id, &menu.TeamId, &menu.IsPublic, &menu.Desc, &rawJson)
	if err != nil {
		return nil, err
	}

	json.Unmarshal(rawJson, &menu.Data)
	return menu, nil
}

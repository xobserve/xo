package teams

import (
	"github.com/codecc-com/datav/backend/pkg/models"
	"github.com/codecc-com/datav/backend/pkg/db"
	"time"
)

// "team_acl": `CREATE TABLE IF NOT EXISTS team_acl (
// 	id 					INTEGER PRIMARY KEY AUTOINCREMENT,
// 	team_id        		INTEGER NOT NULL,
// 	role                VARCHAR(10) NOT NULL,
// 	permission          INT NOT NULL,
// 	created 			DATETIME NOT NULL DEFAULT CURRENT_DATETIME
// );
func InitTeamPermission(teamId int64) error {
	now := time.Now()

	// set admin permission
	_,err := db.SQL.Exec("INSERT INTO team_acl (team_id,role,permission,created) VALUES (?,?,?,?)",
		teamId, models.ROLE_ADMIN,models.CanView,now)
	if err != nil {
		logger.Warn("init team permission error","error","err")
		return err
	}

	_,err = db.SQL.Exec("INSERT INTO team_acl (team_id,role,permission,created) VALUES (?,?,?,?)",
		teamId, models.ROLE_ADMIN,models.CanEdit,now)
	if err != nil {
		logger.Warn("init team permission error","error","err")
		return err
	}

	_,err = db.SQL.Exec("INSERT INTO team_acl (team_id,role,permission,created) VALUES (?,?,?,?)",
		teamId, models.ROLE_ADMIN,models.CanAdd,now)
	if err != nil {
		logger.Warn("init team permission error","error","err")
		return err
	}

	_,err = db.SQL.Exec("INSERT INTO team_acl (team_id,role,permission,created) VALUES (?,?,?,?)",
		teamId, models.ROLE_ADMIN,models.CanDelete,now)
	if err != nil {
		logger.Warn("init team permission error","error","err")
		return err
	}


	_,err = db.SQL.Exec("INSERT INTO team_acl (team_id,role,permission,created) VALUES (?,?,?,?)",
		teamId, models.ROLE_ADMIN,models.CanSave,now)
	if err != nil {
		logger.Warn("init team permission error","error","err")
		return err
	}

	_,err = db.SQL.Exec("INSERT INTO team_acl (team_id,role,permission,created) VALUES (?,?,?,?)",
		teamId, models.ROLE_ADMIN,models.CanMangePermission,now)
	if err != nil {
		logger.Warn("init team permission error","error","err")
		return err
	}

	// set editor permission
	_,err = db.SQL.Exec("INSERT INTO team_acl (team_id,role,permission,created) VALUES (?,?,?,?)",
		teamId, models.ROLE_EDITOR,models.CanView,now)
	if err != nil {
		logger.Warn("init team permission error","error","err")
		return err
	}

	_,err = db.SQL.Exec("INSERT INTO team_acl (team_id,role,permission,created) VALUES (?,?,?,?)",
		teamId, models.ROLE_EDITOR,models.CanEdit,now)
	if err != nil {
		logger.Warn("init team permission error","error","err")
		return err
	}

	_,err = db.SQL.Exec("INSERT INTO team_acl (team_id,role,permission,created) VALUES (?,?,?,?)",
		teamId, models.ROLE_EDITOR,models.CanAdd,now)
	if err != nil {
		logger.Warn("init team permission error","error","err")
		return err
	}

	_,err = db.SQL.Exec("INSERT INTO team_acl (team_id,role,permission,created) VALUES (?,?,?,?)",
		teamId, models.ROLE_EDITOR,models.CanSave,now)
	if err != nil {
		logger.Warn("init team permission error","error","err")
		return err
	}

	_,err = db.SQL.Exec("INSERT INTO team_acl (team_id,role,permission,created) VALUES (?,?,?,?)",
		teamId, models.ROLE_EDITOR,models.CanDelete,now)
	if err != nil {
		logger.Warn("init team permission error","error","err")
		return err
	}

	// set viewer permission
	_,err = db.SQL.Exec("INSERT INTO team_acl (team_id,role,permission,created) VALUES (?,?,?,?)",
	teamId, models.ROLE_VIEWER,models.CanView,now)
	if err != nil {
		logger.Warn("init team permission error","error","err")
		return err
	}

	return nil
}


func updatePermission(teamId int64, role models.RoleType, permission []int) error {
	now := time.Now()
	for _,p := range permission {
		_,err := db.SQL.Exec("INSERT INTO team_acl (team_id,role,permission,created) VALUES (?,?,?,?)",
		teamId, role,p,now)
		if err != nil {
			return err
		}
	}

	return nil
}
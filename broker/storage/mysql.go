package storage

import (
	"fmt"
	"database/sql"
	"github.com/teamsaas/meq/common/logging"
	"go.uber.org/zap"
	_ "github.com/go-sql-driver/mysql"
)

var m *Mysql

type Mysql struct {
	acc, pw, addr, database string
	port                    int
	db                      *sql.DB
}

func NewMysql(addr,acc, pw string, port int, database string) *Mysql {
	return &Mysql{
		acc:      acc,
		pw:       pw,
		addr:     addr,
		port:     port,
		database: database,
	}
}

func (mysql *Mysql) Start() {
	// init mysql
	sqlConn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s", mysql.acc, mysql.pw,
		mysql.addr, mysql.port, mysql.database)
	db, err := sql.Open("mysql", sqlConn)
	if err != nil {
		logging.Logger.Panic("mysql", zap.Error(err), zap.String("sqlConn", sqlConn))
	}

	// test db if ok
	err = db.Ping()
	if err != nil {
		logging.Logger.Panic("mysql", zap.Error(err))
	}
	mysql.db = db
	m = mysql
}
func (mysql *Mysql) GetDb() *sql.DB {
	return mysql.db
}

func (mysql *Mysql) Close() error {
	if mysql.db != nil {
		err := mysql.db.Close()
		if err != nil {
			logging.Logger.Error("mysql", zap.Error(err))
		}
	}
	return nil
}

package app

import (
	"encoding/json"

	"github.com/tracedt/koala/dashboard/internal/pkg/http"
	"github.com/tracedt/koala/pkg/utils"

	"github.com/gocql/gocql"
	"github.com/labstack/echo"
	"github.com/tracedt/koala/dashboard/internal/pkg/code"
	"github.com/tracedt/koala/dashboard/internal/pkg/cql"
	"github.com/tracedt/koala/dashboard/internal/pkg/misc"

	"go.uber.org/zap"
)

// Agent is the data structure for application machine node
type Agent struct {
	AppName  string `json:"app_name"`
	AgentID  string `json:"agent_id"`
	HostName string `json:"host_name"`
	IP       string `json:"ip"`

	IsLive      bool `json:"is_live"`
	IsContainer bool `json:"is_container"`

	StartTime    string     `json:"start_time"`
	SocketID     int        `json:"socket_id"`
	OperatingEnv int        `json:"operating_env"`
	TracingAddr  string     `json:"tracing_addr "`
	Info         *AgentInfo `json:"info"`
}

// AgentInfo holds the node info
type AgentInfo struct {
	AgentVersion   string          `json:"agentVersion"`
	VMVersion      string          `json:"vmVersion"`
	Pid            int             `json:"pid"`
	ServerMetaData *ServerMetaData `json:"serverMetaData"`
	JvmInfo        *JvmInfo        `json:"jvmInfo"`
}

// JvmInfo holds the jvm info
type JvmInfo struct {
	GcType string `json:"gcType"`
}

// ServerMetaData holds the node meta data
type ServerMetaData struct {
	ServerInfo string   `json:"serverInfo"`
	VMArgs     []string `json:"vmArgs"`
}

// AgentList return the machine nodes of the application
func AgentList(c echo.Context) error {
	an := c.FormValue("app_name")
	agents, err := agentList(an)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, http.Resp{
			ErrCode: code.DatabaseError,
			Message: code.DatabaseErrorMsg,
		})
	}
	return c.JSON(http.StatusOK, http.Resp{
		Data: agents,
	})
}
func agentList(app string) ([]*Agent, error) {
	var q *gocql.Query
	if app == "" {
		q = cql.Static.Query(`SELECT app_name,agent_id,host_name,ip,is_live,is_container,start_time,socket_id,operating_env,tracing_addr,agent_info FROM agents`)
	} else {
		q = cql.Static.Query(`SELECT app_name,agent_id,host_name,ip,is_live,is_container,start_time,socket_id,operating_env,tracing_addr,agent_info FROM agents WHERE app_name=?`, app)
	}

	iter := q.Iter()

	var agentID, hostName, ip, tracingAddr, info, appName string
	var isLive, isContainer bool
	var socketID, operatingEnv int
	var startTime int64

	agents := make([]*Agent, 0)
	for iter.Scan(&appName, &agentID, &hostName, &ip, &isLive, &isContainer, &startTime, &socketID, &operatingEnv, &tracingAddr, &info) {
		agent := &Agent{
			AppName:      appName,
			AgentID:      agentID,
			HostName:     hostName,
			IP:           ip,
			IsLive:       isLive,
			IsContainer:  isContainer,
			StartTime:    utils.UnixMsToTimestring(startTime),
			SocketID:     socketID,
			OperatingEnv: operatingEnv,
			TracingAddr:  tracingAddr,
		}
		ai := &AgentInfo{}
		json.Unmarshal([]byte(info), &ai)
		agent.Info = ai

		agents = append(agents, agent)
	}

	if err := iter.Close(); err != nil {
		misc.Logger.Warn("access database error", zap.Error(err), zap.String("query", q.String()))
		return nil, err
	}

	return agents, nil
}

func countAgentsAlive() (map[string]int, map[string]int) {
	q := cql.Static.Query(`SELECT app_name,is_live FROM agents`)
	iter := q.Iter()

	var appName string
	var isLive bool

	alive := make(map[string]int)
	unalive := make(map[string]int)
	for iter.Scan(&appName, &isLive) {
		if isLive {
			count := alive[appName]
			alive[appName] = count + 1
		} else {
			count := unalive[appName]
			unalive[appName] = count + 1
		}
	}

	if err := iter.Close(); err != nil {
		misc.Logger.Warn("database error", zap.Error(err), zap.String("query", q.String()))
		return nil, nil
	}

	return alive, unalive
}

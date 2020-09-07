package alerting

import (
	"context"
	"log"
	"time"

	"github.com/datadefeat/datav/backend/pkg/models"
	"github.com/datadefeat/datav/backend/pkg/utils/null"
)

// EvalMatch represents the series violating the threshold.
type EvalMatch struct {
	Value  null.Float        `json:"value"`
	Metric string            `json:"metric"`
	Tags   map[string]string `json:"tags"`
}

// ResultLogEntry represents log data for the alert evaluation.
type ResultLogEntry struct {
	Message string
	Data    interface{}
}

// EvalContext is the context object for an alert evaluation.
type EvalContext struct {
	Firing         bool
	IsTestRun      bool
	IsDebug        bool
	EvalMatches    []*EvalMatch
	Logs           []*ResultLogEntry
	Error          error
	ConditionEvals string
	StartTime      time.Time
	EndTime        time.Time
	Rule           *Rule
	log            log.Logger

	dashboardRef *models.DashboardRef

	ImagePublicURL  string
	ImageOnDiskPath string
	NoDataFound     bool
	PrevAlertState  models.AlertStateType

	Ctx context.Context
}

package notifiers

import (
	"github.com/codecc-com/datav/backend/pkg/log"
	"github.com/codecc-com/datav/backend/pkg/models"
)

var logger = log.RootLogger.New("logger","notifiers")

// Notifier is responsible for sending alert notifications.
type Notifier interface {
	Notify(*AlertContent) error
	GetType() string
}

type NotifierFactory func(notification *models.AlertNotification) (Notifier, error)

var NotifierFactories = make(map[string]NotifierFactory)

// RegisterNotifier register an notifier
func RegisterNotifier(tp string, notifier NotifierFactory) {
	NotifierFactories[tp] = notifier
}
 
// AlertContent contains infos for alerting notifier
type AlertContent struct {
	ID int64 
	State models.AlertStateType

	DashboardID int64 
	PanelID int64 

	Title string 
	Name string
	Message string 
	Error error 
	ImageURL string

	Metrics []*models.AlertMetric
}


// GetNotificationTitle returns the title of the alert rule including alert state.
func (a *AlertContent) GetNotificationTitle() string {
	return "[" + a.GetStateModel().Text + "] " + a.Title
}

// StateDescription contains visual information about the alert state.
type StateDescription struct {
	Color string
	Text  string
	Data  string
}

func (a *AlertContent) GetStateModel() *StateDescription {
	switch a.State {
	case models.AlertStateOK:
		return &StateDescription{
			Color: "#36a64f",
			Text:  "OK",
		}
	case models.AlertStateNoData:
		return &StateDescription{
			Color: "#888888",
			Text:  "No Data",
		}
	case models.AlertStateAlerting:
		return &StateDescription{
			Color: "#D63232",
			Text:  "Alerting",
		}
	case models.AlertStateUnknown:
		return &StateDescription{
			Color: "#888888",
			Text:  "Unknown",
		}
	default:
		panic("Unknown rule state for alert " + a.State)
	}
}
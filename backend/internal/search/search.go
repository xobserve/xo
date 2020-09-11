package search

import (
	"github.com/code-creatively/datav/backend/pkg/log"
)

var logger = log.RootLogger.New("logger", "search")

const (
	Search_Dash_By_Title = "1"

	FoldersLayout = "folders"
	ListLayout = "list"
	NullLayout = ""

	TypeFolder = "dash-folder"
	TypeDashboard = "dash-db"
)

package app

// Stat hold the application stats data or api stats data
type Stat struct {
	Name           string      `json:"name"`
	Count          float64     `json:"count"`
	AverageElapsed float64     `json:"average_elapsed"`
	ErrorPercent   float64     `json:"error_percent"`
	ExPercent      int         `json:"ex_percent"`
	Codes          map[int]int `json:"codes"`

	totalElapsed int

	errCount int
	exCount  int

	Alive   int `json:"alive"`
	Unalive int `json:"unalive"`
}

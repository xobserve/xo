package alert

// History holds the data for alert history
type History struct {
	ID        string   `json:"id"`
	Type      int      `json:"tp"`
	AppName   string   `json:"app_name"`
	Channel   string   `json:"channel"`
	InputDate string   `json:"input_date"`
	Alert     string   `json:"alert"`
	Value     float64  `json:"value"`
	Users     []string `json:"users"`
	Date      int64    `json:"-"`
}

// Histories is the list of alert history
type Histories []*History

func (a Histories) Len() int { // 重写 Len() 方法
	return len(a)
}
func (a Histories) Swap(i, j int) { // 重写 Swap() 方法
	a[i], a[j] = a[j], a[i]
}
func (a Histories) Less(i, j int) bool { // 重写 Less() 方法， 从大到小排序
	return a[i].Date > a[j].Date
}

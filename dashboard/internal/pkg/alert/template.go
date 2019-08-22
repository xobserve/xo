package alert

// Template defines how the alert composed
type Template struct {
	Name     string  `json:"name" cql:"name"`
	Type     string  `json:"type" cql:"type"`
	Label    string  `json:"label" cql:"label"`
	Compare  int     `json:"compare" cql:"compare"`
	Unit     string  `json:"unit" cql:"unit"`
	Duration int     `json:"duration" cql:"duration"`
	Keys     string  `json:"keys" cql:"keys"`
	Value    float64 `json:"value" cql:"value"`
}

package utils

import "encoding/json"

func Encode(data interface{}) ([]byte, error) {
	return json.Marshal(&data)
}

func Decode(data []byte, target interface{}) error {
	return json.Unmarshal(data, target)
}

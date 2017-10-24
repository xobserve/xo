package storage

import (
	"fmt"
	"time"
)

type ChannelMap map[string]string

// ChannelStore  a mysql storage
type ChannelStore struct {
	Id          int
	ChannelName string
	Ttl         int64
	CreateTime  int64
}

func NewChannelMap() ChannelMap {
	return make(ChannelMap)
}

// Store store channel
func (cm ChannelMap) Store(channelName string, ttl int64) error {
	query := fmt.Sprintf(`INSERT INTO channel_storage (channel_name, channel_tls, createtime)
	    VALUES ('%s','%d','%d')`, channelName, ttl, time.Now().UnixNano()/1e6)
	_, err := m.GetDb().Exec(query)
	return err
}

// Exist get channel
func (cm ChannelMap) Exist(channelName string) (bool, error) {
	c := cm[channelName]
	if c != "" {
		return true, nil
	}
	query := fmt.Sprintf(`SELECT * from channel_storage where channel_name = '%s'`, channelName)
	res, err := m.GetDb().Query(query)
	sc := &ChannelStore{}
	if err != nil {
		return false, err
	}
	if res.Next() {
		res.Scan(&sc.Id, &sc.ChannelName, &sc.Ttl, &sc.CreateTime)
		cm[channelName] = c
	}
	if sc.Id != 0 {
		return true, nil
	}
	return false, nil
}

package datasources

import (
	"github.com/datadefeat/datav/backend/pkg/models"
	// "fmt"
	"strconv"
	"time"

	"github.com/datadefeat/datav/backend/pkg/db"
	"github.com/datadefeat/datav/backend/pkg/log"
	"github.com/datadefeat/datav/backend/pkg/utils/simplejson"
)
 
var logger = log.RootLogger.New("logger", "datasources")

const InitDataSourceVersion = 1

func LoadAllDataSources() []*models.DataSource {
	datasources := make([]*models.DataSource, 0)
	rows, err := db.SQL.Query("select id,name, uid, version, type, url, is_default, json_data,basic_auth,created,updated from data_source")
	if err != nil {
		logger.Warn("get datasources error", "error", err)
		return nil
	}

	var id int64
	var version int
	var name, uid, tp, url string
	var isDefault, basicAuth bool
	var created, updated time.Time
	var rawJSON []byte
	for rows.Next() {
		err = rows.Scan(&id, &name, &uid, &version, &tp, &url, &isDefault, &rawJSON, &basicAuth, &created, &updated)
		if err != nil {
			logger.Warn("scan datasources error", "error", err)
			continue
		}

		jsonData := simplejson.New()
		err = jsonData.UnmarshalJSON(rawJSON)
		if err != nil {
			logger.Warn("unmarshal json data error", "error", err)
			continue
		}

		ds := &models.DataSource{
			Id:        id,
			Name:      name,
			Uid:       uid,
			Version:   version,
			Type:      tp,
			Url:       url,
			IsDefault: isDefault,
			JsonData:  jsonData,
			BasicAuth: basicAuth,
			Created:   created,
			Updated:   updated,
		}

		datasources = append(datasources, ds)
	}

	return datasources
}

func LoadDataSource(id string) *models.DataSource {
	var version int
	var name, uid, tp, url string
	var isDefault, basicAuth bool
	var created, updated time.Time
	var rawJSON []byte
	var rawSecureJson []byte

	err := db.SQL.QueryRow("select id,name, uid, version, type, url, is_default, json_data,secure_json_data,basic_auth,created,updated from data_source where id=?",
		id).Scan(&id, &name, &uid, &version, &tp, &url, &isDefault, &rawJSON, &rawSecureJson, &basicAuth, &created, &updated)
	if err != nil {
		logger.Warn("get datasources error", "error", err)
		return nil
	}

	jsonData := simplejson.New()
	err = jsonData.UnmarshalJSON(rawJSON)
	if err != nil {
		logger.Warn("unmarshal json data error", "error", err)
		return nil
	}

	secureJsonData := simplejson.New()
	err = secureJsonData.UnmarshalJSON(rawSecureJson)
	if err != nil {
		logger.Warn("unmarshal secure json data error", "error", err)
		return nil
	}

	sjMap,_:= secureJsonData.Map()
	secureJsonFields := make(map[string]bool)
	for k := range sjMap {
		secureJsonFields[k] = true
	}


	idN, _ := strconv.ParseInt(id, 10, 64)
	ds := &models.DataSource{
		Id:        idN,
		Name:      name,
		Uid:       uid,
		Version:   version,
		Type:      tp,
		Url:       url,
		IsDefault: isDefault,
		JsonData:  jsonData,
		SecureJsonData: secureJsonData,
		BasicAuth: basicAuth,
		Created:   created,
		Updated:   updated,
		SecureJsonFields: secureJsonFields,
	}

	return ds
}

func updateIsDefaultFlag(ds *models.DataSource) error {
	// Handle is default flag
	if ds.IsDefault {
		_, err := db.SQL.Exec("UPDATE data_source SET is_default=? WHERE  id <> ?", false, ds.Id)
		return err
	}
	return nil
}

// Copyright 2023 xObserve.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
package storageProvisioning

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	_ "github.com/go-sql-driver/mysql"
	"github.com/xobserve/xo/query/internal/datasource"
	"github.com/xobserve/xo/query/pkg/colorlog"
	"github.com/xobserve/xo/query/pkg/config"
	"github.com/xobserve/xo/query/pkg/db"
	"github.com/xobserve/xo/query/pkg/e"
	"github.com/xobserve/xo/query/pkg/models"
)

var logger = colorlog.RootLogger.New("logger", "provisioning")

func Init() error {
	if config.Data.Provisioning.Enable {
		ctx := context.Background()
		dir, err := os.Open(config.Data.Provisioning.Path)
		if err != nil {
			fmt.Println(err)
			return err
		}
		defer dir.Close()

		files, err := dir.Readdir(0)
		if err != nil {
			fmt.Println(err)
			return err
		}

		for _, file := range files {
			if file.IsDir() && file.Name() == "datasource" {
				// 导入datasource
				datasourceDir, err := os.Open(config.Data.Provisioning.Path + string(filepath.Separator) + "datasource")
				if err != nil {
					fmt.Println(err)
					return err
				}
				defer dir.Close()

				datasourceFiles, err := datasourceDir.Readdir(0)
				if err != nil {
					fmt.Println(err)
					return err
				}

				for _, datasourcefile := range datasourceFiles {
					if strings.HasSuffix(datasourcefile.Name(), ".json") {
						datasourceContent, err := os.ReadFile(config.Data.Provisioning.Path + string(filepath.Separator) + "datasource" + string(filepath.Separator) + datasourcefile.Name())
						if err != nil {
							logger.Error("open datasource file of provisioning", file.Name(), "error", err)
							return err
						}
						var ds *models.Datasource
						err = json.Unmarshal(datasourceContent, &ds)
						if err != nil {
							logger.Crit("provisioning import datasource", "error:", err)
							return err
						}

						superAdmin := &models.User{Id: models.SuperAdminId, Username: models.SuperAdminUsername}
						err = datasource.ImportFromJSON(ctx, string(datasourceContent), models.DefaultTeamId, superAdmin)

						if err != nil {
							if !e.IsErrUniqueConstraint(err) {
								logger.Crit("provisioning import datasource", "error:", err)
								return err
							}
						} else {
							logger.Info("import provisioning datasource", "name", datasourcefile.Name())
						}

					}
				}
			}

			if file.IsDir() && file.Name() == "dashboard" {
				// 导入dashboard
				dashboardDir, err := os.Open(config.Data.Provisioning.Path + string(filepath.Separator) + "dashboard")
				if err != nil {
					fmt.Println(err)
					return err
				}
				defer dir.Close()

				dashboardDirFiles, err := dashboardDir.Readdir(0)
				if err != nil {
					fmt.Println(err)
					return err
				}

				tx, err := db.Conn.Begin()
				if err != nil {
					return fmt.Errorf("new user error: %w", err)
				}
				defer tx.Rollback()

				for _, dashboardfile := range dashboardDirFiles {
					if strings.HasSuffix(dashboardfile.Name(), ".json") {
						dashboardContent, err := os.ReadFile(config.Data.Provisioning.Path + string(filepath.Separator) + "dashboard" + string(filepath.Separator) + dashboardfile.Name())
						if err != nil {
							logger.Error("open datasource file of provisioning", file.Name(), "error", err)
							return err
						}

						_, err = models.ImportDashboardFromJSON(tx, string(dashboardContent), models.DefaultTeamId, models.SuperAdminId)
						if err != nil {
							if !e.IsErrUniqueConstraint(err) {
								logger.Crit("init provisioning dashboard error", "error:", err)
								return err
							}
						} else {
							logger.Info("import provisioning dashboard", "name", dashboardfile.Name())
						}
					}
				}

				err = tx.Commit()
				if err != nil {
					return fmt.Errorf("commit transaction error: %w", err)
				}
			}
		}
	}

	return nil
}

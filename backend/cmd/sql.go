/*
Copyright © 2020 NAME HERE <EMAIL ADDRESS>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
package cmd

import (
	"github.com/CodeCreatively/datav/backend/cmd/sqls"
	// "fmt"

	"github.com/spf13/cobra"
	"github.com/spf13/pflag"

	"github.com/CodeCreatively/datav/backend/pkg/config"
	"github.com/CodeCreatively/datav/backend/pkg/log"
)

var createFlags []string
var dropFlags []string

// sqlCmd represents the sql command
var sqlCmd = &cobra.Command{
	Use:   "sql",
	Short: "Manage sqls,e.g create/drop table",
	Long:  ``,
	Run: func(cmd *cobra.Command, args []string) {
		config.Init("web.conf")
		log.InitLogger(config.Data.Log.Level)

		cmd.Flags().VisitAll(func(f *pflag.Flag) {
			switch f.Name {
			case "create":
				if len(createFlags) > 0 {
					sqls.CreateTable(createFlags)
				}
				break
			case "drop":
				if len(dropFlags) > 0 {
					sqls.DropTable(dropFlags)
				}
				break
			}
		})
	},
}

func init() {
	rootCmd.AddCommand(sqlCmd)

	sqlCmd.Flags().StringSliceVar(&createFlags, "create", nil, "Create Sql Tables")

	sqlCmd.Flags().StringSliceVar(&dropFlags, "drop", nil, "Drop Sql Tables")
}

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
	"github.com/CodeCreatively/datav/backend/pkg/config"
	"github.com/CodeCreatively/datav/backend/pkg/log"
	"github.com/spf13/cobra"
)

// initCmd represents the init command
var initCmd = &cobra.Command{
	Use:   "init",
	Short: "init the enviroments that datav needs to run",
	Long:  ``,
	Run: func(cmd *cobra.Command, args []string) {
		config.Init("web.conf")
		log.InitLogger(config.Data.Log.Level)

		sqls.CreateTables()
		log.RootLogger.Info("create tables ok")
		log.RootLogger.Info("init enviroments ok, you can start datav now")
	},
}

func init() {
	rootCmd.AddCommand(initCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// initCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// initCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}

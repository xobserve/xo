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
	"github.com/savecost/datav/backend/internal/plugins"
	"github.com/savecost/datav/backend/internal/registry"
	"github.com/savecost/datav/backend/pkg/config"
	"github.com/savecost/datav/backend/pkg/log"
	"github.com/spf13/cobra"
)

// initCmd represents the init command
var generateCmd = &cobra.Command{
	Use:   "generate",
	Short: "generate the necessary files for datav",
	Long:  ``,
	Run: func(cmd *cobra.Command, args []string) {
		config.Init("datav.conf")
		log.InitLogger(config.Data.Common.LogLevel)

		services := registry.GetServices()
		for _, service := range services {
			if service.Name == "PluginManager" {
				pluginManager := service.Instance.(*plugins.PluginManager)
				pluginManager.Generate()
			}
		}
		log.RootLogger.Info("generate files ok!")
	},
}

func init() {
	rootCmd.AddCommand(generateCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// initCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// initCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}

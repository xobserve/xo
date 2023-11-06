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

package cmd

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/spf13/cobra"
	server "github.com/xObserve/xObserve/query/internal"
	"github.com/xObserve/xObserve/query/pkg/colorlog"
	"github.com/xObserve/xObserve/query/pkg/config"
)

var cfgFile string

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "starship",
	Short: "",
	Long:  ``,
	// Uncomment the following line if your bare application
	// has an action associated with it:
	Run: func(cmd *cobra.Command, args []string) {
		var cfg = "xobserve.yaml"
		if cfgFile != "" {
			cfg = cfgFile
		}
		config.Init(cfg)
		err := colorlog.InitLogger(config.Data.Common.LogLevel)
		if err != nil {
			fmt.Println("init logger error", err)
			return
		}

		colorlog.RootLogger.Info("init config", "config", config.Data)
		server := server.New()
		err = server.Start()
		if err != nil {
			colorlog.RootLogger.Crit("init server error", "error", err)
			return
		}
		// 等待服务器停止信号
		chSig := make(chan os.Signal)
		signal.Notify(chSig, syscall.SIGINT, syscall.SIGTERM)
		sig := <-chSig
		colorlog.RootLogger.Info("server received signal", "signal", sig)
		server.Close()
	},
}

func init() {
	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file")
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

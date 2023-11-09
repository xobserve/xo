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
	"context"
	"fmt"
	"log"
	"os"

	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
	"github.com/xObserve/xObserve/otel-collector/internal/migrationmanager"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var dsn *string

// initCmd represents the init command
var migrateCmd = &cobra.Command{
	Use:   "migrate",
	Short: "generate databases tables for xObserve",
	Long:  ``,
	Run: func(cmd *cobra.Command, args []string) {
		startMigrate()
	},
}

func init() {
	rootCmd.AddCommand(migrateCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// initCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// initCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
	dsn = migrateCmd.Flags().String("dsn", "tcp://localhost:9000", "clickhouse DSN, e.g tcp://localhost:9000")
	// init zap logger
	config := zap.NewProductionConfig()
	config.EncoderConfig.EncodeLevel = zapcore.LowercaseLevelEncoder
	config.EncoderConfig.TimeKey = "timestamp"
	config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	logger, err := config.Build()
	if err != nil {
		log.Fatalf("Failed to initialize zap logger %v", err)
	}
	// replace global logger
	// TODO(dhawal1248): move away from global logger
	zap.ReplaceGlobals(logger)
}

func startMigrate() {
	logger := zap.L().With(zap.String("component", "migrate cli"))
	f := pflag.NewFlagSet("Schema Migrator CLI Options", pflag.ExitOnError)

	f.Usage = func() {
		fmt.Println(f.FlagUsages())
		os.Exit(1)
	}

	f.String("dsn", "", "Clickhouse DSN")
	f.String("cluster-name", "cluster", "Cluster name to use while running migrations")
	f.Bool("disable-duration-sort-feature", false, "Flag to disable the duration sort feature. Defaults to false.")
	f.Bool("disable-timestamp-sort-feature", false, "Flag to disable the timestamp sort feature. Defaults to false.")

	err := f.Parse(os.Args[1:])
	if err != nil {
		logger.Fatal("Failed to parse args", zap.Error(err))
	}

	clusterName, err := f.GetString("cluster-name")
	if err != nil {
		logger.Fatal("Failed to get cluster name from args", zap.Error(err))
	}

	disableDurationSortFeature, err := f.GetBool("disable-duration-sort-feature")
	if err != nil {
		logger.Fatal("Failed to get disable duration sort feature flag from args", zap.Error(err))
	}

	disableTimestampSortFeature, err := f.GetBool("disable-timestamp-sort-feature")
	if err != nil {
		logger.Fatal("Failed to get disable timestamp sort feature flag from args", zap.Error(err))
	}

	if *dsn == "" {
		logger.Fatal("dsn is a required field")
	}

	// set cluster env so that golang-migrate can use it
	// the value of this env would replace all occurences of {{.XOBSERVE_CLUSTER}} in the migration files
	os.Setenv("XOBSERVE_CLUSTER", clusterName)

	manager, err := migrationmanager.New(*dsn, clusterName, disableDurationSortFeature, disableTimestampSortFeature)
	if err != nil {
		logger.Fatal("Failed to create migration manager", zap.Error(err))
	}
	defer manager.Close()

	err = manager.Migrate(context.Background())
	if err != nil {
		logger.Fatal("Failed to run migrations", zap.Error(err))
	}
}

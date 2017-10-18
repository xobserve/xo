// Copyright © 2017 NAME HERE <EMAIL ADDRESS>
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
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

	"github.com/spf13/cobra"
	"github.com/teamsaas/meq/common/security"
)

// genCmd represents the gen command
var genCmd = &cobra.Command{
	Use:   "gen",
	Short: "A brief description of your command",
	Long: `A longer description that spans multiple lines and likely contains examples
and usage of using your command. For example:

Cobra is a CLI library for Go that empowers applications.
This application is a tool to generate the needed files
to quickly create a Cobra application.`,
	Run: func(cmd *cobra.Command, args []string) {
		license, mk := security.NewLicenseAndMaster()
		f, err := os.OpenFile("license.key", os.O_APPEND|os.O_CREATE|os.O_RDWR, 0666)
		if err != nil {
			fmt.Println("open license.key error:", err)
			return
		}
		defer f.Close()

		_, err = f.WriteString(fmt.Sprintf("license:%s, default master key:%s\n", license, mk))
		if err != nil {
			fmt.Println("write license error:", err)
			return
		}

		fmt.Printf("generate new license: %s, please paste it to broker.license in meq.yaml\n", license)
		fmt.Printf("generate new master key: %s, please keep it in a safe place\n", mk)
		fmt.Println("license and masterkey has been kept in license.key file ")
		fmt.Println("Before you start meq broker,please update meq.yaml's broker.license with your license")
	},
}

func init() {
	RootCmd.AddCommand(genCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// genCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// genCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")

}

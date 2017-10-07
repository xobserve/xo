// Copyright © 2017 TeamSaas.com <cto@188.com>
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

package main

import (
	"github.com/teamsaas/meq/cmd"
	"github.com/teamsaas/meq/common"
	"github.com/teamsaas/sdks"
)

func main() {
	common.InitConfig()
	sdks.InitLogger(common.Conf.Common.LogPath, common.Conf.Common.LogLevel, common.Conf.Common.IsDebug, common.Conf.Common.Service)
	cmd.Execute()
}

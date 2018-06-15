//  Copyright © 2018 Sunface <CTO@188.com>
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
package service

import (
	"go.uber.org/zap"

	"github.com/bwmarrin/snowflake"
)

func StartIDGenerator(b *Broker) {
	var err error
	b.idgen, err = snowflake.NewNode(b.conf.Broker.ServerID)
	if err != nil {
		L.Fatal("start id generator error", zap.Error(err))
	}
}

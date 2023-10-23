// Copyright 2023 Datav.io Team
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
package colorlog

import (
	"github.com/go-stack/stack"
	log "github.com/inconshreveable/log15"
)

var RootLogger = log.New()

func InitLogger(level string) error {
	l := log.CallerFileHandler(log.StdoutHandler)
	lvl, err := log.LvlFromString(level)
	if err != nil {
		return err
	}

	RootLogger.SetHandler(log.MultiHandler(
		log.LvlFilterHandler(lvl, l),
	))

	return nil
}

func Stack(skip int) string {
	call := stack.Caller(skip)
	s := stack.Trace().TrimBelow(call).TrimRuntime()
	return s.String()
}

// Copyright 2023 xobserve.io Team
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
package common

import "github.com/xObserve/xObserve/query/pkg/e"

type Resp struct {
	Status  string      `json:"status"`
	Data    interface{} `json:"data,omitempty"`
	Message string      `json:"message,omitempty"`
	Version string      `json:"version"`
}

func RespSuccess(data interface{}) *Resp {
	r := &Resp{}
	r.Status = Success
	r.Data = data
	r.Version = "xobserve"
	return r
}

func RespError(msg string) *Resp {
	r := &Resp{}
	r.Status = Error
	r.Message = msg
	r.Version = "xobserve"
	return r
}

func RespErrorWithData(msg string, data interface{}) *Resp {
	r := &Resp{}
	r.Status = Error
	r.Message = msg
	r.Data = data
	r.Version = "xobserve"
	return r
}

func RespInternalError() *Resp {
	r := &Resp{}
	r.Status = Error
	r.Message = e.Internal
	r.Version = "xobserve"

	return r
}

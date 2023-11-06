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
package e

type Error struct {
	Status  int
	Message string
}

func New(status int, msg string) *Error {
	return &Error{
		Status:  status,
		Message: msg,
	}
}

const (
	Malicious          = "malicious"
	UserNotExist       = "user not exist"
	PasswordIncorrect  = "password incorrect"
	DB                 = "数据库异常"
	Internal           = "服务器内部错误"
	NeedLogin          = "你需要登录"
	NoEditorPermission = "只有编辑角色才能执行此操作"
	ParamInvalid       = "请求参数不正确"
	NotFound           = "目标不存在"
	NoPermission       = "no permission"
	NoAdminPermission  = "你需要管理员权限"
	BadRequest         = "非法操作"
	AlreadyExist       = "目标已经存在"

	// 标签类
	TagNotExist   = "标签不存在"
	DisabledByTag = "你的文章已经被禁，请在创作中心中，点击文章标题旁的标签，申请解封"

	// Teams
	TeamNotExist = "team not exist"

	// users
	UsernameOrPasswordEmpty = "user name or password empty"
)

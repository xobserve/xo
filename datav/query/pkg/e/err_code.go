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
	Malicious             = "malicious"
	UserNotExist          = "user not exist"
	PasswordIncorrect     = "password incorrect"
	NeedWebsiteAdmin      = "only website admin can do this"
	NeedWebsiteSuperAdmin = "only website super admin can do this"
	NeedTeamAdmin         = "only team admin can do this"
	NeedTenantAdmin       = "only tenant admin can do this"
	NotTeamMember         = "you are not a member of this team"
	NotTenantUser         = "you are not a member of this tenant"
	Internal              = "server Internal Error"
	NeedLogin             = "you need login"
	ParamInvalid          = "request param is not valid"
	NotFound              = "target not exist目标不存在"
	NoPermission          = "no permission"
	BadRequest            = "bad request"
	AlreadyExist          = "target already exist"
	UnsignUserError       = "unsignin user can't visit root path"

	// Tenant
	TenantNotExist = "tenant not exist"

	// Teams
	TeamNotExist    = "team not exist"
	TeamBeenDeleted = "team has been logically deleted"

	// users
	UsernameOrPasswordEmpty = "user name or password empty"
	UserBeenDeleted         = "user has been logically deleted"
)

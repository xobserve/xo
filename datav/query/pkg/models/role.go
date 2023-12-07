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
package models

type RoleType string

const (
	ROLE_VIEWER      = "Viewer"
	ROLE_ADMIN       = "Admin"
	ROLE_SUPER_ADMIN = "SuperAdmin"
)

func (r RoleType) IsValid() bool {
	return r == ROLE_VIEWER || r == ROLE_ADMIN
}

func (r RoleType) IsSuperAdmin() bool {
	return r == ROLE_SUPER_ADMIN
}

func (r RoleType) IsAdmin() bool {
	return r == ROLE_ADMIN || r == ROLE_SUPER_ADMIN
}

func (r RoleType) IsEditor() bool {
	return r == ROLE_ADMIN
}

func IsAdmin(r RoleType) bool {
	return r == ROLE_ADMIN
}

func RoleSortWeight(role RoleType) int {
	switch role {
	case ROLE_VIEWER:
		return 0
	case ROLE_ADMIN:
		return 2
	case ROLE_SUPER_ADMIN:
		return 3
	default:
		return 0
	}
}

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
package models

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"time"

	"github.com/xObserve/xObserve/query/pkg/db"
)

// ! You should not modify the two constants below
const (
	SuperAdminUsername = "admin"
	SuperAdminId       = 1
)

func IsSuperAdmin(id int64) bool {
	return id == SuperAdminId
}

type Session struct {
	Token      string `json:"token"`
	User       *User  `json:"user"`
	CreateTime time.Time
}

type User struct {
	Id                int64      `json:"id"`
	Username          string     `json:"username"`
	Name              string     `json:"name"`
	Email             *string    `json:"email"`
	Mobile            string     `json:"mobile"`
	Role              RoleType   `json:"role"`
	LastSeenAt        *time.Time `json:"lastSeenAt,omitempty"`
	Created           time.Time  `json:"created,omitempty"`
	Updated           time.Time  `json:"updated,omitempty"`
	Visits            int        `json:"visits,omitempty"`
	CurrentTenant     int64      `json:"currentTenant,omitempty"`
	CurrentTenantName string     `json:"tenantName,omitempty"`
	CurrentTenantRole RoleType   `json:"tenantRole"`
	CurrentTeam       int64      `json:"currentTeam,omitempty"`
	Data              *UserData  `json:"data,omitempty"`
	Salt              string     `json:"-"`
	Password          string     `json:"-"`
}

type Users []*User

func (s Users) Len() int      { return len(s) }
func (s Users) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s Users) Less(i, j int) bool {
	return s[i].Created.Unix() > s[j].Created.Unix()
}

type UserData struct {
	ThemeColor    string `json:"themeColor,omitempty"`
	ThemeFontsize int    `json:"themeFontsize,omitempty"`
}

// func QueryUser(id int64, username string, email string) (*User, error) {
// 	user := &User{}
// 	err := db.Conn.QueryRow(`SELECT id,username,name,email,mobile,password,salt,last_seen_at FROM user WHERE id=? or username=? or email=?`,
// 		id, username, email).Scan(&user.Id, &user.Username, &user.Name, &user.Email, &user.Mobile, &user.Password, &user.Salt, &user.LastSeenAt)
// 	if err != nil && err != sql.ErrNoRows {
// 		return user, err
// 	}

// 	if user.Id == 0 {
// 		return user, nil
// 	}

// 	globalMember, err := QueryTeamMember(GlobalTeamId, user.Id)
// 	if err != nil {
// 		return user, err
// 	}

// 	user.Role = globalMember.Role

// 	return user, nil
// }

func QueryUserById(ctx context.Context, id int64) (*User, error) {
	user := &User{}
	var data []byte
	err := db.Conn.QueryRowContext(ctx, `SELECT id,username,name,email,mobile,role,password,salt,data,current_tenant,current_team,last_seen_at,created FROM user WHERE id=?`,
		id).Scan(&user.Id, &user.Username, &user.Name, &user.Email, &user.Mobile, &user.Role, &user.Password, &user.Salt, &data, &user.CurrentTenant, &user.CurrentTeam, &user.LastSeenAt, &user.Created)
	if err != nil && err != sql.ErrNoRows {
		return user, err
	}

	if data != nil {
		err := json.Unmarshal(data, &user.Data)
		if err != nil {
			return user, err
		}
	}

	if user.Id == 0 {
		return user, nil
	}

	tenantUser, err := QueryTenantUser(ctx, user.CurrentTenant, user.Id)
	if err != nil && err != sql.ErrNoRows {
		return user, err
	}

	if err == nil {
		user.CurrentTenantRole = tenantUser.Role
	}

	tenant, err := QueryTenant(ctx, user.CurrentTenant)
	if err != nil {
		return user, err
	}

	user.CurrentTenantName = tenant.Name
	return user, nil
}

func QueryUserByName(ctx context.Context, username string) (*User, error) {
	user := &User{}
	var data []byte
	err := db.Conn.QueryRowContext(ctx, `SELECT id,username,name,email,mobile,role,password,salt,data,current_tenant,current_team, last_seen_at FROM user WHERE username=?`,
		username).Scan(&user.Id, &user.Username, &user.Name, &user.Email, &user.Mobile, &user.Role, &user.Password, &user.Salt, &data, &user.CurrentTenant, &user.CurrentTeam, &user.LastSeenAt)
	if err != nil && err != sql.ErrNoRows {
		return user, err
	}

	if data != nil {
		err := json.Unmarshal(data, &user.Data)
		if err != nil {
			return user, err
		}
	}

	if user.Id == 0 {
		return user, nil
	}

	return user, nil
}

func QueryUserIdByName(username string) (int64, error) {
	var id int64
	err := db.Conn.QueryRow(`SELECT id FROM user WHERE username=?`, username).Scan(&id)
	if err != nil {
		return 0, err
	}

	return id, nil
}

type GithubUser struct {
	ID       int64  `json:"id"`
	Avatar   string `json:"avatar_url"`
	Username string `json:"login"`
	Name     string `json:"name"`
	Tagline  string `json:"bio"`
	Website  string `json:"blog"`
	Location string `json:"location"`
}

func GetUserTenantAndTeamId(ctx context.Context, u *User) (int64, int64, error) {
	var tenantId int64
	if u == nil {
		tenantId = DefaultTenantId
	} else {
		tenantId = u.CurrentTenant
	}

	var teamId int64
	if u != nil {
		teamId = u.CurrentTeam
	} else {
		teams, err := QueryTenantPublicTeamIds(tenantId)
		if err != nil {
			return 0, 0, err
		}

		if len(teams) == 0 {
			return 0, 0, errors.New("there is no public team for you to view in current tenant")
		}

		teamId = teams[0]
	}

	return tenantId, teamId, nil
}

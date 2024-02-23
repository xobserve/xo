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

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/xobserve/xo/query/pkg/db"
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
	Id            int64      `json:"id"`
	Username      string     `json:"username"`
	Name          string     `json:"name"`
	Email         *string    `json:"email"`
	Mobile        string     `json:"mobile"`
	Role          RoleType   `json:"role"`
	LastSeenAt    *time.Time `json:"lastSeenAt,omitempty"`
	Created       time.Time  `json:"created,omitempty"`
	Updated       time.Time  `json:"updated,omitempty"`
	Visits        int        `json:"visits,omitempty"`
	CurrentTenant int64      `json:"currentTenant,omitempty"`
	CurrentTeam   int64      `json:"currentTeam,omitempty"`
	Status        int        `json:"status"` // 0: normal, 1: deleted
	Data          *UserData  `json:"data,omitempty"`
	Salt          string     `json:"-"`
	Password      string     `json:"-"`
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

func QueryUserById(ctx context.Context, id int64) (*User, error) {
	user := &User{}
	var data []byte
	err := db.Conn.QueryRowContext(ctx, `SELECT id,username,name,email,mobile,role,password,salt,data,current_tenant,current_team,status, last_seen_at,created FROM user WHERE id=?`,
		id).Scan(&user.Id, &user.Username, &user.Name, &user.Email, &user.Mobile, &user.Role, &user.Password, &user.Salt, &data, &user.CurrentTenant, &user.CurrentTeam, &user.Status, &user.LastSeenAt, &user.Created)
	if err != nil {
		return nil, err
	}

	if data != nil {
		err := json.Unmarshal(data, &user.Data)
		if err != nil {
			return nil, err
		}
	}

	return user, nil
}

func QueryUserByName(ctx context.Context, username string) (*User, error) {
	user := &User{}
	var data []byte
	err := db.Conn.QueryRowContext(ctx, `SELECT id,username,name,email,mobile,role,password,salt,data,current_tenant,current_team,status, last_seen_at FROM user WHERE username=?`,
		username).Scan(&user.Id, &user.Username, &user.Name, &user.Email, &user.Mobile, &user.Role, &user.Password, &user.Salt, &data, &user.CurrentTenant, &user.CurrentTeam, &user.Status, &user.LastSeenAt)
	if err != nil {
		return nil, err
	}

	if data != nil {
		err := json.Unmarshal(data, &user.Data)
		if err != nil {
			return nil, err
		}
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

func DeleteUser(userId int64, tx *sql.Tx) error {
	_, err := tx.Exec("DELETE FROM user WHERE id=?", userId)
	if err != nil {
		return fmt.Errorf("delete user error: %w", err)
	}

	_, err = tx.Exec("DELETE FROM tenant_user WHERE user_id=?", userId)
	if err != nil {
		return fmt.Errorf("delete team member error: %w", err)
	}

	_, err = tx.Exec("DELETE FROM team_member WHERE user_id=?", userId)
	if err != nil {
		return fmt.Errorf("delete team member error: %w", err)
	}

	_, err = tx.Exec("DELETE FROM sessions WHERE user_id=?", userId)
	if err != nil {
		return fmt.Errorf("delete session error: %w", err)
	}

	_, err = tx.Exec("DELETE FROM star_dashboard WHERE user_id=?", userId)
	if err != nil {
		return fmt.Errorf("delete star dashboard error: %w", err)
	}

	return nil
}

func GetAllUserIds() ([]int64, error) {
	rows, err := db.Conn.Query(`SELECT id FROM user`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := make([]int64, 0)

	for rows.Next() {
		var id int64
		err := rows.Scan(&id)
		if err != nil {
			return nil, err
		}

		users = append(users, id)
	}
	return users, nil
}

func SyncUserToTenants(ctx context.Context, userId int64, role RoleType, tx *sql.Tx) error {
	tenantIds, err := GetEnableSyncUsersTenants()
	if err != nil {
		return err
	}

	if len(tenantIds) > 0 {
		for _, tenantId := range tenantIds {
			err = AddUserToTenant(userId, tenantId, role, tx, ctx)
			if err != nil {
				return err
			}
		}
	}
	return nil
}

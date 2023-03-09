package models

import (
	"database/sql"
	"time"

	"github.com/ai-apm/aiapm/backend/pkg/db"
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
	Id         int64      `json:"id"`
	Username   string     `json:"username"`
	Name       string     `json:"name"`
	Email      string     `json:"email"`
	Mobile     string     `json:"mobile"`
	Role       RoleType   `json:"role"`
	LastSeenAt *time.Time `json:"last_seen_at,omitempty"`
	Created    time.Time  `json:"created,omitempty"`
	Updated    time.Time  `json:"updated,omitempty"`
	SideMenu   int64      `json:"sidemenu,omitempty"`
	Salt       string     `json:"-"`
	Password   string     `json:"-"`
}

type Users []*User

func (s Users) Len() int      { return len(s) }
func (s Users) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s Users) Less(i, j int) bool {
	return s[i].Created.Unix() > s[j].Created.Unix()
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

func QueryUserById(id int64) (*User, error) {
	user := &User{}
	err := db.Conn.QueryRow(`SELECT id,username,name,email,mobile,password,salt,sidemenu,last_seen_at FROM user WHERE id=?`,
		id).Scan(&user.Id, &user.Username, &user.Name, &user.Email, &user.Mobile, &user.Password, &user.Salt, &user.SideMenu, &user.LastSeenAt)
	if err != nil && err != sql.ErrNoRows {
		return user, err
	}

	if user.Id == 0 {
		return user, nil
	}

	globalMember, err := QueryTeamMember(GlobalTeamId, user.Id)
	if err != nil {
		return user, err
	}

	user.Role = globalMember.Role

	return user, nil
}

func QueryUserByName(username string) (*User, error) {
	user := &User{}
	err := db.Conn.QueryRow(`SELECT id,username,name,email,mobile,password,salt,sidemenu,last_seen_at FROM user WHERE username=?`,
		username).Scan(&user.Id, &user.Username, &user.Name, &user.Email, &user.Mobile, &user.Password, &user.Salt, &user.SideMenu, &user.LastSeenAt)
	if err != nil && err != sql.ErrNoRows {
		return user, err
	}

	if user.Id == 0 {
		return user, nil
	}

	return user, nil
}

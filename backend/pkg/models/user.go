package models

import (
	"database/sql"
	"github.com/datadefeat/datav/backend/pkg/db"
	"time"
)

// dont change !
const (
	SuperAdminUsername = "admin"
	SuperAdminId = 1
)

type User struct {
	Id         int64     `json:"id"`
	Username   string    `json:"username"`
	Name       string    `json:"name"`
	Email      string    `json:"email"`
	Mobile     string    `json:"mobile"`
	SideMenu   int64     `json:"sidemenu"`
	Role       RoleType  `json:"role"`
	LastSeenAt time.Time `json:"last_seen_at,omitempty"`
	Created    time.Time `json:"created,omitempty"`
	Updated    time.Time `json:"updated,omitempty"`
	Salt       string    `json:"-"`
	Password   string    `json:"-"`
}

type Users []*User

func (s Users) Len() int      { return len(s) }
func (s Users) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s Users) Less(i, j int) bool {
	return s[i].LastSeenAt.Unix() > s[j].LastSeenAt.Unix()
}



func QueryUser(id int64, username string, email string) (*User,error) {
	user := &User{}
	err := db.SQL.QueryRow(`SELECT id,username,name,email,mobile,password,salt,sidemenu,last_seen_at FROM user WHERE id=? or username=? or email=?`,
		id, username, email).Scan(&user.Id, &user.Username, &user.Name, &user.Email, &user.Mobile, &user.Password, &user.Salt,&user.SideMenu, &user.LastSeenAt)
	if err != nil && err != sql.ErrNoRows{
		return user,err
	}

	if user.Id == 0 {
		return user, nil
	}

	globalMember,err := QueryTeamMember(GlobalTeamId,user.Id)
	if err != nil {
		return user,err
	}

	user.Role = globalMember.Role

	return user,nil
}

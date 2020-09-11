package models

import (
	"encoding/json"
	"database/sql"
	"github.com/code-creatively/datav/backend/pkg/db"
	"github.com/code-creatively/datav/backend/pkg/utils"
	"fmt"
	"time"
	"github.com/code-creatively/datav/backend/pkg/utils/simplejson"
)

type DashboardRef struct {
	Uid  string
	Slug string
}

// Dashboard model
type Dashboard struct {
	Id       int64 `json:"id"`
	Uid      string `json:"uid"`
	Slug     string `json:"slug,omitempty"`
	Title    string `json:"title"`
	Version  int `json:"version,omitempty"`
	
	Editable bool `json:"editable,omitempty"`

	Created  time.Time `json:"created,omitempty"`
	Updated  time.Time `json:"updated,omitempty"`

	CreatedBy int64 `json:"createdBy,omitempty"`
	FolderId  int `json:"folderId,omitempty"`
	IsFolder  bool `json:"isFolder,omitempty"`
	

	Data  *simplejson.Json `json:"data,omitempty"`
}

func (d *Dashboard) SetId(id int64) {
	d.Id = id
	d.Data.Set("id", id)
}

func (d *Dashboard) SetUid(uid string) {
	d.Uid = uid
	d.Data.Set("uid", uid)
}

func (d *Dashboard) SetVersion(version int) {
	d.Version = version
	d.Data.Set("version", version)
}

// UpdateSlug updates the slug
func (dash *Dashboard) UpdateSlug() {
	dash.Slug = utils.Slugify(dash.Title)
}

// GetUrl return the html url for a folder if it's folder, otherwise for a dashboard
func (dash *Dashboard) GetUrl() string {
	return GetDashboardFolderUrl(dash.IsFolder, dash.Uid, dash.Slug)
}

// Return the html url for a dashboard
func (dash *Dashboard) GenerateUrl() string {
	return GetDashboardUrl(dash.Uid, dash.Slug)
}

// GetDashboardFolderUrl return the html url for a folder if it's folder, otherwise for a dashboard
func GetDashboardFolderUrl(isFolder bool, uid string, slug string) string {
	if isFolder {
		return GetFolderUrl(uid, slug)
	}

	return GetDashboardUrl(uid, slug)
}

// GetDashboardUrl return the html url for a dashboard
func GetDashboardUrl(uid string, slug string) string {
	return fmt.Sprintf("/d/%s/%s",  uid, slug)
}

// GetFullDashboardUrl return the full url for a dashboard
func GetFullDashboardUrl(uid string, slug string) string {
	return fmt.Sprintf("d/%s/%s", uid, slug)
}

// GetFolderUrl return the html url for a folder
func GetFolderUrl(folderUid string, slug string) string {
	return fmt.Sprintf("/dashboards/f/%s/%s",  folderUid, slug)
}

type DashboardMeta struct {
	IsStarred             bool      `json:"isStarred,omitempty"`
	IsHome                bool      `json:"isHome,omitempty"`
	IsSnapshot            bool      `json:"isSnapshot,omitempty"`
	Type                  string    `json:"type,omitempty"`
	CanSave               bool      `json:"canSave"`
	CanEdit               bool      `json:"canEdit"`
	CanAdmin              bool      `json:"canAdmin"`
	CanStar               bool      `json:"canStar"`
	Slug                  string    `json:"slug"`
	Url                   string    `json:"url"`
	Expires               time.Time `json:"expires"`
	Created               time.Time `json:"created"`
	Updated               time.Time `json:"updated"`
	UpdatedBy             string    `json:"updatedBy"`
	OwnedBy               int64     `json:"ownedBy"` // team that ownes this dashboard
	CreatedBy             string    `json:"createdBy"`
	Version               int       `json:"version"`
	HasAcl                bool      `json:"hasAcl"`
	IsFolder              bool      `json:"isFolder"`
	FolderId              int64     `json:"folderId"`
	FolderTitle           string    `json:"folderTitle"`
	FolderUrl             string    `json:"folderUrl"`
	Provisioned           bool      `json:"provisioned"`
	ProvisionedExternalId string    `json:"provisionedExternalId"`
}

func QueryAclTeamIds(dashId int64) ([]int64,error) {
	teamIds := make([]int64,0)
	rows,err := db.SQL.Query("SELECT team_id FROM dashboard_acl WHERE dashboard_id=?",dashId)
	if err !=nil  {
		if err != sql.ErrNoRows {
			return teamIds,err
		}
		return teamIds,nil
	}

	for rows.Next() {
		var teamId int64 
		err := rows.Scan(&teamId)
		if err != nil {
			continue
		}
		teamIds = append(teamIds,teamId)
	}

	return teamIds,nil
}

const (
	UserAcl_NoPermissionRules = 0
	UserAcl_PermissionAllow= 1
	UserAcl_PermissionForbidden = 2
)
// the second param stands for 'user can do nothing to the dashboard'
func QueryUserHasDashboardPermssion(dashId int64, userId int64,permission int) int8 {
	var rawJSON []byte
	err := db.SQL.QueryRow("SELECT permission from dashboard_user_acl WHERE dashboard_id=? and user_id=?",dashId,userId).Scan(&rawJSON)
	if err != nil {
		return UserAcl_NoPermissionRules
	}
	
	var permissions []int
	json.Unmarshal(rawJSON,&permissions)

	for _,p := range permissions {
		if p == permission {
			return UserAcl_PermissionAllow
		}
	}

	return UserAcl_PermissionForbidden
} 

func QueryDashboard(id int64) (*Dashboard,error) {
	dash := &Dashboard{}

	var rawJSON []byte
	err := db.SQL.QueryRow("SELECT uid,title,slug,data FROM dashboard WHERE id = ?", id).Scan(&dash.Uid,&dash.Title,&dash.Slug,&rawJSON)
	if err != nil {
		return  nil,err
	}

	data := simplejson.New()
	err = data.UnmarshalJSON(rawJSON)
	dash.Data = data

	dash.Id = id

	return dash, nil
}
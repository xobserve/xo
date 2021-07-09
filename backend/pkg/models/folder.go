package models

import (
	"fmt"
	"time"

	"github.com/datav-io/datav/backend/pkg/utils"
)

const (
	RootFolderId   = 0
	RootFolderName = "General"
)

type Folder struct {
	Id       int    `json:"id"`
	ParentId int    `json:"parent_id"`
	Uid      string `json:"uid"`

	Title string `json:"title"`
	Slug  string `json:"slug"`
	Url   string `json:"url"`

	Type string   `json:"type"`
	Tags []string `json:"tags"`

	OwnedBy   int64 `json:"ownedBy"`             //  team that ownes this folder
	CreatedBy int64 `json:"createdBy,omitempty"` // user that creates this folder

	Created time.Time `json:"created,omitempty"`
	Updated time.Time `json:"updated,omitempty"`
}

func (folder *Folder) InitNew() {
	folder.Uid = utils.GenerateShortUID()
	folder.Created = time.Now()
	folder.Updated = time.Now()

	folder.UpdatSlug()
	folder.UpdateUrl()
}

// UpdateSlug updates the slug
func (folder *Folder) UpdatSlug() {
	folder.Slug = utils.Slugify(folder.Title)
}

// UpdateUrl updates the url
func (folder *Folder) UpdateUrl() {
	folder.Url = fmt.Sprintf("/f/%s/dashboards", folder.Uid)
}

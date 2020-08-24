package search

import (
	"github.com/datadefeat/datav/backend/pkg/models"
	"strings"
)

type SearchHit struct {
	Id int64 `json:"id"`
	Uid string  `json:"uid"`
	Title string `json:"title"`
	Url string  `json:"url"`
	Slug string  `json:"slug"`
	Type string  `json:"type"`
	Tags []string  `json:"tags"`
	IsStarred bool `json:"isStarred"`
	FolderId int `json:"folderId"`
	FolderUid string `json:"folderUid"`
	FolderTitle string  `json:"folderTitle"`
	FolderUrl string  `json:"folderUrl"`
}


type SearchHitList []*SearchHit

func (s SearchHitList) Len() int      { return len(s) }
func (s SearchHitList) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s SearchHitList) Less(i, j int) bool {
	if s[i].Title == models.RootFolderName {
		return false
	}

	if s[i].Type == TypeFolder && s[j].Type == TypeDashboard {
		return true
	}

	if s[i].Type == TypeDashboard && s[j].Type == TypeFolder {
		return false
	}

	return strings.ToLower(s[i].Title) < strings.ToLower(s[j].Title)
}

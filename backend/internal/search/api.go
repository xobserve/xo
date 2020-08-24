package search

import (
	"sort"
	// "fmt"
	"strconv"
	"strings"

	"github.com/datadefeat/datav/backend/internal/cache"
	"github.com/datadefeat/datav/backend/internal/dashboard"
	"github.com/datadefeat/datav/backend/internal/folders"
	"github.com/datadefeat/datav/backend/pkg/common"
	"github.com/datadefeat/datav/backend/pkg/i18n"
	"github.com/datadefeat/datav/backend/pkg/models"
	"github.com/gin-gonic/gin"
)

type SearchReq struct {
	Query       string `json:"query"`
	Starred     bool   `json:"starred"`
	SkipRecent  bool   `json:"skipRecent"`
	SkipStarred bool   `json:"skipStarred"`
	Sort        string `json:"sort"`
	FolderIds   string `json:"folderIds"`
	Tags        string `json:"tags"`
	Layout      string `json:"layout"`
	Type        string `json:"type"`
}

func Search(c *gin.Context) {
	folderIds, _ := strconv.Atoi(c.Query("folderIds"))
	layout := c.Query("layout")
	tp := c.Query("type")
	query := strings.ToLower(strings.TrimSpace(c.Query("query")))

	tags := c.QueryArray("tag")

	dashIds := c.QueryArray("dashboardIds")
	if (len(dashIds) > 0) {
		// get dashboards by ids
		res := make(SearchHitList, 0)
		dashes := dashboard.QueryDashboardsByIds(dashIds)
		for _,dash := range dashes {
			dtags := dash.Data.Get("tags").MustStringArray()
			if !filterTags(dtags,tags) {
				continue
			}

			f := folders.QueryById(dash.FolderId)
			if f == nil {
				c.JSON(400, common.ResponseI18nError(i18n.FolderNotExist))
				return
			}

			dash.UpdateSlug()
			r := &SearchHit{
				Id:          dash.Id,
				Uid:         dash.Uid,
				Title:       dash.Title,
				Url:         dash.GenerateUrl(),
				Slug:        dash.Slug,
				Type:        TypeDashboard,
				Tags:        dtags,
				IsStarred:   false,
				FolderId:    f.Id,
				FolderTitle: f.Title,
				FolderUid:   f.Uid,
				FolderUrl:   f.Url,
			}

			res = append(res, r)
		}
		c.JSON(200,common.ResponseSuccess(res))
		return
	}

	// search folders and dashboard with query
	if  (query != "") || (folderIds == models.RootFolderId && layout == FoldersLayout) {
		res := make(SearchHitList, 0)
		if layout == FoldersLayout {
			// folders and dashboard
			fs := folders.QueryAll()
			for _, f := range fs {
				if (query != "") {
					if !strings.Contains(strings.ToLower(f.Title), query) {
						continue
					}
				}

				f.Type = TypeFolder
				f.Tags = make([]string, 0)

				res = append(res, &SearchHit{
					Id:    int64(f.Id),
					Uid:   f.Uid,
					Title: f.Title,
					Url:   f.Url,
					Tags:  f.Tags,
					Type:  f.Type,
				})
			}
		}
		for _, dash := range cache.Dashboards {
			if (c.Query("folderIds") != "") {
				if (dash.FolderId != folderIds) {
					continue
				}
			}

			if (query != "") {
				if !strings.Contains(strings.ToLower(dash.Title), query) {
					continue
				}
			}

			dtags := dash.Data.Get("tags").MustStringArray()
			if !filterTags(dtags,tags) {
				continue
			}

			f := folders.QueryById(dash.FolderId)
			if f == nil {
				c.JSON(400, common.ResponseI18nError(i18n.FolderNotExist))
				return
			}

			dash.UpdateSlug()
			r := &SearchHit{
				Id:          dash.Id,
				Uid:         dash.Uid,
				Title:       dash.Title,
				Url:         dash.GenerateUrl(),
				Slug:        dash.Slug,
				Type:        TypeDashboard,
				Tags:        dtags,
				IsStarred:   false,
				FolderId:    f.Id,
				FolderTitle: f.Title,
				FolderUid:   f.Uid,
				FolderUrl:   f.Url,
			}

			res = append(res, r)
		}
		
		sort.Sort(res)
		
		c.JSON(200, common.ResponseSuccess(res))
		return

	}

	if folderIds == models.RootFolderId && layout == FoldersLayout {
		// get folders and the dashboard of general folder
		fs := folders.QueryAll()
		for _, f := range fs {
			f.Type = TypeFolder
			f.Tags = make([]string, 0)
		}
		c.JSON(200, common.ResponseSuccess(fs))
		return
	}

	if layout == ListLayout && tp == TypeDashboard {
		// get all dashboards
		res := make(SearchHitList, 0)
		for _, dash := range cache.Dashboards {
			if c.Query("folderIds") != "" {
				if dash.FolderId != folderIds {
					continue
				}
			}
			if query != "" {
				if !strings.Contains(strings.ToLower(dash.Title), query) {
					continue
				}
			}

			dtags := dash.Data.Get("tags").MustStringArray()
			if !filterTags(dtags,tags) {
				continue
			}
			f := folders.QueryById(dash.FolderId)
			if f == nil {
				c.JSON(400, common.ResponseI18nError(i18n.FolderNotExist))
				return
			}

			dash.UpdateSlug()
			r := &SearchHit{
				Id:          dash.Id,
				Uid:         dash.Uid,
				Title:       dash.Title,
				Url:         dash.GenerateUrl(),
				Slug:        dash.Slug,
				Type:        TypeDashboard,
				Tags:        dtags,
				IsStarred:   false,
				FolderId:    f.Id,
				FolderTitle: f.Title,
				FolderUid:   f.Uid,
				FolderUrl:   f.Url,
			}

			res = append(res, r)
		}

		sort.Sort(res)
		
		c.JSON(200, common.ResponseSuccess(res))
		return
	}

	if folderIds >= 0 && layout == NullLayout {
		// get all dashboards in the folder
		dashes := dashboard.QueryByFolderId(folderIds)
		f := folders.QueryById(folderIds)
		if f == nil {
			c.JSON(400, common.ResponseI18nError(i18n.FolderNotExist))
			return
		}

		res := make(SearchHitList, 0)
		for _, dash := range dashes {
			if query != "" {
				if !strings.Contains(strings.ToLower(dash.Title), query) {
					continue
				}
			}
			dtags := dash.Data.Get("tags").MustStringArray()
			if !filterTags(dtags,tags) {
				continue
			}
			dash.UpdateSlug()
			r := &SearchHit{
				Id:          dash.Id,
				Uid:         dash.Uid,
				Title:       dash.Title,
				Url:         dash.GenerateUrl(),
				Slug:        dash.Slug,
				Type:        TypeDashboard,
				Tags:        dtags,
				IsStarred:   false,
				FolderId:    f.Id,
				FolderUid:   f.Uid,
				FolderTitle: f.Title,
				FolderUrl:   f.Url,
			}
			res = append(res, r)
		}

		sort.Sort(res)

		c.JSON(200, common.ResponseSuccess(res))
		return
	}
	c.JSON(400, common.ResponseI18nError("error.unsupportSearch"))
}

func Dashboard(c *gin.Context) {
	tp := c.Query("type")
	fuzzy, _ := strconv.ParseBool(c.Query("fuzzy"))

	query := c.Query("query")
	if query == "" {
		c.JSON(400, common.ResponseI18nError(i18n.BadRequestData))
		return
	}
	switch tp {
	case Search_Dash_By_Title:
		if !fuzzy {
			dashboard := &models.Dashboard{}
			d, ok := cache.Dashboards[query]
			if ok {
				dashboard = d
			}

			c.JSON(200, common.ResponseSuccess(dashboard))
		}
	default:
		c.JSON(400, common.ResponseI18nError("error.unsupportSearch"))
	}
}


func filterTags(dtags []string,tags []string) bool {
	// filter by tags
	if len(tags) > 0 {
		for _,tag := range tags {
			exist := false
			for _,dtag := range dtags {
				if tag == dtag {
					exist = true
				}
			}
			if (!exist) {
				return false
			}
		}
		return true
	}

	return true
}
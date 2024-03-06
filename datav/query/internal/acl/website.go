package acl

import (
	"errors"

	"github.com/xobserve/xo/query/pkg/e"
	"github.com/xobserve/xo/query/pkg/models"
)

func CanViewWebsite(u *models.User) error {
	if !u.Role.IsAdmin() {
		return errors.New(e.NeedWebsiteAdmin)
	}

	return nil
}

func CanEditWebsite(u *models.User) error {
	if !u.Role.IsAdmin() {
		return errors.New(e.NeedWebsiteAdmin)
	}

	return nil
}

func CanEditWebsiteAdmin(u *models.User) error {
	if !u.Role.IsSuperAdmin() {
		return errors.New(e.NeedWebsiteSuperAdmin)
	}

	return nil
}

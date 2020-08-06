package models

type RoleType string

const (
	ROLE_VIEWER  = "Viewer"
	ROLE_EDITOR  = "Editor"
	ROLE_ADMIN   = "Admin"
)

func (r RoleType) IsValid() bool {
	return r == ROLE_VIEWER || r == ROLE_EDITOR || r == ROLE_ADMIN 
}

func (r RoleType) IsAdmin() bool {
	return r == ROLE_ADMIN 
}

func (r RoleType) IsEditor() bool {
	return r == ROLE_ADMIN || r == ROLE_EDITOR
}

func IsAdmin(r RoleType) bool {
	return r == ROLE_ADMIN
}

func RoleSortWeight(role RoleType) int {
	switch role {
	case ROLE_VIEWER :
		return 0
	case ROLE_EDITOR: 
		return 1
	case ROLE_ADMIN:
		return 2
	default:
		return 0
	}
}
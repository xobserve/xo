import { i18n } from 'src/i18n/i18n'
import { params } from '@nanostores/i18n'

export const notFoundMsg = i18n("notfound", {
  "title": "404: Not found",
  "description": "Page not found",
  "heading": "404 | Page Not Found",
  "message": "You just hit a route that doesn't exist... the sadness.😢",
  "back-to-home": "Back to Home"
})

export const commonMsg = i18n("common", {
  "title": "Title",
  "name": "Name",
  "description": "Description",
  "basic": "Basic",
  "variable": "Variable",
  "settings": "Settings",
  "new": "New",
  "login": "Log in",
  "logout": "Log out",
  "nickname": "Nickname",
  "email": "Email",
  "submit": "Submit",
  "deleteAlert": "Are you sure? You can't undo this action afterwards.",
  "cancel": "Cancel",
  "delete": "Delete",
  "edit": "Edit",
  "default": "Default",
  "configuration": "Configuration",
  "datasource": "Datasource",
  "type": "Type",
  "test": "Test",
  "save": "Save",
  "manage": "Manage",
  "team": "Team",
  "user": "User",
  "userName": "Username",
  "action": "Action",
  "optional": "optional",
  "query": "Query",
  "basicSetting": "Basic Setting",
  "showMore": "Show More",
  "custom": "Custom",
  "createdBy": "Created By",
  "Viewer": "Viewer",
  "Admin": "Admin",
  "SuperAdmin": "Super Admin",
  "password": "Password",
  "dangeSection": "Dangerous section",
  "dashboard": "Dashboard",
  "panel": "Panel",
  "members": "Member",
  "sidemenu": "Side Menu",
  "created": "Created",
  "updated": "Updated",
  "role": "Role",
  "joined": "Joined",
  "inputTips": params("Enter {name}.."),
  "isReqiiured": params("{name} is required"),
  "isInvalid": params("{name} is invalid"),
  "isAdded": params("{name} added!"),
  "isUpdated": params("{name} updated!"),
  "isDeleted": params("{name} deleted!"),
  "newItem": params("New {name}"),
  "manageItem": params("Manage {name}"),
  "deleteItem": params("Delete {name}"),
  "editItem": params("Edit {name}"),
  "itemName": params("{name} Name"),
})


export const accountSettingMsg = i18n("accountSetting", {
  "changePassword": "Change Password",
  "oldPassword": "Old Password",
  "newPassword": "New Password",
  "confirmPassword": "Confirm Password",
  "navTitle": "Account setting",
  "subTitle": "Settings for current user"
})

export const cfgDatasourceMsg = i18n("cfgDatasource", {
  "deleteToast": params(`Datasource {name} has been deleted.`),
})


export const cfgVariablemsg = i18n("cfgVariable", {
  "subTitle": "Manage global variables",
  "queryType": "Query Type",
  "refresh": "Refresh",
  "regexFilter": "Regex Filter",
  "valueUpdated": params(`Values of {name} has been updated`),
  "reload": "Reload values",
  "multiValue": "Multi Value",
  "allValue": "All Value",
  "queryValue": "Query values",
  "varValues": "Variable Values",
  "selectDs": "Select Datasource",
  "OnDashboardLoad": "On dashboard load",
  "OnTimeRangeChange": "On timerange change",
  "Manually": "Manually",
  "nameTips": "Only alphabet and digit numbers are allowed",
  "descTips": "give this variable a simple description",
  "valueTips": "Values separated by comma,e.g 1,10,20,a,b,c",
  "fitlerTips": "further filter the query result through a Regex pattern",
  "useCurrentTime": "Use current time",
  "selectMetrics": "Select metrics",
  "metricTips": "support using variables"
})

export const cfgUsers = i18n("cfgUsers", {
  "pwAlert": "new password must be at least 6 characters long",
  "userRole": "User Role",
  "globalRole": "Global Role",
  "changePw": "Change Password",
  "userNameInput": "enter a username, used in login",
})


export const cfgTeamDash = i18n("cfgTeamDash", {
  "title": "Manage Your Team",
  "subTitle": "Current team",
  "roleInTeam": "Role in team",
})
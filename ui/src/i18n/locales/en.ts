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

export const navigateMsg = i18n("navigate", {
  "NewDashboard": "New Dashboard",
  "NewDatasource": "New Datasource",
  "ImportDashboard": "Import Dashboard",
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


export const cfgTeam = i18n("cfgTeam", {
  "title": "Manage Your Team",
  "subTitle": "Current team",
  "roleInTeam": "Role in team",
  "leaveTeam": "Leave Team",

  "sidemenuTip1": "Customize the top section of your team's side menu, you can add, edit, delete and reorder the menu items.",
  "sidemenuTip2": "Menu item format",
  "sidemenuTip3": "Url format",
  "level": "Level", 
  "sidemenuTip4": "if level 1 is /x, level 2 must be /x/a or /x/b, obviously /y/a is invalid",
  "sidemenuTip5": "You can find icons in",
  "modifySidemenu": "Modify Side Menu",
  "addMenuItem": "Add Menu Item",
  "removeMenuItem": "Remove Menu Item",
  "sidemenuErrTitle": "title is required",
  "sidemenuErrDashId":  "dashboard id is required",
  "sidemenuErrLevel1Icon": "Menu item of level 1 must have an icon",
  "sidemenuErrIcon": params("icon {name} is not exist"),
  "sidemenuErrUrl": params("{name} is not a valid url"),
  "sidemenuErrLevel1Url": "level 1 url must be /x, /x/y is invalid",
   "sidemenuErrLevel2Url":"level 2 url must use level1 url as prefix",
   'sidemenuErrLevel2Url1': "level 2 url must be /x/y, /x or /x/y/z is invalid",
   "sidemenuErrChildTitle": "child title or dashboard id is required",
   "sidemenuErrChildUrl": params("{name} is not a valid url"),
   "sidemenuReload": "Side menu updated, reloading..."
})


export const newMsg = i18n("new", {
  "subTitle": "Create some useful items",
  "dashInfo": "Dashboard info",
  "dashTitle": "Dashboard Title",
  "belongTeam": "Belong to team",
  "dashToast": "Dashboard added, redirecting...",
  "importToast": "Dashboard imported, redirecting...",
  "jsonInvalid": "Meta json is not valid"
})
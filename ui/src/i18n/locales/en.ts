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
  "auto": "Auto",
  "general": "General",
  "styles": "Styles",
  "tags": "Tags",
  "copy": "Copy",
  "remove": "Remove",
  "inputTips": params("Enter {name}.."),
  "isReqiiured": params("{name} is required"),
  "isInvalid": params("{name} is invalid"),
  "isAdded": params("{name} added!"),
  "isUpdated": params("{name} updated!"),
  "isDeleted": params("{name} deleted!"),
  "isExist": params("{name} already exists"),
  "newItem": params("New {name}"),
  "manageItem": params("Manage {name}"),
  "deleteItem": params("Delete {name}"),
  "editItem": params("Edit {name}"),
  "itemName": params("{name} Name"),
})

export const miscMsg = i18n("misc", {
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
  "dsInfo": "Datasource info",
  "dashTitle": "Dashboard Title",
  "belongTeam": "Belong to team",
  "dashToast": "Dashboard added, redirecting...",
  "importToast": "Dashboard imported, redirecting...",
  "jsonInvalid": "Meta json is not valid",
  "dsToast": "Datasource added, redirecting...",
  "testDsFailed":  "Test failed",
})



export const dashboardMsg = i18n("dashboard", {
  "notFound": "Dashboard not found, maybe 1. invalid dashboard id(url) 2. you have chosen a wrong team",
  "headerTeamTips": "the team which current dashboard belongs to",
  "refreshOnce": "refresh just once",
  "refreshInterval": "refresh with interval",
  "fullscreenTips": "enter fullscreen mode",
  "exitFullscreenTips": "Press ESC to exit fullscreen mode",
  "addPanel": "Add new panel",
  "pastePanel": "Paste panel from clipboard"
})

export const dashboardSaveMsg = i18n("dashboardSave", {
  "autoSaveNotAvail": "Auto save is not available in edit panel mode.",
  "autoSaveNotAvail1": "Auto save is not available in history preview mode",
  "saveMsgRequired": "A save message must be provided when saving in history preview mode",
  "savedMsg": params("Dashboard {name} saved"),
   "saveDueToChanges": "Current dashboard has changes, please save it before viewing history.",
   "onPreviewMsg1": "Changed to history preview mode",
  "onPreviewMsg2": "Changed to current dashboard",
  "onPreviewMsg3": "If you want to use preview version, please save it by click save button.",
  "viewHistory": "View History",
  "saveHistoryHeader": "Dashboard revision history",
  "saveDash": "Save Dashboard",
  "dangerous": "Dangerous",
  "saveOverrideTips": "You are previewing a history now, do you want to override current dashboard?",
  "describeSaveChanges": "describe changes",
  "saveMsgTips": "a message shows what has been changed",
  "viewChanges": "View Changes",
  "showDiffLine": "Only diff lines will be show, others will be folded",
  "useCurrentDash": "click here to continue use current dashboard, and stop previewing",
  "current": "Currrent",
  "preview": "Preview"
})

export const dashboardSettingMsg = i18n("dashboardSetting", {
  "metaData": "Meta data",
  "tootip": "Shared tooltip",
  "tootipTips": "Show tooltips at the same timeline position across all panels",
  "hideVars": "Hide global variables",
  "hideVarsTips": "enter global variables names, separated with ',' . e.g: app,env",
  "tagTips": "Tag a dashboard and group it into a same collection for searching",
  "tagInputTips": "new tag(press enter to add)",
  "tagsExceedLimit": "You can only add up to 5 tags.",
  "panelLayout": "Panels layout",
  "panelLayoutTips": "Auto place panels in horizontal or vertical direction, when set to random, you can place panels anywhere",
  "panelOverlap": "Allow panels overlap",
  "panelOverlapTips": "Allow panels to be placed overlap each other",
  "saveDash": "Save dashboard",
  "savePromt": "Enable unsave promt",
  "savePromtTips": "When you have unsaved changes, a promt will be shown when you try to leave the page",
  "autoSave": "Enable auto save",
  "autoSaveTips": "Dashboard will be auto saved at intervals, you can find old versions in save history list",
  "autoSaveInterval": "Auto save interval(seconds)",

  "background": "Background",
  "backgroundTips": "Set dashboard background color or image",
  "enableBg": "Enable background",
  "enableBgTips": "Whether using the background image set above",
  "dashBorder":  "Dashboard border",
  "dashBorderTips": "Select a cool border for your dashboard",

  "dashSaved": "Dashboard saved",
  "saveChanges": "modify dashboard meta data",
  "saveWarnTitle": "Press Ctrl + S to Save your dashboard first!",
  "saveWarnContent": "Before submitting the meta data above, please save your Dashboard first, if it has any changes",
  "saveAlertTitle": "Submit dashboard meta data",
  "saveAlertContent": " Are you sure to submit? If submit success, page will be reloaded."
})

export const timePickerMsg = i18n("timePicker", {
  "fromInvalid": "format of from is invalid'",
  "toInvalid": "format of to is invalid",
  "selectTime": "Select a date range",
  "customTime": "Custom time range",
  "from": "From",
  "to": "To",
  "apply": "Apply time range",
  "quickSelect": "Quick select",
  "lastMinutes": params("Last {name} minutes"),
  "lastHours": params("Last {name} hours"),
  "lastDays": params("Last {name} days"),
})


export const variableMsg = i18n("variable", {
  "dashScoped": "dashboard scoped variable",
  "globalScoped": "global scoped variable",
})

export const panelMsg = i18n("panel", {
  "debugPanel": "Debug Panel",
  "discard": "Discard",
  "apply": "Apply",
  "editPanel": "Edit Panel",
  "overrides": "Overrides",
  "queryOption": "Query Option",
  "maxDataPoints": "Max data points",
  "maxDataPointsTips": "The maximum data points per series. Used directly by some data sources and used in calculation of auto interval.",
  "minInterval": "Min interval",
  "minIntervalTips": "A lower limit for the interval. Recommended to be set to write frequency, e.g Prometheus defaults scraping data every 15 seconds, you can set this to '15s'",
  "finalInterval": "Final interval",
  "finalIntervalTips": "Final interval is caculated based on the current time range, max data points and the min interval, it's sent to datasource, e.g final interval will be directly passed as the step option that Prometheus requires",

  "panelTitle": "Panel Title",
  "panelDesc": "give a short description to this panel",
  "visuization": "Visuization",

  "panelBorder": "Panel border",
  "titleDecoration": "Title decoration",
  "panelDecoration": "Panel decoration",
  "reverseTips": "only a few decorations support reverse mode",
  "titleStyles": "Title styles",
  
  "targetName": "Target name",
  "addRule": "Add override rule",
  "addOverride": "Add override",
})


export const prometheusDsMsg = i18n("prometheusDs", {
  "enterPromQL": "Enter a PromQL query",
  "legendFormat": "support variable",
  "selecMetrics": "Select metrics...",
})
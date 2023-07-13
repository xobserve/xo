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
  "action": "Action",
  "optional": "optional",
  "query": "Query",
  "basicSetting": "Basic Setting",
  "showMore": "Show More",
  "custom": "Custom",
  "isReqiiured": params("{name} is required"),
  "isInvalid": params("{name} is invalid"),
  "isAdded": params("{name} added!"),
  "isUpdated": params("{name} updated!"),
  "isDeleted": params("{name} deleted!"),  
})


export const accountSettingMsg = i18n("accountSetting", {
  "basic": "Basic Information",
  "changePassword": "Change Password",
  "oldPassword": "Old Password",
  "newPassword": "New Password",
  "confirmPassword": "Confirm Password",
  "navTitle": "Account setting",
  "subTitle": "Settings for current user"
})

export const cfgDatasourceMsg = i18n("cfgDatasource", {
  "editDs": "Edit Datasource",
  "deleteDs": "Delete Datasource",
  "manageDs": "Manage Datasource",
  "newDs": "New Datasource",
  "deleteToast": params(`Datasource {name} has been deleted.`),
})


export const cfgVariablemsg = i18n("cfgVariable", {
  "subTitle": "Manage global variables",
  "varName": "Variable  Name",
  "queryType": "Query Type",
  "refresh": "Refresh",
  "regexFilter": "Regex Filter",
  "newVar": "New Variable",
  "deleteVar": "Delete Variable",
  "valueUpdated": params(`Values of {name} has been updated`),
  "reload": "Reload values",
  "editVar": "Edit Variable",
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
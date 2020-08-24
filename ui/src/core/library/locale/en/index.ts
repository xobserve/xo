/*eslint-disable*/
import _ from 'lodash'

const en = {}

import common from './common'
_.forEach(common, (v,k) => {
    en['common.' + k] = v
})

import team from './team'
_.forEach(team, (v,k) => {
    en['team.' + k] = v
})

import dashboard from './dashboard'
_.forEach(dashboard, (v,k) => {
    en['dashboard.' + k] = v
})

import datasource from './datasource'
_.forEach(datasource, (v,k) => {
    en['datasource.' + k] = v
})

import folder from './folder'
_.forEach(folder, (v,k) => {
    en['folder.' + k] = v
})

import user from './user'
_.forEach(user, (v,k) => {
    en['user.' + k] = v
})

import error from './error'
_.forEach(error, (v,k) => {
    en['error.' + k] = v
})

import info from './info'
_.forEach(info, (v,k) => {
    en['info.' + k] = v
})

import panel from './panel'
_.forEach(panel, (v,k) => {
    en['panel.' + k] = v
})

import keybinding from './keybinding'
_.forEach(keybinding, (v,k) => {
    en['keybinding.' + k] = v
})

import alerting from './alerting'
_.forEach(alerting, (v,k) => {
    en['alerting.' + k] = v
})


export default en

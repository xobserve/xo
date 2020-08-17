/*eslint-disable*/
import _ from 'lodash'

const zh = {}

import common from './common'
_.forEach(common, (v,k) => {
    zh['common.' + k] = v
})

import team from './team'
_.forEach(team, (v,k) => {
    zh['team.' + k] = v
})

import dashboard from './dashboard'
_.forEach(dashboard, (v,k) => {
    zh['dashboard.' + k] = v
})

import datasource from './datasource'
_.forEach(datasource, (v,k) => {
    zh['datasource.' + k] = v
})

import folder from './folder'
_.forEach(folder, (v,k) => {
    zh['folder.' + k] = v
})

import user from './user'
_.forEach(user, (v,k) => {
    zh['user.' + k] = v
})

import error from './error'
_.forEach(error, (v,k) => {
    zh['error.' + k] = v
})


import info from './info'
_.forEach(info, (v,k) => {
    zh['info.' + k] = v
})

import panel from './panel'
_.forEach(panel, (v,k) => {
    zh['panel.' + k] = v
})

import keybinding from './keybinding'
_.forEach(keybinding, (v,k) => {
    zh['keybinding.' + k] = v
})


export default zh

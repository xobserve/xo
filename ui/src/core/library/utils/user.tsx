import {removeToken } from './auth';
import localStore from './localStore'

export function logout() {
    localStore.set("lastPath", window.location.pathname+window.location.search)
    removeToken()
    window.location.href = "/login"
}

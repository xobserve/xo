import { atom } from 'nanostores'
import { Dashboard, Panel } from 'types/dashboard';

export const $dashboard = atom<Dashboard>(null)

export const $copiedPanel = atom<Panel>(null)
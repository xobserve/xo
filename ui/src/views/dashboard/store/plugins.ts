import { atom } from 'nanostores'
import { PanelPlugin } from 'types/plugins/plugin'

// external plugins
export const $panelPlugins = atom<PanelPlugin[]>([])

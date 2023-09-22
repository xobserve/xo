
import { PanelPluginComponents } from "types/plugins/plugin"

import DemoComponents from "./panel/demo"
import Demo1Components from "./panel/demo1"
export const externalpanelPlugins: Record<string,PanelPluginComponents> = {
	"demo": DemoComponents,
	"demo1": Demo1Components,
}
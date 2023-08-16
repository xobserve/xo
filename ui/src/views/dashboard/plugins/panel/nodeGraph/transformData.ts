// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import G6 from "@antv/g6";
import { NodeGraphSettings } from "types/panel/plugins";
import { NodeGraphPluginData } from "types/plugins/nodeGraph";
import { colors, paletteColorNameToHex } from "utils/colors";
import { getDefaultEdgeStyle } from "./default-styles";

export const setAttrsForData = (settings: NodeGraphSettings, data: NodeGraphPluginData, colorMode) => {
    const donutColors = {}
    settings.node.donutColors.forEach(item => { donutColors[item.attr] = item.color })

    // 计算 node size
    // 找出最小的那个作为基准 size
    let base;
    data.nodes?.forEach((node: any, i) => {
        const attrs = {}
        let nodeShape = settings.node.shape
        Object.keys(donutColors).map(k => {
            donutColors[k] = paletteColorNameToHex(donutColors[k])
            const d = node.data[k]
            if (d != undefined) {
                attrs[k] = d
            } else {
                attrs[k] = null
            }
        })

        node.donutAttrs = attrs
        if (node.icon?.show) {
            for (const k of Object.keys(node.data)) {
                for (const j of settings.node.icon) {
                    if (j.key == k && j.value == node.data[k]) {
                        node.icon = {
                            show: true,
                            img: j.icon,
                        }
                    }
                }
            }
        }


        node.type = nodeShape
        node.donutColorMap = donutColors

        let t = 0;
        Object.keys(node.donutAttrs).forEach(key => {
            t += node.donutAttrs[key] ?? 0;
        })
        if (i == 0) {
            base = t
        } else {
            if (t < base) {
                base = t
            }
        }
    })

    // 根据与基准的比例，来计算大小
    data.nodes?.forEach((node: any) => {
        let t = 0;
        Object.keys(node.donutAttrs).forEach(key => {
            t += node.donutAttrs[key] ?? 0;
        })

        const p = Math.log2(t / base)
        if (p <= 1) {
            node.size = settings.node.baseSize
        } else if (p >= settings.node.maxSize) {
            node.size = settings.node.baseSize * settings.node.maxSize

        } else {
            node.size = p * settings.node.baseSize
        }

        if (node.icon) {
            node.icon.width = node.size / 2.5
            node.icon.height = node.size / 2.5
        }

        if (t == 0) {
            // if data is 0, we must and a border to node, otherwise , the node will not show
            // because custom node will show nothing when data is 0
            node.style = {
                lineWidth: 1,
                fill: 'transparent',
                stroke: colors[0]
            }
        }
    })

    data.edges?.forEach(edge => {
        edge.type = settings.edge.shape
        if (edge.style) {
            edge.style.endArrow = settings.edge.arrow == "default" ? true : {
                path: G6.Arrow[settings.edge.arrow](),
                fill: colorMode == "light" ? paletteColorNameToHex(settings.edge.color.light, colorMode) : paletteColorNameToHex(settings.edge.color.dark, colorMode),
            }

            edge.style.stroke = colorMode == "light" ? paletteColorNameToHex(settings.edge.color.light, colorMode) : paletteColorNameToHex(settings.edge.color.dark, colorMode)
            edge.style.opacity = settings.edge.opacity
        }

        if (!edge.stateStyles) edge.stateStyles = {}
        const defaultEdgeStyle = getDefaultEdgeStyle(settings, colorMode)
        Object.keys(defaultEdgeStyle).forEach(key => {
            edge.stateStyles[key] = defaultEdgeStyle[key]
        })
    })
}
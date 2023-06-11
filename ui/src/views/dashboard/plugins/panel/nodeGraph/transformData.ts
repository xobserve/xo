import { cloneDeep } from "lodash";
import { NodeGraphSettings, Panel } from "types/dashboard";
import { NodeGraphData } from "types/dataFrame";

export const setAttrsForData = (settings: NodeGraphSettings, data: NodeGraphData) => {
    const donutColors = JSON.parse(settings.node.donutColors)
    // 计算 node size
    // 找出最小的那个作为基准 size
    let base;
    data.nodes.forEach((node: any, i) => {
        const attrs = {}
        Object.keys(donutColors).map(k => {
            const d = node.data[k]
            if (d) {
                attrs[k] = d
            }  
        })
        
        node.donutAttrs = attrs
        if (!node.icon?.show) {
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

        node.type = settings.node.shape
        node.donutColorMap = donutColors
        
        let t = 0;
        Object.keys(node.donutAttrs).forEach(key => {
            t += node.donutAttrs[key];
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
    data.nodes.forEach((node: any) => {
        let t = 0;
        Object.keys(node.donutAttrs).forEach(key => {
            t += node.donutAttrs[key];
        })

        const p = Math.log2(t / base)
        if (p <= 1) {
            node.size = settings.node.baseSize
        } else if (p >= 2) {
            node.size = settings.node.baseSize * 2
         
        } else {
            node.size = p * settings.node.baseSize
        }

        if (node.icon) {
            node.icon.width = node.size / 2
            node.icon.height = node.size / 2
        }
        console.log("here33333a:",node)
    })
}
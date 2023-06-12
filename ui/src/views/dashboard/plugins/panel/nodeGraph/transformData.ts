import { NodeGraphData } from "types/dataFrame";

export const setAttrsForData = (data: NodeGraphData) => {
    data.nodes.forEach((node: any) => {
        node.donutAttrs = node.data
    })


    // 计算 node size
    // 找出最小的那个作为基准 size
    let base;
    data.nodes.forEach((node: any, i) => {
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
            node.size = 40
            node.icon.width = 18
            node.icon.height = 18
        } else if (p >= 1.5) {
            node.size = 60
            node.icon.width = 26
            node.icon.height = 26
        } else {
            node.size = p * 40
            node.icon.width = p * 15
            node.icon.height = p * 15
        }
    })
}
import G6 from "@antv/g6";
import { NodeGraphSettings } from "types/dashboard";

export const initTooltip = (settings: NodeGraphSettings) => {
    const tooltip = new G6.Tooltip({
        offsetX: 10,
        offsetY: 10,
        itemTypes: ['node'],
        trigger: settings.node.tooltipTrigger ?? 'mouseenter',
        getContent: (e) => {
            const model = e.item.getModel();
            const outDiv = document.createElement('div');
            outDiv.style.width = 'fit-content';
            outDiv.style.padding = '0px 4px 0px 10px';
            outDiv.style.fontSize = '12px';
            let li = ''
            Object.keys(model.data).map(key=> {
                li  += `<li>${key}: ${model.data[key]}</li>`
            })
            outDiv.innerHTML = `
                <strong><h3>${model.label}</h3></strong>
                <ul>
                ${
                  li
                }
                </ul>`;
            return outDiv;
        }
    });

    return tooltip
}
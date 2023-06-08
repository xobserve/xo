import G6 from "@antv/g6";

export const initTooltip = () => {
    const tooltip = new G6.Tooltip({
        offsetX: 10,
        offsetY: 10,
        itemTypes: ['node'],
        getContent: (e) => {
            const outDiv = document.createElement('div');
            outDiv.style.width = 'fit-content';
            outDiv.style.padding = '0px 0px 20px 10px';
            outDiv.innerHTML = `
                <h4>Custom Content</h4>
                <ul>
                <li>Type: ${e.item.getType()}</li>
                </ul>
                <ul>
                <li>Label: ${e.item.getModel().label || e.item.getModel().id}</li>
                </ul>`;
            return outDiv;
        },
    });

    return tooltip
}
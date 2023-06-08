import G6 from "@antv/g6";

export const initContextMenu = () => {
    const contextMenu = new G6.Menu({
        getContent(evt) {
          let header;
          if (evt.target && evt.target.isCanvas && evt.target.isCanvas()) {
            header = 'Canvas ContextMenu';
          } else if (evt.item) {
            const itemType = evt.item.getType();
            header = `${itemType.toUpperCase()} ContextMenu`;
          }
          return `
          <h3>${header}</h3>
          <ul>
            <li title='1'>li 1</li>
            <li title='2'>li 2</li>
            <li>li 3</li>
            <li>li 4</li>
            <li>li 5</li>
          </ul>`;
        },
        handleMenuClick: (target, item) => {
          console.log(target, item);
        },
        // offsetX and offsetY include the padding of the parent container
        // 需要加上父级容器的 padding-left 16 与自身偏移量 10
        offsetX: 16 + 10,
        // 需要加上父级容器的 padding-top 24 、画布兄弟元素高度、与自身偏移量 10
        offsetY: 0,
        // the types of items that allow the menu show up
        // 在哪些类型的元素上响应
        itemTypes: ['node', 'edge', 'canvas'],
      });

      return contextMenu
}
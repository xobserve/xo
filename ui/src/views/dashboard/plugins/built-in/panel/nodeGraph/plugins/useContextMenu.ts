// Copyright 2023 observex.io Team
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
import { useToast } from "@chakra-ui/react";
import { isFunction } from "lodash";
import { useNavigate } from "react-router-dom";
import { NodeGraphSettings } from "../types";
import { commonInteractionEvent, genDynamicFunction } from "utils/dashboard/dynamicCall";

const useContextMenu = (settings: NodeGraphSettings) => {
  const toast = useToast()
  const navigate = useNavigate()
  const contextMenu = new G6.Menu({
    getContent(evt) {
      let header;
      if (evt.target && evt.target.isCanvas && evt.target.isCanvas()) {
        header = 'Canvas ContextMenu';
        return `
                <div id="node-graph-canvas-context">
          <h3>${header}</h3>
          <ul>
          
            <li title='1'>Hide selected nodes and edges</li>
            <li title='2'>li 2</li>
            <li>li 3</li>
            <li>li 4</li>
            <li>li 5</li>
          </ul>
          </div>`;
      } else if (evt.item) {
        const model = evt.item.getModel();
        const outDiv = document.createElement('div');
        outDiv.style.width = 'fit-content';
        outDiv.style.padding = '0px 4px 0px 10px';
        outDiv.style.fontSize = '14px';
        let li = ''
        settings.node.menu.forEach(item => {
          if (item.enable) {
            li += `<li id=${item.id} style="cursor:pointer;">${item.name}</li>`
          }
        })
        outDiv.innerHTML = `
                <strong><h3>${model.label} menu</h3></strong>
                <ul>
                ${li
          }
                </ul>`;


        return outDiv;
      }

    },
    handleMenuClick: (target, item) => {
      let menuItem = settings.node.menu.find(item => item.id.toString() === target.id)
      const clickFunc = genDynamicFunction(menuItem.event); 
      if (isFunction(clickFunc)) {
        commonInteractionEvent(clickFunc, item.getModel())
      } else {
        toast({
          title: "Click node menu error",
          description: "The click function you defined is not valid",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      } 
    },
    // offsetX and offsetY include the padding of the parent container
    // 需要加上父级容器的 padding-left 16 与自身偏移量 10
    offsetX: 16 + 10,
    // 需要加上父级容器的 padding-top 24 、画布兄弟元素高度、与自身偏移量 10
    offsetY: 0,
    // the types of items that allow the menu show up
    // 在哪些类型的元素上响应
    itemTypes: [
      'node',
    //  'canvas'
    ],
  });

  return contextMenu
}

export default useContextMenu
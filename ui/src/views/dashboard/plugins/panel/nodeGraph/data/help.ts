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
import { Help } from "types/misc";

export const nodeGraphHelp:Help[] = [
    {
        title: 'Target selection',
        headers: ['Action', 'Effect'],
        contents: [
            ['Click on a node', 'Select the node'],
            ['Double click on a node', 'Select the node and it\'s relational edges'],
            ['Press and hold down Shift, then click on some nodes', 'Select several nodes'],
            ['Press and hold down Shift, then press your mouse to swipe selecting a area', 'Select all nodes and edges in a area']
        ]
    }
]



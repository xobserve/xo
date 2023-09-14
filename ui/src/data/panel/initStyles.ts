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

import { PanelBorderType, PanelDecorationType, PanelStyles, PanelTitleDecorationType } from "types/panel/styles";

export const initPanelStyles: PanelStyles = {
    palette: 'echarts-light',
    border: PanelBorderType.None,
    borderOnHover: true,
    title: {
        decoration: {
            type: PanelTitleDecorationType.None,
            width: '160px',
            height: '50px',
            margin: '10px'
        },
        fontSize: '14px',
        fontWeight: '500',
        color: 'inherit',
        paddingTop: '0px',
        paddingBottom: "0px",
        paddingLeft: "0px",
        paddingRight: "0px",
    },
    decoration: {
        type: PanelDecorationType.None,
        width: '100%',
        height: "20px",
        top: '-30px',
        left: '',
        justifyContent: "center",
        reverse: false
    },

    heightReduction: 0 ,
    widthReduction: 0 ,
    marginTop: 0,
    marginLeft: 0
}
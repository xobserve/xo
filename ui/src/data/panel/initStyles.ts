import { PanelStyles, PanelTitleDecorationType } from "types/panel";

export const initPanelStyles:PanelStyles = { 
    border: 'normal',
    title:{
        decoration: {
            type: PanelTitleDecorationType.None,
            width: '150px',
            height: '50px',
            margin: '20px'
        }
    }
}
import { PanelStyles, PanelTitleDecorationType } from "types/panel";

export const initPanelStyles: PanelStyles = {
    border: 'normal',
    title: {
        decoration: {
            type: PanelTitleDecorationType.None,
            width: '160px',
            height: '50px',
            margin: '10px'
        },
        fontSize: '1rem',
        fontWeight: '500',
        color: 'inherit',
        paddingTop: '0px',
        paddingBottom: "0px",
        paddingLeft: "0px",
        paddingRight: "0px",
    }
}
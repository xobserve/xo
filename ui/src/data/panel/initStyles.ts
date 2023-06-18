import { PanelBorderType, PanelDecorationType, PanelStyles, PanelTitleDecorationType } from "types/panel/styles";

export const initPanelStyles: PanelStyles = {
    border: PanelBorderType.Normal,
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
    },
    decoration: {
        type: PanelDecorationType.None,
        width: '100%',
        height: "20px",
        top: '-30px',
        left: '',
        justifyContent: "center",
        reverse: false
    }
}
import React from "react"
import { PanelStyles, PanelTitleDecorationType } from "types/panel/styles"
import Decoration11 from "../decoration/Decoration11";
import Decoration7 from "../decoration/Decoration7";

interface Props {
    styles: PanelStyles
    children?: any
}

const TitleDecoration = ({ styles, children }: Props) => {
    const style = { width: styles.title.decoration.width, height: styles.title.decoration.height }
    switch (styles.title.decoration.type) {            
        case PanelTitleDecorationType.Decoration7:
            return <Decoration7 style={style} margin={styles.title.decoration.margin}>{children}</Decoration7>
        case PanelTitleDecorationType.Decoration11:
            return <Decoration11 style={style} margin={styles.title.decoration.margin}>{children}</Decoration11>
        default:
            return <>{children}</>
    }
}

export default TitleDecoration
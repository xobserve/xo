{/* <Box display="flex" justifyContent="right"><Decoration6 style={{height: '20px',width:"10%",position:"absolute",top:"",left:""}} /></Box> */}


import { Box } from "@chakra-ui/react"
import { PanelDecorationType, PanelStyles } from "types/panel/styles"
import Decoration1 from "../decoration/Decoration1"
import Decoration10 from "../decoration/Decoration10"
import Decoration12 from "../decoration/Decoration12"
import Decoration2 from "../decoration/Decoration2"
import Decoration3 from "../decoration/Decoration3"
import Decoration4 from "../decoration/Decoration4"
import Decoration5 from "../decoration/Decoration5"
import Decoration6 from "../decoration/Decoration6"
import Decoration8 from "../decoration/Decoration8"
import Decoration9 from "../decoration/Decoration9"

interface Props {
    styles: PanelStyles
}

const PanelDecoration = ({ styles }: Props) => {
    return <Box display="flex" justifyContent={styles.decoration.justifyContent}><Inner styles={styles} /></Box>
}

const Inner = ({styles}:Props) => {
    const s = {
        position: 'absolute' as any, 
        width: styles.decoration.width, 
        height: styles.decoration.height, 
        top: styles.decoration.top, 
        left: styles.decoration.left 
    }
    switch (styles.decoration.type) {            
        case PanelDecorationType.Decoration1:
            return <Decoration1 style={s} reverse={styles.decoration.reverse}/>
        case PanelDecorationType.Decoration2:
            return <Decoration2 style={s} reverse={styles.decoration.reverse} />
        case PanelDecorationType.Decoration3:
            return <Decoration3 style={s} reverse={styles.decoration.reverse}/>
            case PanelDecorationType.Decoration4:
            return <Decoration4 style={s} reverse={!styles.decoration.reverse}/>
            case PanelDecorationType.Decoration5:
            return <Decoration5 style={s} reverse={styles.decoration.reverse}/>
            case PanelDecorationType.Decoration6:
            return <Decoration6 style={s} reverse={styles.decoration.reverse}/>
            case PanelDecorationType.Decoration8:
            return <Decoration8 style={s} reverse={styles.decoration.reverse}/>
            case PanelDecorationType.Decoration9:
            return <Decoration9 style={s} reverse={styles.decoration.reverse}/>
            case PanelDecorationType.Decoration10:
            return <Decoration10 style={s} reverse={styles.decoration.reverse}/>
            case PanelDecorationType.Decoration12:
            return <Decoration12 style={s} reverse={styles.decoration.reverse}/>

        default:
            return <></>
    }
}
export default PanelDecoration
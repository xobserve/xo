import { Box } from "@chakra-ui/react"
import BorderBox1 from "components/largescreen/border/Border1"
import BorderBox10 from "components/largescreen/border/Border10"
import BorderBox11 from "components/largescreen/border/Border11"
import BorderBox12 from "components/largescreen/border/Border12"
import BorderBox13 from "components/largescreen/border/Border13"
import BorderBox2 from "components/largescreen/border/Border2"
import BorderBox3 from "components/largescreen/border/Border3"
import BorderBox4 from "components/largescreen/border/Border4"
import BorderBox5 from "components/largescreen/border/Border5"
import BorderBox6 from "components/largescreen/border/Border6"
import BorderBox7 from "components/largescreen/border/Border7"
import BorderBox8 from "components/largescreen/border/Border8"
import BorderBox9 from "components/largescreen/border/Border9"
const PanelBorder = ({ border, children,width,height }) => {
    switch (border) {
        case "None":
            return <Box>{children}</Box>
        case "Border1":
            return <BorderBox1 style={{width,height}}>{children}</BorderBox1>
        case "Border2":
            return <BorderBox2 style={{width,height}}>{children}</BorderBox2>
        case "Border3":
            return <BorderBox3 style={{width,height}}>{children}</BorderBox3>
        case "Border4":
            return <BorderBox4 style={{width,height}}>{children}</BorderBox4>
        case "Border5":
            return <BorderBox5 style={{width,height}}>{children}</BorderBox5>
        case "Border6":
            return <BorderBox6 style={{width,height}}>{children}</BorderBox6>
        case "Border7":
            return <BorderBox7 style={{width,height}}>{children}</BorderBox7>
        case "Border8":
            return <BorderBox8 style={{width,height}}>{children}</BorderBox8>
        case "Border9":
            return <BorderBox9 style={{width,height}}>{children}</BorderBox9>
        case "Border10":
            return <BorderBox10 style={{width,height}}>{children}</BorderBox10>
        case "Border11":
            return <BorderBox11 style={{width,height}}>{children}</BorderBox11>
        case "Border12":
            return <BorderBox12 style={{width,height}}>{children}</BorderBox12>
        case "Border13":
            return <BorderBox13 style={{width,height}}>{children}</BorderBox13>
        default:
            return <Box className="bordered">{children}</Box>
    }
}


export default PanelBorder
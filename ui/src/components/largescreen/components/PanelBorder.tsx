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
const PanelBorder = ({ border, children }) => {
    switch (border) {
        case "None":
            return <Box>{children}</Box>
        case "Border1":
            return <BorderBox1>{children}</BorderBox1>
        case "Border2":
            return <BorderBox2>{children}</BorderBox2>
        case "Border3":
            return <BorderBox3>{children}</BorderBox3>
        case "Border4":
            return <BorderBox4>{children}</BorderBox4>
        case "Border5":
            return <BorderBox5>{children}</BorderBox5>
        case "Border6":
            return <BorderBox6>{children}</BorderBox6>
        case "Border7":
            return <BorderBox7>{children}</BorderBox7>
        case "Border8":
            return <BorderBox8>{children}</BorderBox8>
        case "Border9":
            return <BorderBox9>{children}</BorderBox9>
        case "Border10":
            return <BorderBox10>{children}</BorderBox10>
        case "Border11":
            return <BorderBox11>{children}</BorderBox11>
        case "Border12":
            return <BorderBox12>{children}</BorderBox12>
        case "Border13":
            return <BorderBox13>{children}</BorderBox13>
        default:
            return <Box className="bordered">{children}</Box>
    }
}


export default PanelBorder
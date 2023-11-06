import { useMediaQuery, useToast } from "@chakra-ui/react"
import { useStore } from "@nanostores/react"
import { useEffect } from "react"
import { MobileVerticalBreakpoint } from "src/data/constants"
import { commonMsg } from "src/i18n/locales/en"

export const useLandscapeMode = (trigger=true) => {
    const t = useStore(commonMsg)
    const [isMobileVertical] =  useMediaQuery(MobileVerticalBreakpoint)
    const toast = useToast()
    useEffect(() => {
        if (isMobileVertical && trigger) {
            toast({
                title: t.landscapeModeTips,
                status: "info",
                duration: 3000,
                isClosable: true,
            })
        }
    },[isMobileVertical, trigger])

    return null
}
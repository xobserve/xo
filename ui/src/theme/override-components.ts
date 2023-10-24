import { mode } from "@chakra-ui/theme-tools"
import customColors from "./colors"


const components =  {
    Modal: {
        baseStyle: (props) => ({
          dialog: {
            bg: mode(customColors.modalBg.light, customColors.modalBg.dark)(props),
          }
        })
      },
      Drawer: {
        baseStyle: (props) => ({
          dialog: {
            bg: mode(customColors.modalBg.light, customColors.modalBg.dark)(props),
          }
        })
      },
      Menu: {
        baseStyle: (props) => ({
          list: {
            bg: mode(customColors.popperBg.light, customColors.popperBg.dark)(props),
          },
          item: {
            bg: mode(customColors.popperBg.light, customColors.popperBg.dark)(props),
            _hover: {
              color: "brand.500",
            },
            _focus: {
              color: "brand.500",
            },
          },
        })
      },
      Popover: {
        baseStyle: (props) => ({
          content: {
            bg: mode(customColors.popperBg.light, customColors.popperBg.dark)(props),
          }
        })
      },
      Select: {
        baseStyle: (props) => ({
          field: {
            bg: mode(customColors.popperBg.light, customColors.popperBg.dark)(props),
          }
        })
      },
}

export default components
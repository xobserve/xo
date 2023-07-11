import { useColorMode } from "@chakra-ui/react";
import { ConfigProvider, theme } from "antd";
import customColors from "src/theme/colors";

const AntdWrapper = ({children}) => {
    const { colorMode } = useColorMode()
    const { defaultAlgorithm, darkAlgorithm } = theme;
    return (<ConfigProvider
        theme={{
            algorithm: colorMode == "light" ? defaultAlgorithm : darkAlgorithm,
            token: {
                colorBgContainer: colorMode == "light" ?customColors.bodyBg.light : customColors.bodyBg.dark,
                colorPrimary:  colorMode == "light" ?customColors.primaryColor.light : customColors.primaryColor.dark,
                colorBgElevated: colorMode == "light" ?customColors.popperBg.light : customColors.popperBg.dark ,
                colorBgSpotlight: colorMode == "light" ?customColors.tooltipBg.light : customColors.tooltipBg.dark,
            }
        }}>
       {children}
    </ConfigProvider>)
}

export default AntdWrapper
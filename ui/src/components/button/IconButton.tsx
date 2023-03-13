import { Button, useColorModeValue } from "@chakra-ui/react"

const IconButton = ({children,fontSize="1.3rem",...rest}) => {
    return <Button 
            variant="outline" 
            p="1" 
            borderColor="inherit" 
            color={useColorModeValue("var(--chakra-colors-gray-600)", "var(--chakra-colors-whiteAlpha-900)")} 
            fontSize={fontSize}
            {...rest}
            >
            {children}
          </Button>
}

export default IconButton
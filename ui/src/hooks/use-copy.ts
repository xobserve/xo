import { useToast } from "@chakra-ui/react";
import copy from 'copy-to-clipboard';

const useCopy = () => {
    const toast = useToast()
    
    const copyToClipboard = (t) =>{
        copy(t)
        toast({
            description: "复制成功",
            status: "success",
            duration: 2000,
            isClosable: true,
        });
    }

    return copyToClipboard
}


export default useCopy
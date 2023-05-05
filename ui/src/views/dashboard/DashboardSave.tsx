import { useToast } from "@chakra-ui/react"
import IconButton from "components/button/IconButton"
import { useLeavePageConfirm } from "hooks/useLeavePage"
import { isEqual } from "lodash"
import { useEffect, useState } from "react"
import { FaRegSave } from "react-icons/fa"
import { Dashboard } from "types/dashboard"
import { requestApi } from "utils/axios/request"

interface Props {
    dashboard: Dashboard
}
const DashboardSave = ({dashboard}:Props) => {
    const [saved, setSaved] = useState(null)
    const [pageChanged, setPageChanged] = useState(false)

    useLeavePageConfirm(pageChanged)

    useEffect(() => {
        if (!saved) {
            setSaved(dashboard)
            return 
        }
        
        const changed = !isEqual(dashboard, saved)
        if (changed) {
            setSaved(dashboard)
            setPageChanged(true)
        }
    },[dashboard])

    const toast = useToast()
    const onSave = async () => {
        await requestApi.post("/dashboard/save", dashboard)
        toast({
            title: "Dashboard saved.",
            status: "success",
            duration: 3000,
            isClosable: true,
        })
        setSaved(dashboard)
        setPageChanged(false)
    }

    return (
        <IconButton onClick={onSave} variant="ghost"><FaRegSave /></IconButton>
    )
}

export default DashboardSave
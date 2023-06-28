import { Box, Button, HStack, Input, InputGroup, InputLeftAddon, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, VStack, useDisclosure } from "@chakra-ui/react"
import CodeEditor from "components/CodeEditor/CodeEditor"
import Label from "components/form/Label"
import { cloneDeep, isEmpty, set } from "lodash"
import { useEffect, useState } from "react"
import { PanelQuery } from "types/dashboard"
import { Datasource, DatasourceEditorProps } from "types/datasource"
import { useImmer } from "use-immer"


const HttpQueryEditor = ({ datasource, query, onChange }: DatasourceEditorProps) => {
    const [tempQuery, setTempQuery] = useState<PanelQuery>(cloneDeep(query))
    useEffect(() => {
        if (isEmpty(tempQuery.data.transformResult)) {
            setTempQuery({
                ...tempQuery, data: {
                    ...tempQuery.data, transformResult: 
                    `function transformResult(httpResult, query, startTime, endTime) {
    console.log("here33333 result:", httpResult)
    const data = httpResult.data
    let res = []
    if (data.resultType === "matrix") {
        for (const m of data.result) {
            const metric = JSON.stringify(m.metric).replace(/:/g, '=')

            const timeValues = []
            const valueValues = []

            if (!_.isEmpty(m.values)) {
                let start = startTime
                if (m.values[0][0] <= start) {
                    start = _.round(m.values[0][0])
                }

                m.values.forEach((v, i) => {
                    if (i == 0) {
                        if (_.round(v[0]) == start) {
                            timeValues.push(start)
                            valueValues.push(v[1])
                        } else if (_.round(v[0]) > start) {
                            timeValues.push(start)
                            valueValues.push(null)
                        }
                    }


                    const lastTs = _.last(timeValues)

                    for (let i = lastTs + query.interval; i <= v[0]; i += query.interval) {
                        if (i < v[0]) {
                            timeValues.push(i)
                            valueValues.push(null)
                        } else {
                            timeValues.push(v[0])
                            valueValues.push(v[1])
                        }
                    }
                })
            }


            const series = {

                name: metric,
                length: m.values.length,
                fields: [
                    {
                        name: "Time",
                        type: "time",
                        values: timeValues,
                    },
                    {
                        name: "Value",
                        type: "number",
                        values: valueValues,
                        labels: m.metric
                    }
                ],
            }


            res.push(series)
        }
    }
    return res
}`}
            })
            onChange(cloneDeep(tempQuery))
        }

        if (isEmpty(tempQuery.data.transformRequest)) {
            setTempQuery({
                ...tempQuery, data: {
                    ...tempQuery.data, transformRequest: 
`function transformRequest(url,headers,startTime, endTime) {
    console.log("here33333:", url, headers, startTime, endTime)
    let newUrl = url + \`&start=$\{startTime}&end=$\{endTime}\`
    return newUrl
}`     }
            })
            onChange(cloneDeep(tempQuery))
        }
    }, [])

    return (<>
        <VStack alignItems="left" spacing="1">
            <HStack>
                <Label width="200px">URL</Label>
                <Input
                    value={tempQuery.metrics}
                    onChange={(e) => {
                        setTempQuery({ ...tempQuery, metrics: e.currentTarget.value })
                    }}
                    onBlur={() => onChange(tempQuery)}
                    placeholder="Remote http address"
                    size="sm"
                />
            </HStack>
            <HStack>
                <Label width="200px" desc="If you want insert some imformation before request is sent to remote, e.g current time, just edit this function">Request transform</Label>
                <CodeEditorModal value={tempQuery.data.transformRequest} onChange={v => {
                    tempQuery.data.transformRequest = v
                    onChange(tempQuery)
                }} />
            </HStack>
            <HStack>
                <Label width="200px" desc="The http request result is probably not compatible with your visualization panels, here you can define a function to transform the result">Result transform</Label>
                <CodeEditorModal value={tempQuery.data.transformResult} onChange={v => {
                    tempQuery.data.transformResult = v
                    onChange(tempQuery)
                }} />
            </HStack>
        </VStack>
    </>)
}

export default HttpQueryEditor




const CodeEditorModal = ({ value, onChange }: { value: string; onChange: any }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [temp, setTemp] = useState(null)

    useEffect(() => {
        setTemp(value)
    }, [value])

    const onSubmit = () => {
        onChange(temp)
        onClose()
    }

    return (<>
        <Button size="sm" onClick={onOpen} >Edit function</Button>
        <Modal isOpen={isOpen} onClose={onClose} size="full">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader py="2">
                    Edit registerEvents function
                    <ModalCloseButton />
                </ModalHeader>
                <ModalBody pt="2" pb="0" px="0">
                    <Box height="400px"><CodeEditor value={temp} onChange={v => setTemp(v)} /></Box>
                    <Button onClick={onSubmit} width="100%">Submit</Button>
                </ModalBody>

            </ModalContent>
        </Modal>
    </>
    )
}


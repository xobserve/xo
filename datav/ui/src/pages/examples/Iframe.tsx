import { Text } from "@chakra-ui/react"
import React from "react"
import { Divider } from "antd"


const IframeExamplesPage = () => {
  return (
    <>
    <Text fontWeight={600}>Iframe "Requests to xobserve" </Text>
    <iframe src="https://play.xobserve.io/home?&embed=true&fullscreen=on&from=now-6h&to=now&toolbar=off&viewPanel=4&colorMode=dark" height={500} width={800}/>
    <Divider />
    <Text mt="3" fontWeight={600}>Iframe "Tcp stats" with light theme</Text>
    <iframe src="https://play.xobserve.io/host?&embed=true&fullscreen=on&from=now-6h&to=now&var-host=web-xobserve-1&viewPanel=12&colorMode=light" height={500} width={800}/>
    <Divider />
    <Text mt="3" fontWeight={600}>Iframe "Heap objects" with top toolbar</Text>
    <iframe src="https://play.xobserve.io/runtime?&embed=true&fullscreen=on&from=now-6h&to=now&var-host=web-xobserve-1&toolbar=on&viewPanel=10&colorMode=dark" height={500} width={800}/>
    <Divider />
    <Text mt="3" fontWeight={600}>Iframe "Go runtime" dashboard</Text>
    <iframe src="https://play.xobserve.io/runtime?&embed=true&fullscreen=on&from=now-6h&to=now&var-host=web-xobserve-1&colorMode=dark" height={500} width="100%"/>

    </>
  )
}
export default IframeExamplesPage



import { Box, Input } from "@chakra-ui/react"
import { ColorModeSwitcher } from "components/ColorModeSwitcher"
import { Form, FormSection } from "components/form/Form"
import FormItem from "components/form/Item"
import { useState } from "react"

const TestPage = () => {


  return (<Box width="400px" ml="10" mt="10">
    <Form>
      <FormSection title="Test">
        <FormItem title="Jaeger" desc="bbbb"><Input /></FormItem>
        <FormItem title="Prometheus" desc="bbbb"><Input /></FormItem>
      </FormSection>

      <FormSection title="Test">
        <FormItem title="Jaeger" desc="bbbb"><Input /></FormItem>
        <FormItem title="Prometheus" desc="bbbb"><Input /></FormItem>
      </FormSection>
    </Form>
    <ColorModeSwitcher />
  </Box>)
}

export default TestPage


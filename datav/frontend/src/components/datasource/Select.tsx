// Copyright 2023 xObserve.io Team

import { Image } from '@chakra-ui/react'
import { chakraComponents } from 'chakra-react-select'
import { Variant } from 'chakra-react-select/dist/types/types'
import InputSelect from 'src/components/select/InputSelect'
import React from 'react'
import { useStore } from '@nanostores/react'
import { $datasources } from 'src/views/datasource/store'
import { $teams } from 'src/views/team/store'
import { externalDatasourcePlugins } from 'src/views/dashboard/plugins/external/plugins'
import { builtinDatasourcePlugins } from 'src/views/dashboard/plugins/built-in/plugins'
import { isPluginDisabled } from 'utils/plugins'

interface Props {
  value: number
  onChange: any
  allowTypes?: string[]
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
}

const DatasourceSelect = ({
  value,
  onChange,
  allowTypes = [],
  variant = 'unstyled',
  size = 'md',
}: Props) => {
  const datasources = useStore($datasources)
  console.log('here33333:', datasources)
  const teams = $teams.get()
  const options = []
  datasources.forEach((ds) => {
    if (allowTypes.length > 0 && !allowTypes.includes(ds.type)) {
      return
    }
    const p0 = builtinDatasourcePlugins[ds.type]
    const p = externalDatasourcePlugins[ds.type]
    const plugin = p0 ?? p
    if (isPluginDisabled(plugin)) {
      return
    }

    options.push({
      label: ds.name,
      value: ds.id,
      subLabel: p && 'external',
      icon: (
        <Image
          width='30px'
          height='30px'
          mr='2'
          src={`/plugins/datasource/${ds.type}.svg`}
        />
      ),
      annotation: teams.find((t) => ds.teamId == t.id)?.name,
    })
  })

  return (
    <InputSelect
      width='100%'
      isClearable
      value={value?.toString()}
      label={datasources.find((ds) => ds.id == value)?.name}
      placeholder={'select datasource, support variable'}
      size='md'
      options={options}
      onChange={onChange}
      variant='unstyled'
      enableInput
    />
    // <ChakraSelect value={{ value: value, label: datasources.find(ds => ds.id == value)?.name }} placeholder="select datasource" variant={variant} size={size} options={options}
    //     onChange={onChange}
    //     components={customComponents}
    // />
  )
}

export default DatasourceSelect

const customComponents = {
  Option: ({ children, ...props }) => (
    //@ts-ignore
    <chakraComponents.Option {...props}>
      {props.data.icon} {children}
    </chakraComponents.Option>
  ),
}

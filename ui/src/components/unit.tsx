import { Button, calc, HStack, Input, NumberInput, NumberInputField, NumberInputStepper, Select, useToast, VStack } from "@chakra-ui/react"
import { cloneDeep, isEmpty, round } from "lodash"
import { useEffect, useState } from "react"
import { FaArrowUp, FaMinus, FaPlus } from "react-icons/fa"
import { UnitsType,Unit } from "types/panel/plugins"

interface Props {
    type: UnitsType
    value: Unit[]
    onChange: any
}



export const UnitPicker = ({type, value, onChange }: Props) => {
    const [unitType, setUnitTYpe] = useState(type)
    const [units, setUnits] = useState(value)
    const toast = useToast()
    const onAddUnit = () => {
        units.push({
            operator: units[0].operator ?? 'x',
            rhs: 1,
            unit: ''
        })
        setUnits(cloneDeep(units))
    }

    const onRemoveUnit = (i) => {
        units.splice(i,1)
        setUnits(cloneDeep(units))
    }

    const onLiftUnit = (i) => {
        [units[i-1],units[i]] = [units[i],units[i-1]]
         
        setUnits(cloneDeep(units))
    }

    const onChangeUnitType = t => {
        setUnitTYpe(t)
        switch (t) {
            case "none":
                setUnits([])
                break;
            case "percent": 
                setUnits([{
                    operator: "x",
                    rhs: 100,
                    unit: "%"
                }])
                break
            case "percent%": 
                setUnits([{
                    operator: "x",
                    rhs: 1,
                    unit: "%"
                }])
                break
            case "time":
                setUnits([
                    {
                        operator: "/",
                        rhs: 1,
                        unit: "ms"
                    },
                    {
                        operator: "/",
                        rhs: 1000,
                        unit: "s"
                    },{
                        operator: "/",
                        rhs: 60,
                        unit: "m"
                    },{
                        operator: "/",
                        rhs: 60,
                        unit: "h"
                    },{
                        operator: "/",
                        rhs: 24,
                        unit: "d"
                    }
                ])
                break
            case "bytes":
                setUnits([
                {
                    operator: "/",
                    rhs: 1,
                    unit: "B"
                },
                {
                    operator: "/",
                    rhs: 1024,
                    unit: "KB"
                },{
                    operator: "/",
                    rhs: 1024,
                    unit: "MB"
                },{
                    operator: "/",
                    rhs: 1024,
                    unit: "GB"
                }])
            
            case "custom":
                break
            default:
                setUnits([])
                break;
        }
    }

    const onSubmit = () => {
        // checking whether rhs of first unit is 1, because the fist unit has to be the base unit
        // if (units.length > 0 && units[0].rhs != 1) {
        //     toast({
        //         description: "rhs of first unit must be set to 1, because the fist unit is base unit",
        //         status: "warning",
        //         duration: 5000,
        //         isClosable: true,
        //     });
        //     return 
        // }
        onChange(units,unitType)
    }
    return (
        <>
            <HStack>
                <Select value={unitType} onChange={e => onChangeUnitType(e.currentTarget.value)}>
                    <option value="none">None</option>
                    <option value="percent">Percent: 1 -&gt; 100%</option>
                    <option value="percent%">Percent: 1 -&gt; 1%</option>
                    <option value="time">Time: ms/s/m/.../day</option>
                    <option value="bytes">Bytes: b/KB/MB/GB</option>
                    <option value="custom">Custom units</option>
                </Select>
                {unitType == "custom" && <FaPlus cursor="pointer" onClick={onAddUnit}  opacity="0.8" fontSize="sm"/>}
            </HStack>
            <VStack alignItems="left" mt="2">
                {units?.map((unit,i) => {
                    return <HStack>

                        <Button size="sm" onClick={() => {
                            unit.operator = unit.operator == 'x' ? '/' : 'x'
                            setUnits(cloneDeep(units))
                        }}>{unit.operator}</Button>

                        <NumberInput size="sm"  value={unit.rhs} onChange={(_, v) => {
                            unit.rhs = v
                            setUnits(cloneDeep(units))
                        }}>
                            <NumberInputField />
                        </NumberInput>

                        <Input width="70px" size="sm" value={unit.unit} placeholder="e.g % , bytes" onChange={e => {
                            unit.unit = e.currentTarget.value
                            setUnits(cloneDeep(units))
                        }} />
                        <FaMinus opacity="0.8" cursor="pointer" onClick={() => onRemoveUnit(i)} fontSize="0.9rem"/>
                        {i != 0 && <FaArrowUp  opacity="0.8" cursor="pointer" onClick={() => onLiftUnit(i)} fontSize="0.9rem"/>}
                    </HStack>

                })}
            </VStack>
            <Button mt="2" size="sm" variant="outline" onClick={onSubmit}>Submit</Button>
        </>)
}

export const formatUnit = (v: number, units: Unit[],decimal: number) => {
    if (isEmpty(units)) {
        return v
    }

    let initValue = v
    for (var i = 0; i < units.length;i++) {
        const unit = units[i]
        let res = calcValue(initValue, unit)


        if (res < 1 && i != 0) {
            return initValue.toFixed(decimal) + units[i-1].unit
        }   
        
        if (res < 1 && i == 0) {
            return res.toFixed(decimal) + unit.unit
        }
          
        if (i == units.length - 1) {
            return res.toFixed(decimal) + unit.unit
        }
        
        initValue = res
    }
    
}

const calcValue = (v,unit:Unit)  => {
    let res
    switch (unit.operator) {
        case "x":
            res = v * unit.rhs
            break;
        case "/":
            res = v / unit.rhs
            break
        default:
            res = v
            break;
    }
    return res
}
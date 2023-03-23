import { Button, HStack, Input, NumberInput, NumberInputField, NumberInputStepper, Select, VStack } from "@chakra-ui/react"
import { cloneDeep } from "lodash"
import { useEffect, useState } from "react"
import { FaArrowUp, FaMinus, FaPlus } from "react-icons/fa"
import { UnitsType,Unit } from "types/dashboard"

interface Props {
    type: UnitsType
    value: Unit[]
    onChange: any
}



export const UnitPicker = ({type, value, onChange }: Props) => {
    const [unitType, setUnitTYpe] = useState(type)
    const [units, setUnits] = useState(value)

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
                    rhs: 1000,
                    unit: "KB"
                },{
                    operator: "/",
                    rhs: 1000000,
                    unit: "MB"
                },{
                    operator: "/",
                    rhs: 1000000000,
                    unit: "GB"
                }])
            
            case "custom":
                break
            default:
                setUnits([])
                break;
        }
    }

    return (
        <>
            <HStack>
                <Select value={unitType} onChange={e => onChangeUnitType(e.currentTarget.value)}>
                    <option value="none">None</option>
                    <option value="percent">Percent: 0.1 -&gt; 10%</option>
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
            <Button mt="2" size="sm" variant="outline" onClick={() => onChange(units,unitType)}>Submit</Button>
        </>)
}

export const formatUnit = (v: number, units: Unit[]) => {
    for (var i = units.length-1;i>=0;i--) {
        const unit = units[i]
        let res;
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

        if (res >= 0.1) {
            return res.toString() + unit.unit
        }

        if (i == 0) {
            return v.toString()
        }
    }
    
}
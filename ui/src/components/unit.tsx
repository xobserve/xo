import { Button, HStack, Input, NumberInput, NumberInputField, Select, VStack } from "@chakra-ui/react"
import { cloneDeep, isEmpty, round } from "lodash"
import { useState } from "react"
import { FaArrowUp, FaMinus, FaPlus } from "react-icons/fa"
import { UnitsType, Unit } from "types/panel/plugins"

interface Props {
    type: UnitsType
    value: Unit[]
    onChange: any
    size?: "sm" | "md" | "lg"
}



export const UnitPicker = ({ type, value, onChange,size="md" }: Props) => {
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
        units.splice(i, 1)
        setUnits(cloneDeep(units))
    }

    const onLiftUnit = (i) => {
        [units[i - 1], units[i]] = [units[i], units[i - 1]]

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
                    }, {
                        operator: "/",
                        rhs: 60 * 1000,
                        unit: "m"
                    }, {
                        operator: "/",
                        rhs: 60 * 60 * 1000,
                        unit: "h"
                    }, {
                        operator: "/",
                        rhs: 24 * 60 * 60 * 1000,
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
                    }, {
                        operator: "/",
                        rhs: 1024 * 1024,
                        unit: "MB"
                    }, {
                        operator: "/",
                        rhs: 1024 * 1024 * 1024,
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
        onChange(units, unitType)
    }
    return (
        <>
            <HStack>
                <Select size={size} value={unitType} onChange={e => onChangeUnitType(e.currentTarget.value)}>
                    <option value="none">None</option>
                    <option value="percent">Percent: 1 -&gt; 100%</option>
                    <option value="percent%">Percent: 1 -&gt; 1%</option>
                    <option value="time">Time: ms/s/m/.../day</option>
                    <option value="bytes">Bytes: b/KB/MB/GB</option>
                    <option value="custom">Custom units</option>
                </Select>
                {unitType == "custom" && <FaPlus cursor="pointer" onClick={onAddUnit} opacity="0.8" fontSize="sm" />}
            </HStack>
            <VStack alignItems="left" mt="2">
                {units?.map((unit, i) => {
                    return <HStack>

                        <Button size="sm" onClick={() => {
                            unit.operator = unit.operator == 'x' ? '/' : 'x'
                            setUnits(cloneDeep(units))
                        }}>{unit.operator}</Button>

                        <NumberInput size="sm" value={unit.rhs} onChange={(_, v) => {
                            unit.rhs = v
                            setUnits(cloneDeep(units))
                        }}>
                            <NumberInputField />
                        </NumberInput>

                        <Input width="70px" size="sm" value={unit.unit} placeholder="e.g % , bytes" onChange={e => {
                            unit.unit = e.currentTarget.value
                            setUnits(cloneDeep(units))
                        }} />
                        <FaMinus opacity="0.8" cursor="pointer" onClick={() => onRemoveUnit(i)} fontSize="0.9rem" />
                        {i != 0 && <FaArrowUp opacity="0.8" cursor="pointer" onClick={() => onLiftUnit(i)} fontSize="0.9rem" />}
                    </HStack>

                })}
            </VStack>
            <Button mt="2" size="sm" variant="outline" onClick={onSubmit}>Submit</Button>
        </>)
}


export const formatUnit = (v0: number, units: Unit[], decimal: number) => {
    let v = v0 
    if (v0 < 0) {
        v = -1 * v0
    }

    if (isEmpty(units)) {
        return  v0 < 0 ?  round(v, decimal) * -1 : round(v, decimal)
    }

    if (v == 0) {
        return v 
    }

    let index = 0;
    let min;
    // we need to find the min calc value that is greater than 1
    for (var i = 0; i < units.length; i++) {
        const unit = units[i]
        const res = calcValue(v, unit)
        if (res >= 1) {
            if (!min) {
                min = res
                index = i
                continue
            }
            if (res < min) {
                min = res
                index = i
                continue
            }
        }
    }

    if (min < 1 || !min) {
        // no calc value is greater than 1, we need to find the max one
        let max = 0;
        for (var i = 0; i < units.length; i++) {
            const unit = units[i]
            const res = calcValue(v, unit)
            if (res > max) {
                max = res
                index = i
            }
        }
    }


    const unit = units[index]
    const res = calcValue(v, unit)
    if (v0 <0) {
        return round(res,decimal) * -1 + unit.unit
    } else {
        return round(res,decimal) + unit.unit
    }
}

const calcValue = (v, unit: Unit) => {
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
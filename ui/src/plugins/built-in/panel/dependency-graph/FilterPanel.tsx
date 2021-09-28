import React from 'react'
import _ from 'lodash'
import { Modal, Input, InputNumber, Divider } from 'antd'
import { IGraph, FilterConditions, NodeFilterType, ConditionFilterType, ConditionMetric } from './types'
import { Select, Tag } from 'antd'
import { PlusOutlined, CloseOutlined } from '@ant-design/icons'
import { LegacyForms } from 'src/packages/datav-core/src/ui'
const {Switch} = LegacyForms

const { Option } = Select
const { ALL, IN, OUT_OF } = NodeFilterType
const { AND, OR } = ConditionFilterType
const { REQUESTS, ERRORS, ERRORS_RATE, RESP_TIME } = ConditionMetric
interface Props {
    onChange: any
    onClose: any
    onSubmit: any
    conditions: FilterConditions
    graph: IGraph
}

const ConditionMetrics = {
    [REQUESTS]: 'Request count',
    [ERRORS]: 'Error count',
    [ERRORS_RATE]: 'Error rate',
    [RESP_TIME]: 'Response time'
}


const FilterPanel = ({ graph, conditions, onClose, onChange,onSubmit}: Props) => {
    const nodes = []
    if (graph && graph.nodes) {
        graph.nodes.forEach(node => {
            nodes.push(<Option value={node.name} key={node.name}>{node.name}</Option>)
        })
    }

    const setNodeConType = (v) => {
        conditions.nodes.type = v
        onChange(conditions)
    }

    const setNodeConNames = (v) => {
        conditions.nodes.names = v
        onChange(conditions)
    }

    const addCondition = () => {
        conditions.conditions.push({
            type: AND,
            metric: ERRORS,
            operator: '>=',
            value: 0
        })
        onChange(conditions)
    } 

    const delCondition = (i) => {
        conditions.conditions.splice(i,1)
        onChange(conditions)
    }

    const metricOptions = []
    _.forEach(ConditionMetrics, (v, k) => metricOptions.push(<Option value={k} key={k}>{v}</Option>))

    return (
        <>
            <Modal title={null} onCancel={onClose} visible={true} onOk={onSubmit}>
                {/* Set nodes filter conditions */}
                <div className="gf-form">
                    <label className="gf-form-label query-keyword">WHEN NODES</label>
                    {conditions.nodes.type === ALL && <Tag className="pointer" onClick={() => setNodeConType(IN)}>OF ALL</Tag>}
                    {conditions.nodes.type === IN && <Tag className="pointer" onClick={() => setNodeConType(OUT_OF)} >IN</Tag>}
                    {conditions.nodes.type === OUT_OF && <Tag className="pointer" onClick={() => setNodeConType(ALL)}>OUT OF</Tag>}
                    {conditions.nodes.type !== ALL && <Select style={{ minWidth: '200px' }} mode="multiple" value={conditions.nodes.names} onChange={setNodeConNames} placeholder="node names..." maxTagCount={2} allowClear>{nodes}</Select>}
                </div>

                {conditions.conditions.length > 0 && <Divider />}

                {
                    conditions.conditions.map((con,i) =>
                        <div className="gf-form ub-ml1" key={i}>
                            {con.type === AND ?
                                <Tag className="pointer width-3" onClick={() => { con.type = OR; onChange(conditions) }}>AND</Tag> :
                                <Tag className="pointer width-3" onClick={() => { con.type = AND; onChange(conditions) }}>OR</Tag>}

                            <Select className="width-8" value={con.metric} onChange={(v) => {con.metric=v; onChange(conditions)}}>{metricOptions}</Select>

                            {con.operator === '>=' ? 
                                <Tag className="pointer ub-ml2" onClick={() => {con.operator='<='; onChange(conditions)}}>&gt;=</Tag> :
                                <Tag className="pointer ub-ml2" onClick={() => {con.operator='>='; onChange(conditions)}}>&lt;=</Tag>}
                            
                            <InputNumber value={con.value} onBlur={(e) => {con.value = _.toNumber(e.currentTarget.value); onChange(conditions)}} />
                            
                            <Tag className="ub-ml1 pointer" onClick={() => delCondition(i)}><CloseOutlined /></Tag>
                        </div>)
                }

                <div className="gf-form">
                    <Tag className="ub-ml1 pointer" onClick={addCondition}><PlusOutlined /></Tag>
                </div>

                <Divider />
                <div className="gf-form">
                    <label className="gf-form-label width-7">Store conditions</label>
                    <Switch label="" checked={conditions.store} onChange={(e) => {conditions.store=e.currentTarget.checked;onChange(conditions)}}/>
                </div>
            </Modal>
        </>
    )
}


export default FilterPanel;
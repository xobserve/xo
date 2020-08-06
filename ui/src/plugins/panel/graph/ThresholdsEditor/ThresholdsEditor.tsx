import React, { PureComponent, ChangeEvent } from 'react';
import { css } from 'emotion';
import {
    Threshold,
    ThresholdsMode,
    SelectableValue,
} from 'src/packages/datav-core';
import {  Button,InputNumber,Select} from 'antd';
import { FullWidthButtonContainer ,LegacyForms,Icon} from 'src/packages/datav-core';
import { PlusOutlined } from '@ant-design/icons';
import './ThresholdsEditor.less'

const {LegacySwitch : Switch} = LegacyForms
const {Option} = Select 

export interface Props {
    value: Threshold[];
    onChange: (thresholds: Threshold[]) => void;
}

interface State {
}

export class ThresholdsEditor extends PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {  };
    }

    onAddThreshold = () => {
        this.props.value.push({
              colorMode: "critical",
              fill: true,
              line: true,
              op: "gt",
              value: 0,
              yaxis: "left"}
        )
        this.props.onChange(this.props.value)
        const { } = this.state;
    };

    onRemoveThreshold = (index: number) => {
        this.props.value.splice(index,1)
        this.props.onChange(this.props.value)
    };

    render() {
        const { value } = this.props;
        const {} = this.state;
        return (
            <>
                {
                    <div className={'thresholds-editor-wrapper'}>
                        {
                            value.map((t,index) => {
                                return <div className="gf-form-inline ub-mb3" key={index}>
                                    <div className="gf-form">
                                        <label className="gf-form-label">T{index+1}</label>
                                            <Select defaultValue={t.op}  onChange={(v) => {t.op = v;this.props.onChange(this.props.value)}}>
                                                <Option value="gt">gt</Option>
                                                <Option value="lt">lt</Option>
                                            </Select>
                                            <InputNumber defaultValue={t.value}  onChange={(v:number) => {t.value = v;this.props.onChange(this.props.value)}}/>
                                    </div>
                                    <div className="gf-form">
                                        <label className="gf-form-label">Color</label>
                                            <Select defaultValue={t.colorMode} onChange={(v) => {t.colorMode = v;this.props.onChange(this.props.value)}}>
                                                <Option value="critical">critical</Option>
                                                <Option value="warning">warning</Option>
                                                <Option value="ok">ok</Option>
                                            </Select>
                                    </div>
                                     <div className="gf-form">
                                        <Switch checked={t.fill} label="Fill" onChange={(e) =>{t.fill = e.currentTarget.checked;this.props.onChange(this.props.value)}}/>
                                    </div>
                                    <div className="gf-form">
                                        <Switch  checked={t.line} label="Line" onChange={(e) =>{t.line = e.currentTarget.checked;this.props.onChange(this.props.value)}}/>
                                    </div>
                                    <div className="gf-form">
                                        <label className="gf-form-label">Y-Axis</label>
                                            <Select defaultValue={t.yaxis} onChange={(v) => {t.yaxis = v;this.props.onChange(this.props.value)}}>
                                                <Option value="left">left</Option>
                                                <Option value="right">right</Option>
                                            </Select>
                                    </div>
                                    <label className="gf-form-label pointer" onClick={() => this.onRemoveThreshold(index)}>
                                        <Icon name="'trash-alt'"></Icon>
                                    </label>
                                </div>
                            })
                        }
                        <FullWidthButtonContainer className={'thresholds-editor-addButton'}>
                            <Button icon={<PlusOutlined />} onClick={() => this.onAddThreshold()} >
                                Add threshold
                            </Button>
                        </FullWidthButtonContainer>
                    </div>
                }
            </>
        );
    }
}

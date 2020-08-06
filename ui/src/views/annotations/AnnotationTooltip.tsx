import React from 'react'
import { AnnotationEvent } from 'src/packages/datav-core'
import { DashboardModel } from 'src/views/dashboard/model/DashboardModel'
import {Button} from 'antd'

interface Props {
    event: AnnotationEvent
    onEdit: any
}


const AnnotationTooltip = (props: Props) => {
    const timeFormated = new DashboardModel({}).formatDate(props.event.time)
    return (
        <div className="graph-annotation">
            <div className="graph-annotation__header">
                <div className="graph-annotation__user">
                </div>

                <div className="graph-annotation__title">
                    <span>Annotation</span>
                </div>

                <div className="graph-annotation__time">{timeFormated}</div>
            </div>

            <div className="graph-annotation__body text-center gf-form">
                <div style={{ display: "inline-block" }}>
                    <div className="gf-form gf-form--v-stretch">
                        <span className="gf-form-label width-7">Description</span>
                        <div className="width-20 input-line-height">{props.event.text}</div>
                    </div>

                    <div className="gf-form-button-row">
                        <Button className="btn btn-primary" onClick={props.onEdit} type="primary" ghost>Edit</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default AnnotationTooltip;
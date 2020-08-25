import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import {Modal} from 'antd'
import { FormattedMessage } from 'react-intl';
import {AlertNotification} from 'src/types'
import {Input,Select,Switch,Alert} from 'antd'
import { InlineFormLabel,config} from 'src/packages/datav-core';
import Email from './Notifiers/Email'
const {Option} = Select

interface Props {
    visible: boolean
    onCancel: any
    onEditSubmit: any
    onEditChange: any
    notification: AlertNotification
}

const notifiers = {
    'email' : Email
}

export const NotificationEdit = (props:Props) =>{
    const notifierOptions = _.keys(notifiers).map((notifier) => {
    return <Option value={notifier} key={notifier}>{notifier}</Option>
    })
    
    let Notifier = null
    if (props.notification) {
        Notifier = notifiers[props.notification.type]
    }

    const onNotifieChange = () => {
        console.log(props.notification)
    }

    return (
     props.notification &&
     <Modal
        title={props.notification.id ===0 ?<FormattedMessage id='alerting.addChannel' /> : <FormattedMessage id='alerting.editChannel' />}
        visible={props.visible}
        onOk={props.onEditSubmit}
        onCancel={() => props.onCancel()}
        width={700}
        >
      <h3 className="page-sub-heading">Edit Notification Channel</h3>
        <form>
            <div className="gf-form-group">
                <div className="gf-form">
                    <span className="gf-form-label width-12">Name</span>
                    <Input type="text" className="gf-form-input max-width-15" defaultValue={props.notification.name} onBlur={(e) => props.notification.name = e.currentTarget.value} />
                </div>

                <div className="gf-form">
                    <span className="gf-form-label width-12">Type</span>
                    <Select className="max-width-15" defaultValue={props.notification.type} onChange={(v) => {props.notification.type = v; props.onEditChange()}} >
                        {notifierOptions}
                    </Select>
                </div>

                <div className="gf-form">
                    <InlineFormLabel className="width-12" tooltip="Use this notification for all alerts">Default (send on all alerts)</InlineFormLabel>
                    <Switch  defaultChecked={props.notification.isDefault} onChange={(checked) => props.notification.isDefault = checked}/>
                </div>

                <div className="gf-form">
                    <InlineFormLabel className="width-12" tooltip="Use this notification for all alerts">Include image</InlineFormLabel>
                    <Switch  defaultChecked={props.notification.uploadImage} onChange={(checked) => { props.notification.uploadImage = checked ; props.onEditChange()}}/>
                </div>
                {
                    props.notification.uploadImage && !config.rendererAvailable && 
                    <Alert
                    message="No image renderer available/installed"
                    description="Please contact your  administrator to install 'Image Renderer plugin'"
                    type="warning"
                  />
                }
                 <div className="gf-form">
                    <InlineFormLabel className="width-12" tooltip="Disable the resolve message [OK] that is sent when alerting state returns to false">Disable Resolve Message</InlineFormLabel>
                    <Switch  defaultChecked={props.notification.disableResolveMessage} onChange={(checked) => { props.notification.disableResolveMessage = checked}}/>
                </div>

                {
                    <Notifier className="ub-mt4" notification={props.notification} onChange={() => onNotifieChange()}/>
                }   
            </div>
        </form>
    </Modal>
    )
}

;
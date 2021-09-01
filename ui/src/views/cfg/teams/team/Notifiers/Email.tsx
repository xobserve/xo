import React from 'react'
import { AlertNotification } from 'src/types'
import {Input} from 'antd'
import {  localeData, currentLang } from 'src/packages/datav-core/src'
import { InlineFormLabel } from 'src/packages/datav-core/src/ui'


interface Props {
   notification: AlertNotification
   onChange: any
}

const EmailNotifier = (props:Props) =>{
    return (
        <>
            <h3 className="page-sub-heading">{localeData[currentLang]['alerting.emailSettings']}</h3>

                    <div className="gf-form">
                        <InlineFormLabel className="width-12" tooltip={localeData[currentLang]['alerting.emailAddrTips']}>{localeData[currentLang]['common.addresses']}</InlineFormLabel>
                        <Input.TextArea  className="gf-form-input max-width-15" defaultValue={props.notification.settings.addresses} onBlur={(e) => props.notification.settings.addresses = e.currentTarget.value} />
                    </div>
        </>
    )
}

export default EmailNotifier
import React,{ReactNode,useEffect} from 'react'

import { connect } from 'react-redux';
import {StoreState, CoreEvents} from 'src/types'  
import {ExclamationCircleOutlined} from '@ant-design/icons'
import { Modal } from 'antd';
import appEvents from '../library/utils/app_events';

interface Props {
}

const ModalService = (props:Props) =>{
    const [modal, contextHolder] = Modal.useModal();
    useEffect(() => {
        appEvents.on(CoreEvents.ShowConfirmModalEvent, ({title,text,onConfirm}) => {
            Modal.confirm(
                {
                    title: title,
                    icon: <ExclamationCircleOutlined translate/>,
                    content: text,
                    onOk() {
                        onConfirm()
                     }
                }
            )
        });
        appEvents.on(CoreEvents.ShowModalEvent, ({title,component,onConfirm}) => {
            Modal.info({
                title: title,
                content: component,
                onOk() {
                    onConfirm()
                }
            })
        });
        return () => {}
    }, [])
    
    return (
        <>
        </>
    )
}

export const mapStateToProps = (state: StoreState) => ({

});

export default connect(mapStateToProps)(ModalService);


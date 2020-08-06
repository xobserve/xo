import React,{ReactNode} from 'react'
import { ConfigProvider } from 'antd'
import { connect } from 'react-redux';
import zhCN from 'antd/es/locale/zh_CN'
import enGB from 'antd/es/locale/en_GB'
import {StoreState} from 'src/types'  

interface Props {
    locale: string,
    children: ReactNode
}

const Config = (props:Props) =>{
    return (
        <>
            <ConfigProvider locale={props.locale==='zh_CN' ? zhCN : enGB}>
                {props.children}
            </ConfigProvider>
        </>
    )
}

export const mapStateToProps = (state: StoreState) => ({
    locale: state.application.locale    
});

export default connect(mapStateToProps)(Config);
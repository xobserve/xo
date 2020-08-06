import React,{ReactNode} from 'react'

import { IntlProvider } from 'react-intl' /* react-intl imports */
import { connect } from 'react-redux';

import {StoreState} from 'src/types'  
import locale from 'src/core/library/locale'

interface Props {
    locale: string,
    children: ReactNode
}
const Intl = (props: Props) =>{
    let messages = locale
    return (
        <>
            <IntlProvider locale={props.locale.split('_')[0]} messages={messages[props.locale]}>
                {props.children}
            </IntlProvider>
        </>
    )
}

export const mapStateToProps = (state: StoreState) => ({
    locale: state.application.locale    
});

export default connect(mapStateToProps)(Intl);
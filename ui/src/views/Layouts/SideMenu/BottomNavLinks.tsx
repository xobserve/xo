/*eslint-disable*/

import React,{useState} from 'react';
import _ from 'lodash'
import { css } from 'emotion';
import { connect } from 'react-redux'
import { useLocation } from 'react-router-dom'
import classNames from 'classnames'

import { User } from 'src/core/services/context';
import { ThemeType, setCurrentTheme, getBootConfig } from 'src/packages/datav-core/src';
import { Icon1 as Icon, IconName} from 'src/packages/datav-core/src/ui';
import { getFooterLinks } from '../Footer/Footer';
// import appEvents from 'src/core/library/utils/app_events';
// import { CoreEvents } from 'src/types';
import { Link } from 'react-router-dom'
import { logout } from 'src/core/library/utils/user';
import { store } from 'src/store/store';
import { Langs } from 'src/core/library/locale/types';
import { updateLocale, updateTheme } from 'src/store/reducers/application';
import { StoreState ,MenuItem, hasPermission} from 'src/types'
import { FormattedMessage as Message } from 'react-intl'
import {Modal,Row,Col} from 'antd'

export interface Props {
  link: MenuItem;
  user: User;
  locale: string
  theme: string
}


export const BottomNavLinks = (props:Props) => {
    const [keyModalVisible,setKeyModalVisible] = useState(false)
    const onOpenShortcuts = () => {
      setKeyModalVisible(true)
    };
    const location = useLocation()
    const { link } = props;
    
    const subMenuIconClassName = css`
      margin-right: 8px;
    `;

    const userRole = store.getState().user.role
    let children = []
    if (link.children) {
      children = link.children.filter((child) => {
         if (child.needRole && !hasPermission(userRole,child.needRole)) {
           return false
         }

         return true
      })  
    }
   

    if (link.id === 'datav-fix-menu-help') {
      children = getFooterLinks();
    }

    let renderLink: any
    if (link.redirectTo) {
      renderLink = 
      <Link to={link.redirectTo} className="sidemenu-link">
        <span className="icon-circle sidemenu-icon">
          {link.icon && <Icon name={link.icon as IconName} size="xl" />}
        </span>
      </Link>
    } else {
      link.redirectTo === null
        ?
        renderLink = 
        <span className="sidemenu-link">
          <span className="icon-circle sidemenu-icon">
            {link.icon && <Icon name={link.icon as IconName} size="xl" />}
          </span>
        </span>
        :
        renderLink = 
        <Link to={link.url} className="sidemenu-link">
          <span className="icon-circle sidemenu-icon">
            {link.icon && <Icon name={link.icon as IconName} size="xl" />}
          </span>
        </Link>
    }

    const menuItemSelected = _.startsWith(location.pathname, link.url)
    const classes = classNames({
      'sidemenu-item': true,
      'sidemenu-item-selected': menuItemSelected,
      'dropdown': true,
      'dropup': true
    })

    return (
      <>
      <div className={classes}>
        {renderLink}
        <ul className="dropdown-menu dropdown-menu--sidemenu" role="menu">
          {link.id === 'datav-fix-menu-user' && (
            <li key="change-theme">
              <a onClick={() => {
                if (props.theme === ThemeType.Light) {
                  store.dispatch(updateTheme(ThemeType.Dark))
                  setCurrentTheme(ThemeType.Dark)
                  return
                }
                store.dispatch(updateTheme(ThemeType.Light))
                setCurrentTheme(ThemeType.Light)
              }}>
                <Message id={'common.currentTheme'}/> - {props.theme === ThemeType.Light ? <Icon name="sun" className={subMenuIconClassName} /> : <Icon name="moon" className={subMenuIconClassName} />}
              </a>
            </li>
          )}

          {link.id === 'datav-fix-menu-user' && getBootConfig().common.enableMultiLang &&(
            <li key="change-lang">
              <a onClick={() => {
                store.dispatch(updateLocale())
                window.location.reload()
              }}>
                {props.locale === Langs.Chinese ? '当前语言-中文' : 'Current Lang - Enlgish'}
              </a>
            </li>
          )}

              
          {link.id !== 'datav-fix-menu-help' && children.map((child:MenuItem, index) => {
            const subMenuItemSelected = _.startsWith(location.pathname, child.url)
            const  subMenuItemClasses = classNames({
              'sidemenu-dropdown-item-selected' : subMenuItemSelected
            }) 
            return (
              <li key={`${child.text}-${index}`} className={subMenuItemClasses}>
                {
                  child.redirectTo ?      
                  <Link to={child.redirectTo} rel="noopener">
                    {/* {child.icon && <Icon name={child.icon as IconName} className={subMenuIconClassName} />} */}
                    {child.text}
                  </Link> :
                     <Link to={child.url} rel="noopener">
                     {/* {child.icon && <Icon name={child.icon as IconName} className={subMenuIconClassName} />} */}
                     {child.text}
                   </Link>
                }
           
              </li>
            );
          })}

          {link.id === 'datav-fix-menu-help' && children.map((child:MenuItem, index) => {
            return (
              <li key={`${child.text}-${index}`} >
                     <a href={child.url} rel="noopener" target="_blank">
                     {/* {child.icon && <Icon name={child.icon as IconName} className={subMenuIconClassName} />} */}
                     {child.text}
                   </a>
              </li>
            );
          })}

          {link.id === 'datav-fix-menu-user' && (
            <li key="signout">
              <a onClick={logout}>
                {/* <Icon name="keyboard" className={subMenuIconClassName} />  */}
                <Message id={'common.logout'} />
              </a>
            </li>
          )}

          {link.id === 'datav-fix-menu-help' && (
            <li key="keyboard-shortcuts">
              <a onClick={() => onOpenShortcuts()}>
                {/* <Icon name="keyboard" className={subMenuIconClassName} />  */}
                <Message id={'common.shortcuts'} />
              </a>
            </li>
          )}

          <li className="side-menu-header">
            <span className="sidemenu-item-text">{link.text}</span>
          </li>
        </ul>
      </div>
          
      <Modal
          visible={keyModalVisible}
          title={<Message id="keybinding.shortcuts"/>}
          onOk={() => setKeyModalVisible(false)}
          onCancel={() => setKeyModalVisible(false)}
          footer={null}
          width={600}
        >
          <Row>
            <Col span="12">
              <div><Message id="common.global"/></div>
              <Shortcut value={['g','h']} desc={<Message id="keybinding.gh"/>}></Shortcut>
              <Shortcut value={['g','p']} desc={<Message id="keybinding.gp"/>}></Shortcut>
              <Shortcut value={['g','t']} desc={<Message id="keybinding.gt"/>}></Shortcut>
              <Shortcut value={['g','u']} desc={<Message id="keybinding.gu"/>}></Shortcut>
              <Shortcut value={['o','s']} desc={<Message id="keybinding.os"/>}></Shortcut>
              <Shortcut value={['esc']} desc={<Message id="keybinding.esc"/>}></Shortcut>
            </Col>

            <Col span="12">
              <div><Message id="common.dashboard"/></div>
              <Shortcut value={['cmd','s']} desc={<Message id="keybinding.sd"/>}></Shortcut>
              <Shortcut value={['e']} desc={<Message id="keybinding.e"/>}></Shortcut>
              <Shortcut value={['v']} desc={<Message id="keybinding.v"/>}></Shortcut>
              <Shortcut value={['i']} desc={<Message id="keybinding.i"/>}></Shortcut>
              <Shortcut value={['d s']} desc={<Message id="keybinding.s"/>}></Shortcut>
            </Col>
          </Row>
        </Modal>

      </>
    );
}

const Shortcut = (props) => {
  return (
    <div className="shortcut">
      {
        props.value.map((k) => <span className="shortcut-table-key" key={k}>{k}</span>)
      }
      <span className="shortcut-table-description">{props.desc}</span>
    </div>
  )
}

export const mapStateToProps = (state: StoreState) => ({
  locale: state.application.locale,
  theme: state.application.theme
});

export default connect(mapStateToProps)(BottomNavLinks);
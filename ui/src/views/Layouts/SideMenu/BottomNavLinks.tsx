/*eslint-disable*/

import React,{useState} from 'react';
import _ from 'lodash'
import { css } from 'emotion';
import { connect } from 'react-redux'
import { useLocation } from 'react-router-dom'
import classNames from 'classnames'

import { User } from 'src/core/services/context';
import { Icon, IconName, ThemeType, setCurrentTheme } from 'src/packages/datav-core';

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
          {/* {link.title && (
            <li className="sidemenu-subtitle">
              <span className="sidemenu-item-text">{link.title}</span>
            </li>
          )} */}

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

          {link.id === 'datav-fix-menu-user' && (
            <li key="change-lang">
              <a onClick={() => {
                store.dispatch(updateLocale())
              }}>
                {props.locale === Langs.Chinese ? '当前语言-中文' : 'Current Lang - Enlgish'}
              </a>
            </li>
          )}


          {children.map((child, index) => {
            const subMenuItemSelected = _.startsWith(location.pathname, child.url)
            const  subMenuItemClasses = classNames({
              'sidemenu-dropdown-item-selected' : subMenuItemSelected
            }) 
            return (
              <li key={`${child.title}-${index}`} className={subMenuItemClasses}>
                {
                  child.redirectTo ?      
                  <Link to={child.redirectTo} rel="noopener">
                    {/* {child.icon && <Icon name={child.icon as IconName} className={subMenuIconClassName} />} */}
                    {child.title}
                  </Link> :
                     <Link to={child.url} rel="noopener">
                     {/* {child.icon && <Icon name={child.icon as IconName} className={subMenuIconClassName} />} */}
                     {child.title}
                   </Link>
                }
           
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
            <span className="sidemenu-item-text">{link.title}</span>
          </li>
        </ul>
      </div>
          
      <Modal
          visible={keyModalVisible}
          title="Keyboard shortcuts"
          onOk={() => setKeyModalVisible(false)}
          onCancel={() => setKeyModalVisible(false)}
          footer={null}
          width={600}
        >
          <Row>
            <Col span="12">
              <div>Global</div>
              <Shortcut value={['g','h']} desc="Go to Home Dashboard"></Shortcut>
              <Shortcut value={['g','p']} desc="Go to Plugins Page"></Shortcut>
              <Shortcut value={['g','t']} desc="Go to Teams Page"></Shortcut>
              <Shortcut value={['g','u']} desc="Go to Users Page"></Shortcut>
              <Shortcut value={['o','s']} desc="Open search"></Shortcut>
              <Shortcut value={['esc']} desc="Exist editing,viewing,search etc"></Shortcut>
            </Col>

            <Col span="12">
              <div>Dashboard</div>
              <Shortcut value={['cmd','s']} desc="Save dashboard"></Shortcut>
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
        props.value.map((k) => <span className="shortcut-table-key">{k}</span>)
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
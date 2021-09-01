import React from 'react';
import _ from 'lodash';
import BottomNavLinks from './BottomNavLinks';
import { contextSrv } from 'src/core/services/context';
import { MenuItem, MenuPosition, hasPermission} from 'src/types';
import {store} from 'src/store/store'
import { FormattedMessage as Message } from 'react-intl';
import TopSectionItem from './TopSectionItem';
import { currentLang, getLocationSrv, localeData } from 'src/packages/datav-core/src';


export default function BottomSection() {
  const menuItems = store.getState().menu.items
  const userRole = store.getState().user.role
  const bottomNav: MenuItem[] = _.filter(menuItems, item => { 
    if (item.showPosition !== MenuPosition.Bottom) {
      return false
    }
    
    if ((item.needRole && !hasPermission(userRole,item.needRole))) {
      return false
    }
    
    return true
  });
  // const isSignedIn = contextSrv.isSignedIn;
    
  const searchLink:MenuItem= {
    text: <Message id={'common.search'}/> as any,
    icon: 'search',
    url: ''
  };

  const onOpenSearch = () => {
    getLocationSrv().update({ query: { search: 'open' }, partial: true });
  };
  
  return (
    <div className="sidemenu__bottom">
       <TopSectionItem link={searchLink} onClick={onOpenSearch} />
      {bottomNav.map((link, index) => {
        if (link.id === "datav-fix-menu-user") {
          link.text = localeData[currentLang]['user.currentUser'] + " - " + (store.getState().user.name == '' ? store.getState().user.username : store.getState().user.username + ' / ' + store.getState().user.name)
        } 
        return <BottomNavLinks link={link} user={contextSrv.user} key={`${link.url}-${index}`} />;
      })}
    </div>
  );
}

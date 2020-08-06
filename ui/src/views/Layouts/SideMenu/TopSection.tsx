import React  from 'react';
import _ from 'lodash';
import TopSectionItem from './TopSectionItem';
import { MenuItem, MenuPosition ,hasPermission} from 'src/types';
import { getLocationSrv } from 'src/packages/datav-core/src';
import {store} from 'src/store/store'
import { FormattedMessage as Message } from 'react-intl';


const TopSection = () => {
  const menuItems = store.getState().menu.items
  const userRole = store.getState().user.role
  
  const mainLinks =  _.filter(menuItems, item => { 
    if (item.showPosition !== MenuPosition.Top) {
      return false
    }
    
    if ((item.needRole && !hasPermission(userRole,item.needRole))) {
      return false
    }
    
    return true
  });
  const searchLink:MenuItem= {
    title: <Message id={'common.search'}/>,
    icon: 'search',
    url: ''
  };

  const onOpenSearch = () => {
    getLocationSrv().update({ query: { search: 'open' }, partial: true });
  };

  return (
    <div className="sidemenu__top">
      {mainLinks.map((link) => {
        return <TopSectionItem link={link} key={link.url} />;
      })}
      <TopSectionItem link={searchLink} onClick={onOpenSearch} />
    </div>
  );
};

export default TopSection;

import React  from 'react';
import _ from 'lodash';
import TopSectionItem from './TopSectionItem';
import { MenuPosition ,hasPermission} from 'src/types';
import {store} from 'src/store/store'


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

  return (
    <div className="sidemenu__top">
      {mainLinks.map((link) => {
        return <TopSectionItem link={link} key={link.url} />;
      })}
    </div>
  );
};

export default TopSection;

import React, { FC, memo } from 'react';
import { StoreState } from 'src/types';
import { DashboardSearch } from './DashboardSearch';
import { connect } from 'react-redux';
import {store} from 'src/store/store'
import { updateLocation } from 'src/store/reducers/location';
interface Props {
  search?: string | null;
  folder?: string;
  queryText?: string;
  filter?: string;
}



export const SearchWrapper: FC<Props> = memo(({ search, folder}) => {
  const isOpen = search === 'open';

  const closeSearch = () => {
    if (search === 'open') {
      store.dispatch(updateLocation({
        query: {
          search: null,
          folder: null,
        },
        partial: true,
      }))
    }
  };

  return isOpen ? <DashboardSearch onCloseSearch={closeSearch} folder={folder} /> : null;
});

const mapStateToProps = (state: StoreState) => {
  return {
      search: state.location.query.search ,
      folder: state.location.query.folder
  }
};

export default connect(mapStateToProps)(SearchWrapper);



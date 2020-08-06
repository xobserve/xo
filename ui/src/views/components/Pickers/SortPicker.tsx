import React, { FC } from 'react';
import { AsyncSelect, Icon ,SelectableValue} from 'src/packages/datav-core';
import { DEFAULT_SORT } from 'src/views/search/constants';
import { SearchSrv } from 'src/core/services/search';

const searchSrv = new SearchSrv();

export interface Props {
  onChange: (sortValue: SelectableValue) => void;
  value?: SelectableValue | null;
  placeholder?: string;
}

const getSortOptions = () => {
  return searchSrv.getSortOptions().then(({ sortOptions }) => {
    return sortOptions.map((opt: any) => ({ label: opt.displayName, value: opt.name }));
  });
};

export const SortPicker: FC<Props> = ({ onChange, value, placeholder }) => {
  return (
    <AsyncSelect
      width={25}
      onChange={onChange}
      value={[value]}
      loadOptions={getSortOptions}
      defaultOptions
      placeholder={placeholder ?? `Sort (Default ${DEFAULT_SORT.label})`}
      prefix={<Icon name="sort-amount-down" />}
    />
  );
};

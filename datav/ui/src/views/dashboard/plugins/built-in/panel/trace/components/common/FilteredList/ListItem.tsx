// Copyright (c) 2019 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as React from 'react';
import { Checkbox } from 'antd';
import cx from 'classnames';
import { ListChildComponentProps } from 'react-window';

import highlightMatches from './highlightMatches';

import './ListItem.css';

interface IListItemProps extends ListChildComponentProps {
  data: {
    addValues?: (values: string[]) => void;
    focusedIndex: number | null;
    highlightQuery: string;
    multi?: boolean;
    options: string[];
    removeValues?: (values: string[]) => void;
    selectedValue: Set<string> | string | null;
    setValue: (value: string) => void;
  };
}

export default class ListItem extends React.PureComponent<IListItemProps> {
  isSelected = () => {
    const { data, index } = this.props;
    const { options, selectedValue } = data;
    const isSelected =
      typeof selectedValue === 'string' || !selectedValue
        ? options[index] === selectedValue
        : selectedValue.has(options[index]);
    return isSelected;
  };

  onClicked = () => {
    const { data, index } = this.props;
    const { addValues, multi, options, removeValues, setValue } = data;
    const value = options[index];
    if (multi && addValues && removeValues) {
      if (this.isSelected()) removeValues([value]);
      else addValues([value]);
    } else setValue(value);
  };

  render() {
    const { data, index, style: styleOrig } = this.props;
    // omit the width from the style so the panel can scroll horizontally
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { width: _, ...style } = styleOrig;
    const { focusedIndex, highlightQuery, multi, options } = data;
    const isSelected = this.isSelected();
    const cls = cx('FilteredList--ListItem', {
      'is-focused': index === focusedIndex,
      'is-selected': isSelected,
      'is-striped': index % 2,
    });
    return (
      <div
        className={cls}
        style={style}
        onClick={this.onClicked}
        role="switch"
        aria-checked={index === focusedIndex ? 'true' : 'false'}
      >
        {multi && <Checkbox className="FilteredList--ListItem--Checkbox" checked={isSelected} />}
        {highlightMatches(highlightQuery, options[index])}
      </div>
    );
  }
}

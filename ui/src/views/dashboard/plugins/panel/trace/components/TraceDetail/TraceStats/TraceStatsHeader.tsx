// Copyright (c) 2020 The Jaeger Authors.
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

import { Checkbox } from 'antd';
import React, { Component } from 'react';
import { Trace } from 'types/plugins/trace';
import { ITableSpan } from './types';
import { generateDropdownValue, generateSecondDropdownValue } from './generateDropdownValue';
import { getColumnValues, getColumnValuesSecondDropdown } from './tableValues';

import generateColor from './generateColor';
import NameSelector from '../../common/NameSelector';
import { Box } from '@chakra-ui/react';

type Props = {
  trace: Trace;
  tableValue: ITableSpan[];
  wholeTable: ITableSpan[];
  handler: (
    tableValue: ITableSpan[],
    wholeTable: ITableSpan[],
    valueNameSelector1: string,
    valueNameSelector2: string | null
  ) => void;
};

type State = {
  valueNameSelector1: string;
  valueNameSelector2: string | null;
  valueNameSelector3: string;

  checkboxStatus: boolean;
};

const optionsNameSelector3 = new Map([
  ['Count', 'count'],
  ['Total', 'total'],
  ['Avg', 'avg'],
  ['Min', 'min'],
  ['Max', 'max'],
  ['ST Total', 'selfTotal'],
  ['ST Avg', 'selfAvg'],
  ['ST Min', 'selfMin'],
  ['ST Max', 'selfMax'],
  ['ST in Duration', 'percent'],
]);

export default class TraceStatisticsHeader extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.props.handler(
      getColumnValues('Service Name', this.props.trace),
      getColumnValues('Service Name', this.props.trace),
      'Service Name',
      null
    );

    this.state = {
      valueNameSelector1: 'Service Name',
      valueNameSelector2: null,
      valueNameSelector3: 'Count',
      checkboxStatus: false,
    };
    this.setValueNameSelector1 = this.setValueNameSelector1.bind(this);
    this.setValueNameSelector2 = this.setValueNameSelector2.bind(this);
    this.setValueNameSelector3 = this.setValueNameSelector3.bind(this);
    this.checkboxButton = this.checkboxButton.bind(this);
    this.clearValue = this.clearValue.bind(this);
  }

  /**
   * Returns the value of optionsNameSelector3.
   */
  getValue() {
    let toColor = optionsNameSelector3.get(this.state.valueNameSelector3);
    if (toColor === undefined) {
      toColor = '';
    }
    return toColor;
  }

  /**
   * Is called after a value from the first dropdown is selected.
   */
  setValueNameSelector1(value: string) {
    this.setState({
      valueNameSelector1: value,
      valueNameSelector2: null,
    });
    const newTableValue = generateColor(
      getColumnValues(value, this.props.trace),
      this.getValue(),
      this.state.checkboxStatus
    );
    const newWohleTable = generateColor(
      getColumnValues(value, this.props.trace),
      this.getValue(),
      this.state.checkboxStatus
    );
    this.props.handler(newTableValue, newWohleTable, value, null);
  }

  /**
   * Is called after a value from the second dropdown is selected.
   */
  setValueNameSelector2(value: string) {
    this.setState({
      valueNameSelector2: value,
    });
    const newTableValue = generateColor(
      getColumnValuesSecondDropdown(
        this.props.tableValue,
        this.state.valueNameSelector1,
        value,
        this.props.trace
      ),
      this.getValue(),
      this.state.checkboxStatus
    );
    const newWohleTable = generateColor(
      getColumnValuesSecondDropdown(
        this.props.wholeTable,
        this.state.valueNameSelector1,
        value,
        this.props.trace
      ),
      this.getValue(),
      this.state.checkboxStatus
    );
    this.props.handler(newTableValue, newWohleTable, this.state.valueNameSelector1, value);
  }

  /**
   * Is called after a value from the third dropdown is selected.
   */
  setValueNameSelector3(value: string) {
    this.setState({
      valueNameSelector3: value,
    });

    let toColor = optionsNameSelector3.get(value);
    if (toColor === undefined) {
      toColor = '';
    }
    const newTableValue = generateColor(this.props.tableValue, toColor, this.state.checkboxStatus);
    const newWohleTable = generateColor(this.props.wholeTable, toColor, this.state.checkboxStatus);
    this.props.handler(
      newTableValue,
      newWohleTable,
      this.state.valueNameSelector1,
      this.state.valueNameSelector2
    );
  }

  /**
   * Is called after the checkbox changes its status.
   */
  checkboxButton(e: any) {
    this.setState({
      checkboxStatus: e.target.checked,
    });

    const newTableValue = generateColor(this.props.tableValue, this.getValue(), e.target.checked);
    const newWholeTable = generateColor(this.props.wholeTable, this.getValue(), e.target.checked);
    this.props.handler(
      newTableValue,
      newWholeTable,
      this.state.valueNameSelector1,
      this.state.valueNameSelector2
    );
  }

  /**
   * Sets the second dropdown to "No Item selected" and sets the table to the values after the first dropdown.
   */
  clearValue() {
    this.setState({
      valueNameSelector2: null,
    });

    const newTableValue = generateColor(
      getColumnValues(this.state.valueNameSelector1, this.props.trace),
      this.getValue(),
      this.state.checkboxStatus
    );
    const newWholeTable = generateColor(
      getColumnValues(this.state.valueNameSelector1, this.props.trace),
      this.getValue(),
      this.state.checkboxStatus
    );
    this.props.handler(newTableValue, newWholeTable, this.state.valueNameSelector1, null);
  }

  render() {
    const optionsNameSelector1 = generateDropdownValue(this.props.trace);
    const optionsNameSelector2 = generateSecondDropdownValue(
      this.props.wholeTable,
      this.props.trace,
      this.state.valueNameSelector1
    );

    return (
      <Box className="TraceStatisticsHeader" py="3">
        <NameSelector
          label="Group By"
          placeholder={false}
          options={optionsNameSelector1}
          value={this.state.valueNameSelector1}
          setValue={this.setValueNameSelector1}
          required
        />
        <NameSelector
          label="Sub-Group"
          placeholder="No item selected"
          options={optionsNameSelector2}
          value={this.state.valueNameSelector2}
          setValue={this.setValueNameSelector2}
          clearValue={this.clearValue}
          required={false}
        />
        <div className="colorDropdown--TraceStatisticsHeader">
          <NameSelector
            label="Color by"
            placeholder={false}
            options={Array.from(optionsNameSelector3.keys())}
            value={this.state.valueNameSelector3}
            setValue={this.setValueNameSelector3}
            required
          />
        </div>
        <div className="checkbox--TraceStatisticsHeader">
          <Checkbox onChange={this.checkboxButton} />
        </div>
      </Box>
    );
  }
}

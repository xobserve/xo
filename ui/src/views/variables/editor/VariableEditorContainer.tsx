import React, { MouseEvent, PureComponent } from 'react';
import { Icon } from 'src/packages/datav-core';


import { NEW_VARIABLE_ID, toVariableIdentifier, toVariablePayload, VariableIdentifier } from '../state/types';
import { StoreState, GlobalVariableUid } from '../../../types';
import { VariableEditorList } from './VariableEditorList';
import { VariableEditorEditor } from './VariableEditorEditor';
import { MapDispatchToProps, MapStateToProps } from 'react-redux';
import { connectWithStore } from 'src/core/library/utils/connectWithReduxStore';
import { getVariables } from '../state/selectors';
import { VariableModel } from 'src/types';
import { switchToEditMode, switchToListMode, switchToNewMode } from './actions';
import { changeVariableOrder, duplicateVariable, removeVariable } from '../state/sharedReducer';
import { Button } from 'antd';
import { FormattedMessage } from 'react-intl';
import { DashboardModel } from 'src/views/dashboard/model';

interface OwnProps {
  dashboard: DashboardModel
}

interface ConnectedProps {
  idInEditor: string | null;
  variables: VariableModel[];
}

interface DispatchProps {
  changeVariableOrder: typeof changeVariableOrder;
  duplicateVariable: typeof duplicateVariable;
  removeVariable: typeof removeVariable;
  switchToNewMode: typeof switchToNewMode;
  switchToEditMode: typeof switchToEditMode;
  switchToListMode: typeof switchToListMode;
}

type Props = OwnProps & ConnectedProps & DispatchProps;

class VariableEditorContainerUnconnected extends PureComponent<Props> {
  componentDidMount(): void {
    this.props.switchToListMode();
  }

  onChangeToListMode = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    this.props.switchToListMode();
  };

  onEditVariable = (identifier: VariableIdentifier) => {
    this.props.switchToEditMode(identifier);
  };

  onNewVariable = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    this.props.switchToNewMode();
  };

  onChangeVariableOrder = (identifier: VariableIdentifier, fromIndex: number, toIndex: number) => {
    this.props.changeVariableOrder(toVariablePayload(identifier, { fromIndex, toIndex }));
  };

  onDuplicateVariable = (identifier: VariableIdentifier) => {
    this.props.duplicateVariable(toVariablePayload(identifier, { newId: (undefined as unknown) as string }));
  };

  onRemoveVariable = (identifier: VariableIdentifier) => {
    this.props.removeVariable(toVariablePayload(identifier, { reIndex: true }));
  };

  render() {
    const variableToEdit = this.props.variables.find(s => s.id === this.props.idInEditor) ?? null;
    return (
      <div>
        <div className="page-action-bar">
          <h3 className="dashboard-settings__header">
            <a
              onClick={this.onChangeToListMode}
            >
              <FormattedMessage id="dashboard.variable" />
            </a>
            {this.props.idInEditor === NEW_VARIABLE_ID && (
              <span>
                <Icon
                  name="angle-right"
                />
                <FormattedMessage id="common.new" />
              </span>
            )}
            {this.props.idInEditor && this.props.idInEditor !== NEW_VARIABLE_ID && (
              <span>
                <Icon
                  name="angle-right"
                />
                <FormattedMessage id="common.edit" />
              </span>
            )}
          </h3>

          <div className="page-action-bar__spacer" />
          {this.props.variables.length > 0 && variableToEdit === null && (
            <Button
              onClick={this.onNewVariable}
            >
              <FormattedMessage id="common.new" />
            </Button>
          )}
        </div>

        {!variableToEdit && (
          <VariableEditorList
            dashboard={this.props.dashboard}
            variables={this.props.variables}
            onAddClick={this.onNewVariable}
            onEditClick={this.onEditVariable}
            onChangeVariableOrder={this.onChangeVariableOrder}
            onDuplicateVariable={this.onDuplicateVariable}
            onRemoveVariable={this.onRemoveVariable}
          />
        )}
        {variableToEdit && <VariableEditorEditor identifier={toVariableIdentifier(variableToEdit)} />}
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<ConnectedProps, OwnProps, StoreState> = (state,props) => {
  let variables = getVariables(state, true)
  variables = variables.filter(variable => {
    // dont render global variables in common dashboards
    if (props.dashboard.uid !== GlobalVariableUid) {
      if (variable.global) {
        return false
      }
    }
    return true
  })
  return {
    variables: variables,
    idInEditor: state.templating.editor.id,
  }
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = {
  changeVariableOrder,
  duplicateVariable,
  removeVariable,
  switchToNewMode,
  switchToEditMode,
  switchToListMode,
};

export const VariableEditorContainer = connectWithStore(
  VariableEditorContainerUnconnected,
  mapStateToProps,
  mapDispatchToProps
);

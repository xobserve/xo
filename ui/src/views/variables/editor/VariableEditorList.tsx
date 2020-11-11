import React, { MouseEvent, PureComponent } from 'react';
import { IconButton } from 'src/packages/datav-core/src';

import EmptyListCTA from 'src/views/components/EmptyListCTA/EmptyListCTA';
import { QueryVariableModel, VariableModel,StoreState } from 'src/types';
import { toVariableIdentifier, VariableIdentifier } from '../state/types';
import { connect } from 'react-redux';
import { Langs } from 'src/core/library/locale/types';
import { DashboardModel } from 'src/views/dashboard/model';

export interface Props {
  dashboard: DashboardModel
  variables: VariableModel[];
  onAddClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  onEditClick: (identifier: VariableIdentifier) => void;
  onChangeVariableOrder: (identifier: VariableIdentifier, fromIndex: number, toIndex: number) => void;
  onDuplicateVariable: (identifier: VariableIdentifier) => void;
  onRemoveVariable: (identifier: VariableIdentifier) => void;
  locale?: string
}

enum MoveType {
  down = 1,
  up = -1,
}

export class VariableEditorList extends PureComponent<Props> {
  onEditClick = (event: MouseEvent, identifier: VariableIdentifier) => {
    event.preventDefault();
    this.props.onEditClick(identifier);
  };

  onChangeVariableOrder = (event: MouseEvent, variable: VariableModel, moveType: MoveType) => {
    event.preventDefault();
    this.props.onChangeVariableOrder(toVariableIdentifier(variable), variable.index!, variable.index! + moveType);
  };

  onDuplicateVariable = (event: MouseEvent, identifier: VariableIdentifier) => {
    event.preventDefault();
    this.props.onDuplicateVariable(identifier);
  };

  onRemoveVariable = (event: MouseEvent, identifier: VariableIdentifier) => {
    event.preventDefault();
    this.props.onRemoveVariable(identifier);
  };
  
  render() {
    let emptyList;
    if (this.props.locale === Langs.English) {
      emptyList = <EmptyListCTA
          title="There are no variables yet"
          buttonIcon="calculator-alt"
          buttonTitle="Add variable"
          infoBox={{
            __html: ` <p>
              Variables enable more interactive and dynamic dashboards. Instead of hard-coding things like server
              or sensor names in your metric queries you can use variables in their place. Variables are shown as
              dropdown select boxes at the top of the dashboard. These dropdowns make it easy to change the data
              being displayed in your dashboard. Check out the
              <a class="external-link" href="http://docs.grafana.org/reference/templating/" target="_blank">
                Templating documentation
              </a>
              for more information.
            </p>`,
          }}
          infoBoxTitle="What do variables do?"
          onClick={this.props.onAddClick}
        />
    } else {
      emptyList = <EmptyListCTA
          title="当前还没有创建任何变量"
          buttonIcon="calculator-alt"
          buttonTitle="创建新变量"
          infoBox={{
            __html: ` <p>
              有了变量后，我们的仪表盘将变得更加有交互性、更加动态。在以往，你只能把主机名、应用名等字段硬编码到查询语句中，这样你想要为每一个主机名
              都创建一条语句，有了变量后，你只要在查询语句中使用变量，然后在仪表盘中选择变量，就可以轻松切换主机、应用，一套查询语句就够了。
              详情参加
              <a class="external-link" href="http://docs.grafana.org/reference/templating/" target="_blank">
                模版变量文档
              </a>
            </p>`,
          }}
          infoBoxTitle="变量能做什么?"
          onClick={this.props.onAddClick}
        />
    }
    return (
      <div>
        <div>
          {this.props.variables.length === 0 && (
            <div>
              {emptyList}
            </div>
          )}

          {this.props.variables.length > 0 && (
            <div>
              <table
                className="filter-table filter-table--hover"
              >
                <thead>
                  <tr>
                    <th>Variable</th>
                    <th>Definition</th>
                    <th colSpan={5} />
                  </tr>
                </thead>
                <tbody>
                  {this.props.variables.map((state, index) => {
                    const variable = state as QueryVariableModel;

                    return (
                      <tr key={`${variable.name}-${index}`}>
                        <td style={{ width: '1%' }}>
                          <span
                            onClick={event => this.onEditClick(event, toVariableIdentifier(variable))}
                            className="pointer template-variable"
                          >
                            {variable.name}
                          </span>
                        </td>
                        <td
                          style={{ maxWidth: '200px' }}
                          onClick={event => this.onEditClick(event, toVariableIdentifier(variable))}
                          className="pointer max-width"
                        >
                          {variable.definition ? variable.definition : variable.query}
                        </td>

                        <td style={{ width: '1%' }}>
                          {index > 0 && (
                            <IconButton
                              onClick={event => this.onChangeVariableOrder(event, variable, MoveType.up)}
                              name="arrow-up"
                              title="Move variable up"
                            />
                          )}
                        </td>
                        <td style={{ width: '1%' }}>
                          {index < this.props.variables.length - 1 && (
                            <IconButton
                              onClick={event => this.onChangeVariableOrder(event, variable, MoveType.down)}
                              name="arrow-down"
                              title="Move variable down"
                            />
                          )}
                        </td>
                        <td style={{ width: '1%' }}>
                          <IconButton
                            onClick={event => this.onDuplicateVariable(event, toVariableIdentifier(variable))}
                            name="copy"
                            title="Duplicate variable"
                          />
                        </td>
                        <td style={{ width: '1%' }}>
                          <IconButton
                            onClick={event => this.onRemoveVariable(event, toVariableIdentifier(variable))}
                            name="trash-alt"
                            title="Remove variable"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export const mapStateToProps = (state: StoreState) => ({
  locale: state.application.locale
});


export default connect(mapStateToProps)(VariableEditorList);
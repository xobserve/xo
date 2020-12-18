import React, { PureComponent } from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { StoreState } from '../../../../types';
import { getVariables } from '../../../variables/state/selectors';
import { VariableHide, VariableModel } from 'src/types';
import { DashboardModel } from '../../model';
import { DashboardLinks } from './DashboardLinks';
import { Annotations } from './Annotations';
import { SubMenuItems } from './SubMenuItems';
import './SubMenu.less'

interface OwnProps {
  dashboard: DashboardModel;
}

interface ConnectedProps {
  variables: VariableModel[];
}

interface DispatchProps {}

type Props = OwnProps & ConnectedProps & DispatchProps;

class SubMenuUnConnected extends PureComponent<Props> {
  onAnnotationStateChanged = (updatedAnnotation: any) => {
    // we're mutating dashboard state directly here until annotations are in Redux.
    for (let index = 0; index < this.props.dashboard.annotations.list.length; index++) {
      const annotation = this.props.dashboard.annotations.list[index];
      if (annotation.name === updatedAnnotation.name) {
        annotation.enable = !annotation.enable;
        break;
      }
    }
    this.props.dashboard.startRefresh();
    this.forceUpdate();
  };

  isSubMenuVisible = () => {
    if (this.props.dashboard.links.length > 0) {
      return true;
    }

    const visibleVariables = this.props.variables.filter(variable => variable.hide !== VariableHide.hideVariable);
    if (visibleVariables.length > 0) {
      return true;
    }

    const visibleAnnotations = this.props.dashboard.annotations.list.filter(annotation => annotation.hide !== true);
    return visibleAnnotations.length > 0;
  };

  render() {
    const { dashboard, variables } = this.props;
    if (!this.isSubMenuVisible()) {
      return null;
    }

    // only show dashboard variables here
    const localVars: VariableModel[] = []
    const globalVars: VariableModel[] = []
    variables.forEach(v => {
      if (!v.global) {
        localVars.push(v)
      } else {
        globalVars.push(v)
      }
    })

    return (
      <div className="submenu-controls">
        <div><SubMenuItems variables={localVars} /></div>
        <div><SubMenuItems   variables={globalVars} /></div>
        {/* <Annotations annotations={dashboard.annotations.list} onAnnotationChanged={this.onAnnotationStateChanged} /> */}
        {/* <div className="gf-form gf-form--grow" />
        {dashboard && <DashboardLinks dashboard={dashboard} />}
        <div className="clearfix" /> */}
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<ConnectedProps, OwnProps, StoreState> = state => ({
  variables: getVariables(state, false),
});

export const SubMenu = connect(mapStateToProps)(SubMenuUnConnected);
SubMenu.displayName = 'SubMenu';

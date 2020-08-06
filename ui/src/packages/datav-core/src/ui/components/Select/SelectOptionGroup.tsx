import React, { PureComponent } from 'react';
import { GroupProps } from 'react-select';
import { Icon } from '../Icon/Icon';
 
interface ExtendedGroupProps extends GroupProps<any> {
  data: {
    label: string;
    expanded: boolean;
    options: any[];
  };
}

interface State {
  expanded: boolean;
}


class UnthemedSelectOptionGroup extends PureComponent<ExtendedGroupProps, State> {
  state = {
    expanded: false,
  };

  componentDidMount() {
    if (this.props.data.expanded) {
      this.setState({ expanded: true });
    } else if (this.props.selectProps && this.props.selectProps.value) {
      const { value } = this.props.selectProps.value;

      if (value && this.props.options.some(option => option.value === value)) {
        this.setState({ expanded: true });
      }
    }
  }

  componentDidUpdate(nextProps: ExtendedGroupProps) {
    if (nextProps.selectProps.inputValue !== '') {
      this.setState({ expanded: true });
    }
  }

  onToggleChildren = () => {
    this.setState(prevState => ({
      expanded: !prevState.expanded,
    }));
  };

  render() {
    const { children, label } = this.props;
    const { expanded } = this.state;
    return (
      <div>
        <div className={'select-option-group-header '} onClick={this.onToggleChildren}>
          <span className={'select-option-group-label'}>{label}</span>
          <Icon className={'select-option-group-icon'} name={expanded ? 'angle-left' : 'angle-down'} />{' '}
        </div>
        {expanded && children}
      </div>
    );
  }
}

export const SelectOptionGroup = UnthemedSelectOptionGroup

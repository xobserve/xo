import { PureComponent } from 'react';
import ReactDOM from 'react-dom';

export interface ClickOutsideProps {
  /**
   *  When clicking outside of current element
   */
  onClick: () => void;
  /**
   *  Runs the 'onClick' function when pressing a key outside of the current element. Defaults to true.
   */
  includeButtonPress: boolean;
  useCapture?: boolean;
}

interface State {
  hasEventListener: boolean;
}
  
export class ClickOutsideWrapper extends PureComponent<ClickOutsideProps, State> {
  static defaultProps = {
    includeButtonPress: true,
    parent: window,
    useCapture: false,
  };
  state = {
    hasEventListener: false,
  };

  componentDidMount() {
    window.addEventListener('click', this.onOutsideClick, this.props.useCapture);
    if (this.props.includeButtonPress) {
      // Use keyup since keydown already has an eventlistener on window
      window.addEventListener('keyup', this.onOutsideClick, this.props.useCapture);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.onOutsideClick, this.props.useCapture);
    if (this.props.includeButtonPress) {
      window.addEventListener('keyup', this.onOutsideClick, this.props.useCapture);
    }
  }

  onOutsideClick = (event: any) => {
    try {
      const node = ReactDOM.findDOMNode(this)
      if (!node) {
        return 
      }
      
      const domNode =  node as Element;
  
      if (!domNode || !domNode.contains(event.target)) {
        this.props.onClick();
      }
    } catch (error) {
      console.log("ClickOutsideWrapper", error.message)
    }
  };

  render() {
    return this.props.children;
  }
}

// Libraries
import React, { Component } from 'react';

// Components
// import { Footer } from './PageFooter';
import PageContents from './PageContent';
import { CustomScrollbar,NavModel} from 'src/packages/datav-core';
import { Footer } from '../Footer/Footer'; 
import appEvents from 'src/core/library/utils/app_events';
import PageHeader from './PageHeader'


interface Props {
  navModel: NavModel;
  children: JSX.Element[] | JSX.Element;
}

class Page extends Component<Props> {
  static Contents = PageContents;

  componentWillMount() {
    appEvents.emit("hide-layouts-header")
    // this.updateTitle();
  }
  componentWillUnmount() {
    appEvents.emit("show-layouts-header")
  }

  componentDidUpdate(prevProps: Props) {
    appEvents.emit("hide-layouts-header")
    // this.updateTitle();
  }

  // updateTitle = () => {
  //   const title = this.getPageTitle;
  //   document.title = title
  // };

  // get getPageTitle() {
  //   return undefined;
  // }

  render() {
    const { navModel} = this.props;
    return (
      <div className="page-scrollbar-wrapper">
        <CustomScrollbar autoHeightMin={'100%'} className="custom-scrollbar--page">
          <div className="page-scrollbar-content">
          <PageHeader model={navModel} />
            {this.props.children}
            <Footer />
          </div>
        </CustomScrollbar>
      </div>
    );
  }
}

export default Page;

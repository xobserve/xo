// Libraries
import React, { Component } from 'react';
// Components
import PageContents from './PageContent';
import { NavModel} from 'src/packages/datav-core/src';
import { Footer } from '../Footer/Footer'; 
import PageHeader from './PageHeader'
import { formatDocumentTitle } from 'src/core/library/utils/date';
import { CustomScrollbar } from 'src/packages/datav-core/src/ui';


interface Props {
  navModel: NavModel;
  children: JSX.Element[] | JSX.Element;
}

class Page extends Component<Props> {
  static Contents = PageContents;

  componentWillMount() {
    document.title = formatDocumentTitle(this.props.navModel.main.text)
  }
  componentWillUnmount() {
  }

  componentDidUpdate(prevProps: Props) {
  }


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

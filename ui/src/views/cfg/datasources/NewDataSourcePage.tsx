import React, { FC, PureComponent } from 'react';
import { DataSourcePluginMeta, NavModel, getBackendSrv} from 'src/packages/datav-core/src';
import { List,Button } from 'src/packages/datav-core/src/ui';
import Page from '../../Layouts/Page/Page';
import { DataSourcePluginCategory,StoreState } from 'src/types';
import { Card } from '../../components/Card/Card';
import {buildCategories} from './build_categories'
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import localeData from 'src/core/library/locale';
import { FormattedMessage } from 'react-intl';

export interface Props {
  history: any;
}

interface StoreProps {
  locale: string
}

interface State {
  plugins: DataSourcePluginMeta[];
  categories: DataSourcePluginCategory[];
}


class NewDataSourcePage extends PureComponent<Props & StoreProps,State> {
  constructor(props) {
    super(props)
    this.state = {
      plugins: [],
      categories: []
    }
  }
  componentDidMount() {
    this.loadDataSourcePlugins();
  }

  async loadDataSourcePlugins() {
    const res = await getBackendSrv().get('/api/plugins', {type: 'datasource' });
    const plugins = res.data
    const categories = buildCategories(plugins);
    this.setState({
      plugins,categories
    })
  }

  onDataSourceTypeClicked = (plugin: DataSourcePluginMeta) => {
     this.props.history.push('/datasources/edit/' + plugin.id)
  };


  renderPlugins(plugins: DataSourcePluginMeta[]) {
    if (!plugins || !plugins.length) {
      return null;
    }

    return (
      <List
        items={plugins}
        getItemKey={item => item.id.toString()}
        renderItem={item => (
          <DataSourceTypeCard
            plugin={item}
            onClick={() => this.onDataSourceTypeClicked(item)}
            onLearnMoreClick={this.onLearnMoreClick}
          />
        )}
      />
    );
  }

  onLearnMoreClick = (evt: React.SyntheticEvent<HTMLElement>) => {
    evt.stopPropagation();
  };

  renderCategories() {
    const { categories } = this.state;

    return (
      <>
        {categories.map(category => (
          category.plugins.length > 0 &&
          <div className="add-data-source-category" key={category.id}>
            <div className="add-data-source-category__header">{category.title}</div>
            {this.renderPlugins(category.plugins)}
          </div>
        ))}
      </>
    );
  }

  render() {
    const navModel = getNavModel(this.props.locale)
    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={this.state.plugins.length <= 0}>
          <div>
            {this.renderCategories()}
          </div>
        </Page.Contents>
      </Page>
    );
  }
}

interface DataSourceTypeCardProps {
  plugin: DataSourcePluginMeta;
  onClick: () => void;
  onLearnMoreClick: (evt: React.SyntheticEvent<HTMLElement>) => void;
}

const DataSourceTypeCard: FC<DataSourceTypeCardProps> = props => {
  const { plugin, onLearnMoreClick } = props;

  // find first plugin info link
  const learnMoreLink = plugin.info.links && plugin.info.links.length > 0 ? plugin.info.links[0] : null;

  return (
    <Card
      title={plugin.name}
      description={plugin.info.description}
      logoUrl={plugin.info.logos.small}
      actions={
        <>
          {learnMoreLink && (
            <a
              href={`${learnMoreLink.url}?utm_source=grafana_add_ds`}
              target="_blank"
              rel="noopener"
              onClick={onLearnMoreClick}
            >
              <FormattedMessage id="common.learnMore"/>
            </a>
          )}
           
          {<Button variant="secondary"><FormattedMessage id="common.select"/></Button>}
        </>
      }
      onClick={props.onClick}
    />
  );
};

export function getNavModel(locale: string): NavModel {
  const main = {
    icon: 'database',
    id: 'datasource-new',
    text: localeData[locale]['datasource.add'],
    href: 'datasources/new',
    subTitle: localeData[locale]['datasource.choose'],
  };

  return {
    main: main,
    node: main,
  };
}

export const mapStateToProps = (state: StoreState) => ({
  locale: state.application.locale
});



export default withRouter(connect(mapStateToProps)(NewDataSourcePage));

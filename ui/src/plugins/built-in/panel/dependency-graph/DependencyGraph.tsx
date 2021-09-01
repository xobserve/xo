import React, { PureComponent } from 'react';
import _, { find, map, isUndefined, remove, each, has } from 'lodash';
import { join, indexOf,cloneDeep, isArray} from 'lodash';
import { PanelProps, GrafanaTheme, getTemplateSrv, getHistory,DataFrame,TableData,Column} from 'src/packages/datav-core/src';
import {withTheme,Icon,stylesFactory} from 'src/packages/datav-core/src/ui';
import { DependencyGraphOptions, CurrentData, QueryResponse, TableContent, ISelectionStatistics, IGraphMetrics, IGraph, IGraphNode, CyData, IGraphEdge, FilterConditions, NodeFilterType } from './types';
import { css, cx } from 'emotion';
import { NodeSingular, EdgeSingular, EventObject, EdgeCollection } from 'cytoscape';

import './index.less'
import { PlayCircleOutlined, PauseCircleOutlined, ApartmentOutlined, AimOutlined, PlusOutlined, MinusOutlined ,LinkOutlined, FilterOutlined} from '@ant-design/icons';
import { Tooltip, Button } from 'antd';
import dummyData from "./dummyData";
import PreProcessor from './processing/preProcessor'
import GraphGenerator from './processing/graphGenerator'

import { initCytoscape, graphCanvas } from './cytoscape'
import {editOptions,rawOptions} from './layoutOptions'
import FilterPanel from './FilterPanel'
import {filterGraph} from './filterGraph'
import { store } from 'src/store/store';
import storage from 'src/core/library/utils/localStorage';
import { resetDashboardVariables } from 'src/views/dashboard/model/initDashboard';
import { connect } from 'react-redux';
import { interactive } from 'src/core/library/utils/interactive';

interface Props extends PanelProps<DependencyGraphOptions> {
  theme: GrafanaTheme
  resetDashboardVariables : typeof resetDashboardVariables
}
interface State {
  paused: boolean
  showStatistics: boolean
  graphData: IGraph
  filterConditions: FilterConditions
}

export let serviceIcons = [];
export class DependencyGraph extends PureComponent<Props, State> {
  validQueryTypes: boolean;
  currentData: CurrentData | undefined;
  preProcessor: PreProcessor = new PreProcessor(this);
  graphGenerator: GraphGenerator = new GraphGenerator(this);
  cy: cytoscape.Core;
  selectionId: string;
  receiving: TableContent[];
  sending: TableContent[];
  currentType: string;
  selectionStatistics: ISelectionStatistics;
  resolvedDrillDownLink: string;
  initResize: boolean = true;
  filterConditions: FilterConditions = storage.get('dependency-graph-filter') ?? {
    nodes: {
      type: NodeFilterType.ALL,
      names: []
    },
    conditions: [],
    store: false
  }

  constructor(props) {
    super(props)
    fetch(this.getAssetUrl('service_icons/icon_index.json'))
      .then(response => response.json())
      .then(data => {
        data.sort();
        serviceIcons = data;
        console.log("Load service icons:", serviceIcons)
      })
      .catch(() => {
        console.error('Could not load service icons mapping index. Please verify the "icon_index.json" in the plugin\'s asset directory.');
      });
  }

  componentWillMount() {
    this.setState({
      paused: false,
      showStatistics: false,
      graphData: null,
      filterConditions: null
    })
  }

  componentDidMount() {
    if (!this.cy) {
      initCytoscape(this)
    }
  }

  _updateGraph(graph: IGraph) {
    const cyNodes = this._transformNodes(graph.nodes);
    const cyEdges = this._transformEdges(graph.edges);

    console.groupCollapsed("Updating graph");
    console.log("cytoscape nodes: ", JSON.parse(JSON.stringify(cyNodes)));
    console.log("cytoscape edges: ", JSON.parse(JSON.stringify(cyEdges)));
    console.groupEnd();

    const nodes = this.cy.nodes().toArray();
    const updatedNodes = this._updateOrRemove(nodes, cyNodes);

    // add new nodes
    //@ts-ignore
    this.cy.add(cyNodes);

    const edges = this.cy.edges().toArray();
    this._updateOrRemove(edges, cyEdges);

    // add new edges
    //@ts-ignore
    this.cy.add(cyEdges);

    if (this.initResize) {
      this.initResize = false;
      this.cy.resize();
      this.cy.reset();
      this.runLayout();
    } else {
      if (cyNodes.length > 0) {
        each(updatedNodes, node => {
          //@ts-ignore
          node.lock();
        });
        this.runLayout(true);
      }
    }
  }

  runLayout(unlockNodes: boolean = false) {
    const that = this;
    
    let layout = _.extend(editOptions,rawOptions)
    if (this.props.options.layoutSetting) {
      layout = _.extend(JSON.parse(this.props.options.layoutSetting),rawOptions)
    }

    const options = {
      ...layout,
      stop: function () {
        if (unlockNodes) {
          that.unlockNodes();
        }
      }
    };

    this.cy.layout(options).run()
  }

  unlockNodes() {
    this.cy.nodes().forEach(node => {
      node.unlock();
    });
  }


  _transformEdges(edges: IGraphEdge[]): CyData[] {
    const cyEdges = map(edges, edge => {
      const cyEdge = {
        group: 'edges',
        data: {
          id: edge.source + ":" + edge.target,
          source: edge.source,
          target: edge.target,
          metrics: {
            ...edge.metrics
          }
        }
      };

      return cyEdge;
    });

    return cyEdges;
  }

  _transformNodes(nodes: IGraphNode[]): CyData[] {
    const cyNodes = map(nodes, node => {
      const result: CyData = {
        group: 'nodes',
        data: {
          id: node.name,
          type: node.type,
          metrics: {
            ...node.metrics
          }
        }
      };
      return result;
    });

    return cyNodes;
  }

  _updateOrRemove(dataArray: (NodeSingular | EdgeSingular)[], inputArray: CyData[]) {
    const elements: (NodeSingular | EdgeSingular)[] = [];
    for (let i = 0; i < dataArray.length; i++) {
      const element = dataArray[i];

      const cyNode = find(inputArray, { data: { id: element.id() } });

      if (cyNode) {
        element.data(cyNode.data);
        remove(inputArray, n => n.data.id === cyNode.data.id);
        elements.push(element);
      } else {
        element.remove();
      }
    }
    return elements;
  }

  isDataAvailable() {
    const dataExist = !isUndefined(this.currentData) && this.currentData.graph.length > 0;
    return dataExist;
  }

  processQueryData(data: QueryResponse[]) {
    this.validQueryTypes = this.hasOnlyTableQueries(data);

    if (this.validQueryTypes) {
      if (this.props.options.dataMapping !== undefined) {
        const graphData = this.preProcessor.processData(data);

        console.groupCollapsed('Processed received data');
        console.log('raw data: ', data);
        console.log('graph data: ', graphData);
        console.groupEnd();
  
        this.currentData = graphData;
      }
    } else {
      this.currentData = undefined;
    }
  }

  hasOnlyTableQueries(inputData: QueryResponse[]) {
    var result: boolean = true;

    each(inputData, dataElement => {
      if (!has(dataElement, 'columns')) {
        result = false;
      }
    });

    return result;
  }



  onSelectionChange(event: EventObject) {
    const selection = this.cy.$(':selected');

    const isSelected = selection.length === 1
    if (isSelected) {
      this.updateStatisticTable();
    }

    console.log(this.resolvedDrillDownLink)

    this.setState({
      ...this.state,
      showStatistics: isSelected
    })
  }

  updateStatisticTable() {
    const selection = this.cy.$(':selected');

    if (selection.length === 1) {
      const currentNode: NodeSingular = selection[0];
      this.selectionId = currentNode.id();
      this.currentType = currentNode.data('type');
      const receiving: TableContent[] = [];
      const sending: TableContent[] = [];
      const edges: EdgeCollection = selection.connectedEdges();

      const metrics: IGraphMetrics = selection.nodes()[0].data('metrics');
      const requestCount = _.defaultTo(metrics.requests, -1);
      const errorCount = _.defaultTo(metrics.errors, -1);
      const duration = _.defaultTo(metrics.responseTime, -1);
      const threshold = _.defaultTo(metrics.threshold, -1);

      this.selectionStatistics = {};

      if (requestCount >= 0) {
        this.selectionStatistics.requests = Math.floor(requestCount);
      }
      if (errorCount >= 0) {
        this.selectionStatistics.errors = Math.floor(errorCount);
      }
      if (duration >= 0) {
        this.selectionStatistics.responseTime = Math.floor(duration);

        if (threshold >= 0) {
          this.selectionStatistics.threshold = Math.floor(threshold);
          this.selectionStatistics.thresholdViolation = duration > threshold;
        }
      }

      for (let i = 0; i < edges.length; i++) {

        const actualEdge: EdgeSingular = edges[i];
        const sendingCheck: boolean = actualEdge.source().id() === this.selectionId;
        let node: NodeSingular;

        if (sendingCheck) {
          node = actualEdge.target();
        }
        else {
          node = actualEdge.source()
        }

        const sendingObject: TableContent = {
          name: node.id(),
          responseTime: "-",
          rate: "-",
          error: "-"
        };

        const edgeMetrics: IGraphMetrics = actualEdge.data('metrics');
        const { responseTime, requests, errors } = edgeMetrics;

        if (requests != undefined) {
          sendingObject.rate = Math.floor(requests).toString();
        }
        if (responseTime != undefined) {
          sendingObject.responseTime = Math.floor(responseTime) + " ms";
        }
        if (errors != undefined && requests != undefined) {
          sendingObject.error = Math.floor(errors / (requests / 100)) + "%";
        }

        if (sendingCheck) {
          sending.push(sendingObject);
        } else {
          receiving.push(sendingObject);
        }
      }
      this.receiving = receiving;
      this.sending = sending;

      this.generateDrillDownLink();
    }
  }

  generateDrillDownLink() {
    const { drillDownLink } = this.props.options;
    const link = drillDownLink.replace('{}', this.selectionId);
    this.resolvedDrillDownLink = getTemplateSrv().replace(link);
    console.log(this.resolvedDrillDownLink)
  }

  getAssetUrl(assetName: string) {
    var baseUrl = '/plugins/panel/' + this.props.panel.type;
    return baseUrl + '/assets/' + assetName;
  }

  getTypeSymbol(type, resolveName = true) {
    if (!type) {
      return this.getAssetUrl('default.png');
    }

    if (!resolveName) {
      return this.getAssetUrl(type);
    }

    const { serviceIcons } = this.props.options;

    const icon = serviceIcons[type.toLowerCase()]

    return !icon ? this.getAssetUrl(icon.filename + '.png') : this.getAssetUrl('default.png')
  }

  toggleAnimation = () => {
    const paused = !this.state.paused
    this.setState({
      ...this.state,
      paused
    })

    if (!paused) {
      graphCanvas.startAnimation();
    } else {
      graphCanvas.stopAnimation();
    }
  }

  fit = () => {
    const selection = graphCanvas.selectionNeighborhood;
    if (selection && !selection.empty()) {
      this.cy.fit(selection, 30);
    } else {
      this.cy.fit();
    }
  }

  zoom = (zoom) => {
    const zoomStep = 0.25 * zoom;
    const zoomLevel = Math.max(0.1, this.cy.zoom() + zoomStep);
    this.cy.zoom(zoomLevel);
  }

  showFilterPanel = () => {
    const graph: IGraph = this.graphGenerator.generateGraph(this.currentData.graph);
     this.setState({
       ...this.state,
       graphData: graph,
       filterConditions: _.cloneDeep(this.filterConditions)
     })
  }

  closeFilterPanel = () => {
    this.setState({
      ...this.state,
      graphData: null,
      filterConditions: null
    })
  }

  onFilterChange = (conditions) => {
    const cons = _.cloneDeep(conditions)
    this.setState({
      ...this.state,
      filterConditions: cons
    })
  }

  onFilterSubmit = () => {
    this.filterConditions = _.cloneDeep(this.state.filterConditions)
    this.setState({
      ...this.state,
      graphData: null,
      filterConditions: null
    })

    if (this.filterConditions.store) {
      storage.set('dependency-graph-filter',this.filterConditions)
    } else {
      storage.remove('dependency-graph-filter')
    }
  } 

  render() {
    const { options, data, width, height, panel } = this.props

    const { paused, showStatistics, graphData, filterConditions} = this.state

    const onClickFunc = new Function("data,history,setVariable,setTime", getTemplateSrv().replace(this.props.options.clickEvent))



    if (this.props.options.showDummyData) {
      this.processQueryData(dummyData);
    } else {
      // change data fomart from DataFrame to talbe data
      const respData: QueryResponse[] = []
      for (const series of data.series) {
        respData.push(toLegacyTableData(series))
      }
      this.processQueryData(respData)
    }

    const styles = getStyles();

    setTimeout(() => {
      if (this.cy && this.isDataAvailable()) {
        const rawGraph: IGraph = this.graphGenerator.generateGraph(this.currentData.graph);
        const graph = filterGraph(rawGraph,this.filterConditions)
        
        this._updateGraph(graph);
      }
    }, 1500)

    let errorRate = 0
    if (this.selectionStatistics && this.selectionStatistics.requests > 0) {
      errorRate = 100 / this.selectionStatistics.requests * this.selectionStatistics.errors
    }

    return (
      <div
        className={cx(
          styles.wrapper,
          css`
              width: ${width}px;
              height: ${height}px;
            `
        )}
      >
        <div className="service-dependency-graph-panel">
          <div className="graph-container">
            <div className="service-dependency-graph">
              <div id={`canvas-container-${panel.id}`} style={{ width: '100%', height: '100%', overflow: 'hidden' }}></div>

              <div className="zoom-button-container">
                <Tooltip placement="right" title={paused ? "Play" : "Pause"}><Button className="btn navbar-button" onClick={this.toggleAnimation}>{paused ? <PlayCircleOutlined translate /> : <PauseCircleOutlined translate />}</Button></Tooltip>
                <Tooltip placement="right" title="Layout as a tree"><Button className="btn navbar-button" onClick={() => this.runLayout()}><ApartmentOutlined translate/></Button></Tooltip>
                <Tooltip placement="right" title="Fit to the canvas"><Button className="btn navbar-button" onClick={this.fit}><AimOutlined translate /></Button></Tooltip>
                <Tooltip placement="right" title="Zoom in"><Button className="btn navbar-button" onClick={() => this.zoom(+1)}><PlusOutlined translate /></Button></Tooltip>
                <Tooltip placement="right" title="Zoom out"><Button className="btn navbar-button" onClick={() => this.zoom(-1)}><MinusOutlined translate /></Button></Tooltip>
                <Tooltip placement="right" title="Filter the nodes and edges"><Button className="btn navbar-button" onClick={() => this.showFilterPanel()}><FilterOutlined translate /></Button></Tooltip>
              </div>
            </div>
            {showStatistics && <div className="statistics show">

              <div className="header--selection">{this.selectionId}
                {this.resolvedDrillDownLink
                  && this.resolvedDrillDownLink.length > 0
                  && <Tooltip title="Drilldown link"><a target="_blank" href={this.resolvedDrillDownLink}>
                    <LinkOutlined translate className="ub-ml2"/>
                  </a></Tooltip>}

                {options.clickEvent && <Tooltip title="Trigger click event"><Icon name="mouse-alt" className="pointer ub-ml2" size="lg" onClick={() => onClickFunc(this.selectionId,getHistory(),(k,v) => interactive.setVariable(k,v,this.props.dashboard,this.props.resetDashboardVariables),interactive.setTime)}/></Tooltip>}
              </div>

              <div className="secondHeader--selection">Statistics</div>
              <table className="table--selection">
                <tr className="table--selection--head">
                  <th>Name</th>
                  <th className="table--th--selectionMedium">Value</th>
                </tr>
                {this.selectionStatistics.requests >= 0 && <tr>
                  <td className="table--td--selection">Requests</td>
                  <td className="table--td--selection">{this.selectionStatistics.requests}</td>
                </tr>}
                {this.selectionStatistics.errors >= 0 && <tr>
                  <td className="table--td--selection">Errors</td>
                  <td className="table--td--selection">{this.selectionStatistics.errors}</td>
                </tr>}
                {this.selectionStatistics.requests >= 0 && this.selectionStatistics.errors >= 0 && <tr>
                  <td className="table--td--selection">Error Rate</td>
                  <td className="table--td--selection">{errorRate}%</td>
                </tr>}
                {this.selectionStatistics.responseTime >= 0 && <tr>
                  <td className="table--td--selection">Avg. Response Time</td>
                  <td className="table--td--selection">{this.selectionStatistics.responseTime} ms</td>
                </tr>}
                {options.showBaselines && this.selectionStatistics.threshold && <tr>
                  <td className="table--td--selection">Response Time Health (Upper Baseline)</td>
                  {!this.selectionStatistics.thresholdViolation && <td className="table--td--selection threshold--good">Good (&lt;= {this.selectionStatistics.threshold}ms)</td>}
                  {this.selectionStatistics.thresholdViolation && <td className="table--td--selection threshold--bad">Bad (&gt; {this.selectionStatistics.threshold}ms)</td>}
                </tr>}
              </table>

              <div className="secondHeader--selection">Incoming Statistics</div>
              {this.receiving.length == 0 && <div className="no-data--selection">No incoming statistics available.</div>}
              {this.receiving.length > 0 && <table className="table--selection">
                <tr className="table--selection--head">
                  <th>Name</th>
                  <th className="table--th--selectionSmall">Time</th>
                  <th className="table--th--selectionSmall">Requests</th>
                  <th className="table--th--selectionSmall">Error Rate</th>
                </tr>
                {this.receiving.map((node, i) => <tr key={i}>
                  <td className="table--td--selection" title="{{node.name}}">{node.name}</td>
                  <td className="table--td--selection">{node.responseTime}</td>
                  <td className="table--td--selection">{node.rate}</td>
                  <td className="table--td--selection">{node.error}</td>
                </tr>)}
              </table>}

              <div className="secondHeader--selection">Outgoing Statistics</div>
              {this.sending.length == 0 && <div className="no-data--selection">No outgoing statistics available.</div>}
              {this.sending.length > 0 && <table className="table--selection">
                <tr className="table--selection--head">
                  <th>Name</th>
                  <th className="table--th--selectionSmall">Time</th>
                  <th className="table--th--selectionSmall">Requests</th>
                  <th className="table--th--selectionSmall">Error Rate</th>
                </tr>
                {this.sending.map((node, i) => <tr key={i}>
                  <td className="table--td--selection" title="{{node.name}}">{node.name}</td>
                  <td className="table--td--selection">{node.responseTime}</td>
                  <td className="table--td--selection">{node.rate}</td>
                  <td className="table--td--selection">{node.error}</td>
                </tr>)}

              </table>}
            </div>}
          </div>
        </div>
        {graphData && <FilterPanel onSubmit={this.onFilterSubmit} onClose={this.closeFilterPanel} onChange={this.onFilterChange} graph={graphData} conditions={filterConditions}/>}
      </div>
    );
  }
}

const mapDispatchToProps = {
  resetDashboardVariables,
};



export default withTheme(connect(null, mapDispatchToProps)(DependencyGraph))


const getStyles = stylesFactory(() => {
  return {
    wrapper: css`
      position: relative;
    `,
    svg: css`
      position: absolute;
      top: 0;
      left: 0;
    `,
    textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
  };
});



 
const toLegacyTableData = (frame: DataFrame):  TableData => {
    const { fields } = frame;
  
    const rowCount = frame.length;
    const rows: any[][] = [];
  
    for (let i = 0; i < rowCount; i++) {
      const row: any[] = [];
      for (let j = 0; j < fields.length; j++) {
        row.push(fields[j].values.get(i));
      }
      rows.push(row);
    }
  
    return {
      columns: fields.map(f => {
        const { name, config } = f;
        if (config) {
          // keep unit etc
          const { ...column } = config;
          (column as Column).text = name;
          return column as Column;
        }
        return { text: name };
      }),
      type: 'table',
      refId: frame.refId,
      meta: frame.meta,
      rows,
    };
  };
  
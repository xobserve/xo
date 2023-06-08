import React from 'react';
import { defaults } from './defaults';
import Cytoscape, {CytoscapeOptions} from 'cytoscape';
import { patch } from './patch';
import { Box } from '@chakra-ui/react';
import cytoscape from 'cytoscape';
/**
 * The `CytoscapeComponent` is a React component that allows for the declarative creation
 * and modification of a Cytoscape instance, a graph visualisation.
 */

interface Props {
  id?: string 
  className?: string
  cy: any
  global?: any
}

export default class CytoscapeComponent extends React.Component<CytoscapeOptions & Props> {
  displayName;
  containerRef;
  _cy;

  static get defaultProps() {
    return defaults;
  }

  static normalizeElements(elements) {
    const isArray = elements.length != null;

    if (isArray) {
      return elements;
    } else {
      let { nodes, edges } = elements;

      if (nodes == null) {
        nodes = [];
      }

      if (edges == null) {
        edges = [];
      }

      return nodes.concat(edges);
    }
  }

  constructor(props) {
    super(props);
    this.displayName = 'CytoscapeComponent';
    this.containerRef = React.createRef();
  }

  componentDidMount() {
    const container = this.containerRef.current;

    const {
      global,headless,styleEnabled,hideEdgesOnViewport,textureOnViewport,motionBlur,motionBlurOpacity,wheelSensitivity,pixelRatio,
    } = this.props;
     //@ts-ignore
    const cy = cytoscape({
      container,
      headless,
      styleEnabled,
      hideEdgesOnViewport,
      textureOnViewport,
      motionBlur,
      motionBlurOpacity,
      wheelSensitivity,
      pixelRatio,
    });
    this._cy  = cy;
    cy.domNode()


    this.updateCytoscape(null, this.props);
  }

  updateCytoscape(prevProps, newProps) {
    const cy = this._cy;
    const { diff, toJson, get, forEach } = newProps;

    patch(cy, prevProps, newProps, diff, toJson, get, forEach);

    if (newProps.cy != null) {
      newProps.cy(cy);
    }
  }

  componentDidUpdate(prevProps) {
    this.updateCytoscape(prevProps, this.props);
  }

  componentWillUnmount() {
    this._cy.destroy();
  }

  render() {
    const { id, className } = this.props;

    return  <Box ref={this.containerRef} id={id} className={className} width="100%" height="100%"  /> 
  }
}
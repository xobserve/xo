export interface DependencyGraphOptions {
  dataMapping: DataMapping
  showConnectionStats: boolean
  sumTimings: boolean
  filterEmptyConnections: boolean
  showDebugInformation: boolean
  showDummyData: boolean
  showBaselines: boolean 

  style: {
    healthyColor: string 
    dangerColor: string
    unknownColor: string 
  }

  serviceIcons: {string:string}

  drillDownLink: string

  layoutSetting: string
  styleSetting: string
}



export interface PanelSettings {
  animate: boolean;
  sumTimings: boolean;
  filterEmptyConnections: boolean;
  style: PanelStyleSettings;
  showDebugInformation: boolean;
  showConnectionStats: boolean;
  externalIcons: IconResource[];
  dataMapping: DataMapping;
  showDummyData: boolean;
  drillDownLink: string;
  showBaselines: boolean;
};

export interface DataMapping {
  source: string 
  target: string 
  externalType: string
  responseTimeColumn: string 
  requestColumn: string
  errorsColumn: string
  baselineRtUpper : string
};

export interface PanelStyleSettings {
  healthyColor: string;
  dangerColor: string;
  unknownColor: string;
}

export interface IconResource {
  name: string;
  filename: string;
}

export interface QueryResponseColumn {
  type?: string;
  text: string;
};

export interface QueryResponse {
  columns: QueryResponseColumn[];
  refId?: string;
  rows: any[];
};

export interface CyData {
  group: string;
  data: {
      id: string;
      source?: string;
      target?: string;
      metrics: IGraphMetrics;
      type?: string;
      external_type?: string;
  }
};

export interface CurrentData {
  graph: GraphDataElement[];
  raw: QueryResponse[];
  columnNames: string[];
}

export interface GraphDataElement {
  source?: string;
  target: string;
  data: DataElement;
  type?: GraphDataType;
  externalType: ExternalType;
};

export interface DataElement {
  requests?: number;
  errors?: number;
  responseTime?: number;
  threshold?: number;
};

export enum GraphDataType {
  SELF = 'SELF',
  INTERNAL = 'INTERNAL',
  EXTERNAL_OUT = 'EXTERNAL_OUT',
  EXTERNAL_IN = 'EXTERNAL_IN'
};

export enum ExternalType {
  NoExternal = 0,
  SourceExternal = 1,
  TargetExternal = 2
}

/*--------data structures for cytoscape------*/
export interface IGraph {
  nodes: IGraphNode[],
  edges: IGraphEdge[]
};

export interface IGraphNode {
  name: string;
  type: EGraphNodeType;
  metrics?: IGraphMetrics;
};

export interface IGraphMetrics {
  requests?: number;   // requests count
  errors?: number;
  responseTime?: number;
  errorRate?: number;
  threshold?: number;
};


export enum EGraphNodeType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL'
};

export interface IGraphEdge {
  source: string;
  target: string;
  metrics?: IGraphMetrics;
};
/*---------------------------------------------------*/


export interface Particle {
  velocity: number;
  startTime: number;
};

export interface Particles {
  normal: Particle[];
  danger: Particle[];
};

export interface CyCanvas {
  getCanvas: () => HTMLCanvasElement;
  clear: (CanvasRenderingContext2D) => void;
  resetTransform: (CanvasRenderingContext2D) => void;
  setTransform: (CanvasRenderingContext2D) => void;
};

export interface TableContent {
  name: string;
  responseTime: string;
  rate: string;
  error: string;
};

export interface ISelectionStatistics {
  requests?: number;
  errors?: number;
  responseTime?: number;
  threshold?: number;
  thresholdViolation?: boolean;
};


export interface FilterConditions {
  nodes: {
    type: NodeFilterType
    names: string[]
  }
  conditions: FilterCondition[],

  store: boolean
}

export interface FilterCondition {
  type: ConditionFilterType 
  metric: string
  operator: string 
  value: number
}

export enum NodeFilterType {
  ALL = 'ALL',
  IN = 'IN',
  OUT_OF = 'OUT_OF'
}

export enum ConditionFilterType {
  OR = 'OR',
  AND = 'AND'
}

export enum ConditionMetric {
  REQUESTS = 'requests',
  ERRORS = 'errors',
  RESP_TIME = 'responseTime',
  ERRORS_RATE = 'errorRtate'
}
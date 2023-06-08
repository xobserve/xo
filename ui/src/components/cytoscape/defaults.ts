import { shallowObjDiff } from './diff';
import { get, toJson, forEach } from './json';

export const identity = (x) => x;

export const elements = [
  { data: { id: 'a', label: 'Example node A' } },
  { data: { id: 'b', label: 'Example node B' } },
  { data: { id: 'e', source: 'a', target: 'b' } },
];

export const stylesheet = [
  {
    selector: 'node',
    style: {
      label: 'data(label)',
    },
  },
  {
    "selector": 'edge',
    "style": {
        'target-arrow-shape': 'vee'
    }
  },
  {
    "selector": "edge.hollow",
    "style": {
      "target-arrow-fill": "hollow"
    },
  },
  {
    "selector": "edge",
    "style": {
      "width": 1,
      "curve-style": "straight"
    }
  }
];

export const zoom = 1;

export const pan = {
  x: 0,
  y: 0,
};

export const defaults = {
  diff: shallowObjDiff,
  get,
  toJson,
  forEach,
  elements,
  stylesheet,
  zoom,
  pan,
};
import { get as atKey } from './json';
import { shallowObjDiff } from './diff';

const isDiffAtKey = (json1, json2, diff, key) =>
  diff(atKey(json1, key), atKey(json2, key));

export const patch = (cy, json1, json2, diff, toJson, get, forEach) => {
  cy.batch(() => {
    // The shallow object diff() must defer to patchElements() as it must compare the
    // elements as an unordered set.  A custom diff(), with Immutable for example,
    // could just use an equality check (===).
    if (
      diff === shallowObjDiff ||
      isDiffAtKey(json1, json2, diff, 'elements')
    ) {
      patchElements(
        cy,
        atKey(json1, 'elements'),
        atKey(json2, 'elements'),
        toJson,
        get,
        forEach,
        diff
      );
    }

    if (isDiffAtKey(json1, json2, diff, 'stylesheet')) {
      patchStyle(
        cy,
        atKey(json1, 'stylesheet'),
        atKey(json2, 'stylesheet'),
        toJson
      );
    }

    [
      // simple keys that can be patched directly (key same as fn name)
      'zoom',
      'minZoom',
      'maxZoom',
      'zoomingEnabled',
      'userZoomingEnabled',
      'pan',
      'panningEnabled',
      'userPanningEnabled',
      'boxSelectionEnabled',
      'autoungrabify',
      'autolock',
      'autounselectify',
    ].forEach((key) => {
      if (isDiffAtKey(json1, json2, diff, key)) {
        patchJson(cy, key, atKey(json1, key), atKey(json2, key), toJson);
      }
    });
  });

  if (isDiffAtKey(json1, json2, diff, 'layout')) {
    patchLayout(cy, atKey(json1, 'layout'), atKey(json2, 'layout'), toJson);
  }
};

const patchJson = (cy, key, val1, val2, toJson) => {
  cy[key](toJson(val2));
};

const patchLayout = (cy, layout1, layout2, toJson) => {
  const layoutOpts = toJson(layout2);

  if (layoutOpts != null) {
    cy.layout(layoutOpts).run();
  }
};

const patchStyle = (cy, style1, style2, toJson) => {
  const style = cy.style();

  if (style == null) {
    return;
  }

  style.fromJson(toJson(style2)).update();
};

const patchElements = (cy, eles1, eles2, toJson, get, forEach, diff) => {
  const toAdd = [];
  const toRm = cy.collection();
  const toPatch = [];
  const eles1Map = {};
  const eles2Map = {};
  const eles1HasId = (id) => eles1Map[id] != null;
  const eles2HasId = (id) => eles2Map[id] != null;
  const getEle1 = (id) => eles1Map[id];
  const getId = (ele) => get(get(ele, 'data'), 'id');

  forEach(eles2, (ele2) => {
    const id = getId(ele2);

    eles2Map[id] = ele2;
  });

  if (eles1 != null) {
    forEach(eles1, (ele1) => {
      const id = getId(ele1);

      eles1Map[id] = ele1;

      if (!eles2HasId(id)) {
        toRm.merge(cy.getElementById(id));
      }
    });
  }

  forEach(eles2, (ele2) => {
    const id = getId(ele2);
    const ele1 = getEle1(id);

    if (eles1HasId(id)) {
      toPatch.push({ ele1, ele2 });
    } else {
      toAdd.push(toJson(ele2));
    }
  });

  if (toRm.length > 0) {
    cy.remove(toRm);
  }
  
  if (toAdd.length > 0) {
    console.log(toAdd)
    cy.add(toAdd);
  }

  toPatch.forEach(({ ele1, ele2 }) =>
    patchElement(cy, ele1, ele2, toJson, get, diff)
  );
};

const patchElement = (cy, ele1, ele2, toJson, get, diff) => {
  const id = get(get(ele2, 'data'), 'id');
  const cyEle = cy.getElementById(id);
  const patch = {};
  const jsonKeys = [
    'data',
    'position',
    'selected',
    'selectable',
    'locked',
    'grabbable',
    'classes',
  ];

  jsonKeys.forEach((key) => {
    const data2 = get(ele2, key);

    if (diff(data2, get(ele1, key))) {
      patch[key] = toJson(data2);
    }
  });

  const scratch2 = get(ele2, 'scratch');
  if (diff(scratch2, get(ele1, 'scratch'))) {
    cyEle.scratch(toJson(scratch2));
  }

  if (Object.keys(patch).length > 0) {
    cyEle.json(patch);
  }
};
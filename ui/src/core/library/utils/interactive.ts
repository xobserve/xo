import { Component } from 'react';
import { connect } from 'react-redux';

import { css } from 'emotion';

import { join, indexOf,cloneDeep, isArray} from 'lodash';
import { getTimeSrv } from 'src/core/services/time';
import { toUtc } from 'src/packages/datav-core/src';



export class Interactive {  
  setVariable = (name, value, dashboard,resetDashboardVariables) => {
    const vars = dashboard.templating.list
    for (const v of vars) {
      if (v.name === name) {
        if (!v.multi) {
          v.current = {
            text: value,
            value: value,
            selected: false
          }

          for (const o of v.options) {
            if (o.text === value) {
              o.selected = true
            } else {
              o.selected = false
            }
          }
        } else {
          let values = cloneDeep(v.current.value)
          if (indexOf(values, value) === -1 && values !== value) {
            if (isArray(values)) {
              values.push(value)
            } else {
              values = [values,value]
            }

            v.current = {
              text: join(values, " + "),
              value: values,
              selected: true,
            }
  
            for (const o of v.options) {
              if (indexOf(values, o.text) !== -1) {
                o.selected = true
              } else {
                o.selected = false
              }
            }
          }
        }
      }
    }
    resetDashboardVariables(dashboard)
  }

  setTime = (from,to) => {
    getTimeSrv().setTime({
        from: toUtc(from),
        to: toUtc(to),
      }, true);
  }
}

export const interactive = new Interactive()

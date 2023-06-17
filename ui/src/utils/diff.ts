import { isEqual } from "lodash";

export const getObjectDiff = (obj1, obj2, compareRef = false) => {
    return Object.keys(obj1).reduce((result, key) => {
      if (!obj2.hasOwnProperty(key)) {
        result.push(key);
      } else if (isEqual(obj1[key], obj2[key])) {
        const resultKeyIndex = result.indexOf(key);
  
        if (compareRef && obj1[key] !== obj2[key]) {
          result[resultKeyIndex] = `${key} (ref)`;
        } else {
          result.splice(resultKeyIndex, 1);
        }
      }
      return result;
    }, Object.keys(obj2));
  }
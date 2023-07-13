import _, { isArray, isObject } from 'lodash'

export function isEmpty(value){
    if(value === null || value === '' || value === undefined){
        return true
    } 

    if (isArray(value) || isObject(value)){
        return _.isEmpty(value)
    }
    
    return false
}
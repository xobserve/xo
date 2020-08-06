/**
 * 判断是否为空
 */
export function isEmpty(value:any){
    if(value === null || value === '' || value === 'undefined' || value === undefined || value === 'null' || value.length === 0){
        return true
    } 
    
    return false
}
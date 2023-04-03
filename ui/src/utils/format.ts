
// parse all the {{xxx}} to [xxx]
export const parseLegendFormat = (s) => {
    const reg = /{{(.*?)}}/g;
    const result = [];
    let match;
    while ((match = reg.exec(s))) {
        result.push(match[1]);
    }
    return result;
}

// parse all the ${xxx} to [xxx]
export const parseVariableFormat = (s) => {
    const reg = /\${(.*?)}/g;
    const result = [];
    let match;
    while ((match = reg.exec(s))) {
        result.push(match[1]);
    }
    return result;
}

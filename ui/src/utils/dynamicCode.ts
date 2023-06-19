export const genDynamicFunction = (ast) => {
    try {
        const f =  eval("(" + ast +")")
        return f
    } catch (error) {
        return error
    }
}
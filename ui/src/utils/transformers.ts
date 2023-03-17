export function incrRoundDn(num: number, incr: number) {
    return Math.floor(num / incr) * incr;
}


export function incrRoundUp(num: number, incr: number) {
    return Math.ceil(num / incr) * incr;
}

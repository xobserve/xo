export declare function makeCacheScope(): (key: string, value: any) => any;
declare const defaultScope: ((key: string, value: any) => any) & {
    makeScope: typeof makeCacheScope;
};
export default defaultScope;

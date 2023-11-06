import cacheAs from './cacheAs';
import Digraph from './Digraph';
import DirectedGraph from './DirectedGraph';
import LayoutManager from './LayoutManager';
declare const _default: {
    cacheAs: ((key: string, value: any) => any) & {
        makeScope: typeof import("./cacheAs").makeCacheScope;
    };
    Digraph: typeof Digraph;
    DirectedGraph: typeof DirectedGraph;
    LayoutManager: typeof LayoutManager;
};
export default _default;
export { cacheAs, Digraph, DirectedGraph, LayoutManager };

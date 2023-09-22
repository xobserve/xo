import { EWorkerPhase, TLayoutOptions } from './types';
import { TEdge, TLayoutVertex, TSizeVertex } from '../types';
export default function getLayout(phase: EWorkerPhase, inEdges: TEdge[], inVertices: TSizeVertex[] | TLayoutVertex[], layoutOptions: TLayoutOptions | null): {
    graph: import("../types").TLayoutGraph;
    edges: import("../types").TLayoutEdge[] | null;
    vertices: TLayoutVertex[];
    layoutError: boolean;
    layoutErrorMessage: string;
} | {
    graph: import("../types").TLayoutGraph;
    edges: import("../types").TLayoutEdge[] | null;
    vertices: TLayoutVertex[];
    layoutErrorMessage: string;
    layoutError?: undefined;
} | {
    edges: import("../types").TLayoutEdge[] | null;
    graph: import("../types").TLayoutGraph;
    vertices: TLayoutVertex[];
    layoutError?: undefined;
    layoutErrorMessage?: undefined;
};

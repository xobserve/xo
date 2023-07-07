import * as React from 'react';
import { TExposedGraphState, TFromGraphStateFn, TLayer, TRendererUtils, TSetProps } from './types';
import LayoutManager from '../LayoutManager';
import { TEdge, TSizeVertex, TVertex } from '../types';
import TNonEmptyArray from '../types/TNonEmptyArray';
import ZoomManager from '../zoom/ZoomManager';
type TDigraphState<T = {}, U = {}> = Omit<TExposedGraphState<T, U>, 'renderUtils'> & {
    sizeVertices: TSizeVertex<T>[] | null;
};
type TDigraphProps<T = unknown, U = unknown> = {
    className?: string;
    classNamePrefix?: string;
    edges: TEdge<U>[];
    layers: TNonEmptyArray<TLayer<T, U>>;
    layoutManager: LayoutManager;
    measurableNodesKey: string;
    minimap?: boolean;
    minimapClassName?: string;
    setOnGraph?: TSetProps<TFromGraphStateFn<T, U>>;
    style?: React.CSSProperties;
    vertices: TVertex<T>[];
    zoom?: boolean;
};
export default class Digraph<T = unknown, U = unknown> extends React.PureComponent<TDigraphProps<T, U>, TDigraphState<T, U>> {
    renderUtils: TRendererUtils;
    static propsFactories: Record<string, TFromGraphStateFn<any, any>>;
    static scaleProperty: {
        (property: keyof React.CSSProperties, valueMin?: number, valueMax?: number, expAdjuster?: number): (graphState: TExposedGraphState<any, any>) => {
            style: {
                [x: string]: number;
            };
        };
        opacity: (graphState: TExposedGraphState<any, any>) => {
            style: {
                [x: string]: number;
            };
        };
        strokeOpacity: (graphState: TExposedGraphState<any, any>) => {
            style: {
                [x: string]: number;
            };
        };
        strokeOpacityStrong: (graphState: TExposedGraphState<any, any>) => {
            style: {
                [x: string]: number;
            };
        };
        strokeOpacityStrongest: (graphState: TExposedGraphState<any, any>) => {
            style: {
                [x: string]: number;
            };
        };
    };
    static defaultProps: {
        className: string;
        classNamePrefix: string;
        minimap: boolean;
        minimapClassName: string;
        zoom: boolean;
    };
    state: TDigraphState<T, U>;
    baseId: string;
    makeClassNameFactory: import("memoize-one").MemoizedFn<(classNamePrefix: string) => (name: string) => string>;
    rootRef: React.RefObject<HTMLDivElement>;
    zoomManager: ZoomManager | null;
    constructor(props: TDigraphProps<T, U>);
    componentDidMount(): void;
    getGlobalId: (name: string) => string;
    getZoomTransform: () => import("d3-zoom").ZoomTransform;
    private setSizeVertices;
    private renderLayers;
    private onZoomUpdated;
    private onLayoutDone;
    render(): JSX.Element;
}
export {};

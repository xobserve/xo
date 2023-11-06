import * as React from 'react';
import { TEdge, TLayoutEdge, TLayoutGraph, TLayoutVertex, TVertex } from '../types';
import { TOneOfFour, TOneOfTwo } from '../types/TOneOf';
import { ZoomTransform } from '../zoom/ZoomManager';
import TNonEmptyArray from '../types/TNonEmptyArray';
export declare enum ELayoutPhase {
    NoData = "NoData",
    CalcSizes = "CalcSizes",
    CalcPositions = "CalcPositions",
    CalcEdges = "CalcEdges",
    Done = "Done"
}
export type TLayerType = 'html' | 'svg';
export declare enum ELayerType {
    Html = "html",
    Svg = "svg"
}
export type TRendererUtils = {
    getGlobalId: (name: string) => string;
    getZoomTransform: () => ZoomTransform;
};
export type TExposedGraphState<T = Record<string, unknown>, U = Record<string, unknown>> = {
    edges: TEdge<U>[];
    layoutEdges: TLayoutEdge<U>[] | null;
    layoutGraph: TLayoutGraph | null;
    layoutPhase: ELayoutPhase;
    layoutVertices: TLayoutVertex<T>[] | null;
    renderUtils: TRendererUtils;
    vertices: TVertex<T>[];
    zoomTransform: ZoomTransform;
};
export type TAnyProps = Record<string, unknown> & {
    className?: string;
    style?: React.CSSProperties;
};
export type TPropFactoryFn = (...args: any[]) => TAnyProps | null;
export type TSetProps<TFactoryFn extends TPropFactoryFn> = TAnyProps | TFactoryFn | TNonEmptyArray<TAnyProps | TFactoryFn>;
export type TFromGraphStateFn<T = Record<string, unknown>, U = Record<string, unknown>> = (input: TExposedGraphState<T, U>) => TAnyProps | null;
export type TSetOnContainer<T = any, U = any> = {
    setOnContainer?: TSetProps<TFromGraphStateFn<T, U>>;
};
type TKeyed = {
    key: string;
};
export type TDefEntry<T = Record<string, unknown>, U = Record<string, unknown>> = {
    renderEntry?: (graphState: TExposedGraphState<T, U>, entryProps: TAnyProps | null, id: string) => React.ReactElement;
    localId: string;
    setOnEntry?: TSetProps<TFromGraphStateFn<T, U>>;
};
export type TRenderNodeFn<T = Record<string, unknown>> = (vertex: TLayoutVertex<T>, utils: TRendererUtils) => React.ReactNode;
export type TRenderMeasurableNodeFn<T = Record<string, unknown>> = (vertex: TVertex<T>, utils: TRendererUtils, layoutVertex: TLayoutVertex<T> | null) => React.ReactNode;
export type TMeasureNodeUtils = {
    layerType: 'html' | 'svg';
    getWrapperSize: () => {
        height: number;
        width: number;
    };
    getWrapper: () => TOneOfTwo<{
        htmlWrapper: HTMLDivElement | null;
    }, {
        svgWrapper: SVGGElement | null;
    }>;
};
export type TMeasurableNodeRenderer<T = Record<string, unknown>> = {
    measurable: true;
    measureNode?: (vertex: TVertex<T>, utils: TMeasureNodeUtils) => {
        height: number;
        width: number;
    };
    renderNode: TRenderMeasurableNodeFn<T>;
    setOnNode?: TSetProps<(vertex: TVertex<T>, utils: TRendererUtils, layoutVertex: TLayoutVertex<T> | null) => TAnyProps | null>;
};
export type TNodeRenderer<T = Record<string, unknown>> = {
    renderNode: TRenderNodeFn<T> | null;
    setOnNode?: TSetProps<(layoutVertex: TLayoutVertex<T>, utils: TRendererUtils) => TAnyProps | null>;
};
type TNodesLayer<T = Record<string, unknown>, U = Record<string, unknown>> = TKeyed & TOneOfTwo<TNodeRenderer<T>, TMeasurableNodeRenderer<T>> & TSetOnContainer<T, U>;
type TStandaloneNodesLayer<T = Record<string, unknown>, U = Record<string, unknown>> = TNodesLayer<T, U> & ({
    layerType: Extract<TLayerType, 'html'>;
} | {
    layerType: Extract<TLayerType, 'svg'>;
    defs?: TNonEmptyArray<TDefEntry<T, U>>;
});
export type TEdgesLayer<T = Record<string, unknown>, U = Record<string, unknown>> = TKeyed & TSetOnContainer<T, U> & {
    edges: true;
    markerEndId?: string;
    markerStartId?: string;
    setOnEdge?: TSetProps<(edge: TLayoutEdge<U>, utils: TRendererUtils) => TAnyProps | null>;
};
export type TStandaloneEdgesLayer<T = Record<string, unknown>, U = Record<string, unknown>> = TEdgesLayer<T, U> & {
    defs?: TNonEmptyArray<TDefEntry<T, U>>;
    layerType: Extract<TLayerType, 'svg'>;
};
export type THtmlLayersGroup<T = Record<string, unknown>, U = Record<string, unknown>> = TKeyed & TSetOnContainer<T, U> & {
    layerType: Extract<TLayerType, 'html'>;
    layers: TNonEmptyArray<TNodesLayer<T, U>>;
};
export type TSvgLayersGroup<T = Record<string, unknown>, U = Record<string, unknown>> = TKeyed & TSetOnContainer<T, U> & {
    layerType: Extract<TLayerType, 'svg'>;
    defs?: TNonEmptyArray<TDefEntry<T, U>>;
    layers: TNonEmptyArray<TOneOfTwo<TNodesLayer<T, U>, TEdgesLayer<T, U>>>;
};
export type TLayer<T = Record<string, unknown>, U = Record<string, unknown>> = TOneOfFour<THtmlLayersGroup<T, U>, TSvgLayersGroup<T, U>, TStandaloneNodesLayer<T, U>, TStandaloneEdgesLayer<T, U>>;
export {};

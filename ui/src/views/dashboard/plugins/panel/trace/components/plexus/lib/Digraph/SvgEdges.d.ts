import * as React from 'react';
import { TRendererUtils, TSetProps, TAnyProps } from './types';
import { TLayoutEdge } from '../types';
type TProps<T = {}> = {
    getClassName: (name: string) => string;
    layoutEdges: TLayoutEdge<T>[];
    markerEndId?: string;
    markerStartId?: string;
    renderUtils: TRendererUtils;
    setOnEdge?: TSetProps<(edge: TLayoutEdge<T>, utils: TRendererUtils) => TAnyProps | null>;
};
export default class SvgEdges<T = {}> extends React.Component<TProps<T>> {
    shouldComponentUpdate(np: TProps<T>): boolean;
    render(): JSX.Element[];
}
export {};

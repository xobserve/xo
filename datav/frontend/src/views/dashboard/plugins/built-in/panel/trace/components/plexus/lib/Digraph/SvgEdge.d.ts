import * as React from 'react';
import { TAnyProps, TRendererUtils, TSetProps } from './types';
import { TLayoutEdge } from '../types';
type TProps<U = {}> = {
    getClassName: (name: string) => string;
    layoutEdge: TLayoutEdge<U>;
    markerEndId?: string;
    markerStartId?: string;
    renderUtils: TRendererUtils;
    setOnEdge?: TSetProps<(edge: TLayoutEdge<U>, utils: TRendererUtils) => TAnyProps | null>;
};
declare function makePathD(points: [number, number][]): string;
export default class SvgEdge<U = {}> extends React.PureComponent<TProps<U>> {
    makePathD: import("memoize-one").MemoizedFn<typeof makePathD>;
    render(): JSX.Element;
}
export {};

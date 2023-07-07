import * as React from 'react';
import { TMeasurableNodeRenderer, TLayerType, TRendererUtils } from './types';
import { TLayoutVertex, TVertex } from '../types';
type TProps<T = {}> = Omit<TMeasurableNodeRenderer<T>, 'measurable' | 'measureNode'> & {
    getClassName: (name: string) => string;
    hidden: boolean;
    layerType: TLayerType;
    layoutVertex: TLayoutVertex<T> | null;
    renderUtils: TRendererUtils;
    vertex: TVertex<T>;
};
export default class MeasurableNode<T = {}> extends React.PureComponent<TProps<T>> {
    htmlRef: React.RefObject<HTMLDivElement>;
    svgRef: React.RefObject<SVGGElement>;
    private measureHtml;
    private measureSvg;
    private renderHtml;
    private renderSvg;
    getRef(): {
        htmlWrapper: HTMLDivElement | null;
        svgWrapper: undefined;
    } | {
        svgWrapper: SVGGElement | null;
        htmlWrapper: undefined;
    };
    measure(): {
        height: number;
        width: number;
    };
    render(): JSX.Element;
}
export {};

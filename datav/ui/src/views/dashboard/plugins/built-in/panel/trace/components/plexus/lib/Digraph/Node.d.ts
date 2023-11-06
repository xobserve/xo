import * as React from 'react';
import { TRendererUtils, TLayerType, TRenderNodeFn, TSetProps, TAnyProps } from './types';
import { TLayoutVertex } from '../types';
export type TProps<T = {}> = {
    getClassName: (name: string) => string;
    layerType: TLayerType;
    layoutVertex: TLayoutVertex<T>;
    renderNode: TRenderNodeFn<T>;
    renderUtils: TRendererUtils;
    setOnNode?: TSetProps<(layoutVertex: TLayoutVertex<T>, utils: TRendererUtils) => TAnyProps | null>;
};
export default class Node<T = {}> extends React.PureComponent<TProps<T>> {
    render(): JSX.Element | null;
}

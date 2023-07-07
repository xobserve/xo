/// <reference types="react" />
import { ZoomTransform } from 'd3-zoom';
declare const SCALE_MAX = 1;
declare const SCALE_MIN = 0.03;
export declare const DEFAULT_SCALE_EXTENT: [typeof SCALE_MIN, typeof SCALE_MAX];
export declare function getScaleExtent(width: number, height: number, viewWidth: number, viewHeight: number): [number, number];
export declare function fitWithinContainer(width: number, height: number, viewWidth: number, viewHeight: number): ZoomTransform;
export declare function constrainZoom(transform: ZoomTransform, width: number, height: number, viewWidth: number, viewHeight: number): ZoomTransform;
export declare function getZoomStyle(transform: ZoomTransform | void): React.CSSProperties;
export declare function getZoomAttr(transform: ZoomTransform | void): string | undefined;
export {};

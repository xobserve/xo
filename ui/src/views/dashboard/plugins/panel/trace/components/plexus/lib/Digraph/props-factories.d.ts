import { TExposedGraphState } from './types';
export declare const classNameIsSmall: <T = {}, U = {}>(graphState: TExposedGraphState<T, U>) => {
    className: string;
} | null;
export declare const scaleProperty: {
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

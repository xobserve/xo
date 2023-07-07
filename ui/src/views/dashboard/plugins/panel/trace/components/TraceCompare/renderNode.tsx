import EmphasizedNode from "../common/EmphasizedNode";
import { TLayoutVertex } from "../plexus/lib/types";

import * as React from 'react';
import cx from 'classnames';

import { TDiffCounts } from '../../model/trace-dag/types';
import TDagPlexusVertex from '../../model/trace-dag/types/TDagPlexusVertex';

import { FaCopy } from "react-icons/fa";
import { Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger } from "@chakra-ui/react";
import CopyToClipboard from "components/CopyToClipboard";

type Props = {
    a: number;
    b: number;
    operation: string;
    service: string;
};

const abs = Math.abs;
const max = Math.max;

export class DiffNode extends React.PureComponent<Props> {
    render() {
        const { a, b, operation, service } = this.props;
        const isSame = a === b;
        const className = cx({
            'is-same': isSame,
            'is-changed': !isSame,
            'is-more': b > a && a > 0,
            'is-added': a === 0,
            'is-less': a > b && b > 0,
            'is-removed': b === 0,
        });
        const chgSign = a < b ? '+' : '-';
        const table = (
            <table className={`DiffNode ${className}`}>
                <tbody className="DiffNode--body">
                    <tr>
                        <td className={`DiffNode--metricCell ${className}`} rowSpan={isSame ? 2 : 1}>
                            {isSame ? null : <span className="DiffNode--metricSymbol">{chgSign}</span>}
                            {isSame ? a : abs(b - a)}
                        </td>
                        <td className={`DiffNode--labelCell ${className}`}>
                            <strong>{service}</strong>
                            <CopyToClipboard copyText={`${service} ${operation}`}
                                tooltipTitle="Copy label" />
                        </td>
                    </tr>
                    <tr>
                        {isSame ? null : (
                            <td className={`DiffNode--metricCell ${className}`}>
                                <span className="DiffNode--metricSymbol">{chgSign}</span>
                                {a === 0 || b === 0 ? 100 : abs(((a - b) / max(a, b)) * 100).toFixed(0)}
                                <span className="DiffNode--metricSymbol">%</span>
                            </td>
                        )}
                        <td className={`DiffNode--labelCell ${className}`}>{operation}</td>
                    </tr>
                </tbody>
            </table>
        );

        return (
            <Popover trigger="hover" openDelay={200}>
                <PopoverTrigger>
                    {table}
                </PopoverTrigger>
                <PopoverContent width="520px"  sx={{
                    table: {
                        width: '500px',
                        fontSize: '1.5rem'
                    }
                }}>
                    <PopoverArrow />
                    <PopoverBody>{table}</PopoverBody>
                </PopoverContent>
            </Popover>

        );
    }
}

export default function renderNode(vertex: TDagPlexusVertex<TDiffCounts>) {
    const { a, b, operation, service } = vertex.data;
    const lenA = a ? a.length : 0;
    const lenB = b ? b.length : 0;
    return <DiffNode a={lenA} b={lenB} operation={operation} service={service} />;
}

export function getNodeEmphasisRenderer(keys: Set<string>) {
    return function drawEmphasizedNode(lv: TLayoutVertex<any>) {
        if (!keys.has(lv.vertex.key)) {
            return null;
        }
        return <EmphasizedNode height={lv.height} width={lv.width} />;
    };
}

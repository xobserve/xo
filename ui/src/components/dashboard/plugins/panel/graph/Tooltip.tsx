import { Box, Center, Text } from "@chakra-ui/react";
import { Portal } from "components/portal/Portal";
import SeriesTable, { seriesFilterType } from "components/Tooltip/SeriesTable";
import { TooltipContainer } from "components/Tooltip/Tooltip";
import { isEmpty, round } from "lodash";
import { useLayoutEffect, useState } from "react";
import { unstable_batchedUpdates } from "react-dom";
import { useMountedState } from "react-use";
import { PanelProps } from "types/dashboard";
import { DataFrame } from "types/dataFrame";
import uPlot from "uplot";
import { dateTimeFormat } from "utils/datetime/formatter";
import { useOptions } from "./use-options";

interface Props {
    props: PanelProps
    options: uPlot.Options
}

const TOOLTIP_OFFSET = 10;
let plotInstance;
const Tooltip = ({ props, options }: Props) => {
    const [coords, setCoords] = useState(null);
    const [focusSeries, setFocusSeries] = useState<DataFrame>(null)
    const [focusIdx, setFocusIdx] = useState(null)
    const [focusXVal, setFocusXVal] = useState(null)
    const [focusYVal, setFocusYVal] = useState(null)
    const isMounted = useMountedState();
    useLayoutEffect(() => {
        let bbox: DOMRect | undefined = undefined;

        const plotEnter = () => {
            if (!isMounted()) {
                return;
            }
            console.log("enter plot")
        };

        const plotLeave = () => {
            if (!isMounted()) {
                return
            }
            setCoords(null)
            console.log("leave plot")
        };

        if (options) {
            options.hooks.syncRect = [(u, rect) => (bbox = rect)]

            const setcusor = (uplot) => {
                if (!uplot || !bbox) {
                    return
                }

                const { x, y } = positionTooltip(uplot, bbox)

                if (x !== undefined && y !== undefined) {
                    const idx = uplot.cursor.idx
                    // find nearest time val
                    let xVal = uplot.data[0][idx];

                    // find nearest series

                    const yval = uplot.posToVal(uplot.cursor.top, "y")
                    let gap;
                    let fs;
                    for (const d of props.data) {
                        const newGap = Math.abs(d.fields[1].values[idx] - yval)
                        if (!gap) {
                            gap = newGap
                            fs = d
                        } else {
                            if (newGap < gap) {
                                gap = newGap
                                fs = d
                            }
                        }

                    }

                    unstable_batchedUpdates(() => {
                        setCoords({ x, y });
                        setFocusXVal(xVal)
                        setFocusSeries(fs)
                        setFocusYVal(round(yval, 2))
                        setFocusIdx(idx)
                    })
                }
            }

            if (isEmpty(options.hooks.setCursor)) {
                options.hooks.setCursor = []
            }
            options.hooks.setCursor?.push(setcusor)



            options.hooks.init = [(u) => {
                if (!plotInstance) {
                    plotInstance = u
                }

                u.root.parentElement?.addEventListener('focus', plotEnter);
                u.over.addEventListener('mouseenter', plotEnter);

                u.root.parentElement?.addEventListener('blur', plotLeave);
                u.over.addEventListener('mouseleave', plotLeave);

            }]
        }

        return () => {
            setCoords(null)
            if (plotInstance) {
                console.log("unregister uplot tooltip:", plotInstance)
                plotInstance.over.removeEventListener('mouseleave', plotLeave);
                plotInstance.over.removeEventListener('mouseenter', plotEnter);
                plotInstance.root.parentElement?.removeEventListener('focus', plotEnter);
                plotInstance.root.parentElement?.removeEventListener('blur', plotLeave);
            }
        }
    }, [options])
    
    return (<>
        <Portal key={props.panel.id}>
            {coords && <TooltipContainer position={{ x: coords.x, y: coords.y }} offset={{ x: 0, y: TOOLTIP_OFFSET }}>
                <Box className="bordered" background={'var(--chakra-colors-chakra-body-bg)'} p="2" fontSize="xs">
                        <Text fontWeight="600">{dateTimeFormat(focusXVal * 1000)}</Text>
                        <SeriesTable props={props} nearestSeries={focusSeries} filterIdx={focusIdx} filterType={seriesFilterType.Nearest}/>
                </Box>
            </TooltipContainer>
            }
        </Portal>
    </>)
}

export default Tooltip




export function positionTooltip(u: uPlot, bbox: DOMRect) {
    let x, y;
    const cL = u.cursor.left || 0;
    const cT = u.cursor.top || 0;

    if (isCursorOutsideCanvas(u.cursor, bbox)) {
        const idx = u.posToIdx(cL);
        // when cursor outside of uPlot's canvas
        if (cT < 0 || cT > bbox.height) {
            let pos = findMidPointYPosition(u, idx);

            if (pos) {
                y = bbox.top + pos;
                if (cL >= 0 && cL <= bbox.width) {
                    // find x-scale position for a current cursor left position
                    x = bbox.left + u.valToPos(u.data[0][u.posToIdx(cL)], u.series[0].scale!);
                }
            }
        }
    } else {
        x = bbox.left + cL - 30;
        y = bbox.top + cT;
    }

    return { x, y };
}


export function isCursorOutsideCanvas({ left, top }: uPlot.Cursor, canvas: DOMRect) {
    if (left === undefined || top === undefined) {
        return false;
    }
    return left < 0 || left > canvas.width || top < 0 || top > canvas.height;
}


export function findMidPointYPosition(u: uPlot, idx: number) {
    let y;
    let sMaxIdx = 1;
    let sMinIdx = 1;

    if (!u.data[1]) {
        return 
    }
    // assume min/max being values of 1st series
    let max = u.data[1][idx];
    let min = u.data[1][idx];

    // find min max values AND ids of the corresponding series to get the scales
    for (let i = 1; i < u.data.length; i++) {
        const sData = u.data[i];
        const sVal = sData[idx];
        if (sVal != null) {
            if (max == null) {
                max = sVal;
            } else {
                if (sVal > max) {
                    max = u.data[i][idx];
                    sMaxIdx = i;
                }
            }
            if (min == null) {
                min = sVal;
            } else {
                if (sVal < min) {
                    min = u.data[i][idx];
                    sMinIdx = i;
                }
            }
        }
    }

    if (min == null && max == null) {
        // no tooltip to show
        y = undefined;
    } else if (min != null && max != null) {
        // find median position
        y = (u.valToPos(min, u.series[sMinIdx].scale!) + u.valToPos(max, u.series[sMaxIdx].scale!)) / 2;
    } else {
        // snap tooltip to min OR max point, one of those is not null :)
        y = u.valToPos((min || max)!, u.series[(sMaxIdx || sMinIdx)!].scale!);
    }

    // if y is out of canvas bounds, snap it to the bottom
    if (y !== undefined && y < 0) {
        y = u.bbox.height / devicePixelRatio;
    }

    return y;
}
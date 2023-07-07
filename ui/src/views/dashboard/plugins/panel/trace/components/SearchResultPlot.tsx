import { Box, useColorMode } from "@chakra-ui/react";
import ChartComponent from "components/charts/Chart";
import { alpha } from "components/uPlot/colorManipulator";
import { max, round } from "lodash";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { Trace } from "types/plugins/trace"
import { TimeRange } from "types/time";
import { isErrorTrace } from "../utils/trace";

interface Props {
    traces: Trace[]
    timeRange: TimeRange
    onSelect: (traceIds: string[]) => void
}

const SearchResultPlot = ({ traces, timeRange, onSelect }: Props) => {
    const [chart, setChart] = useState(null)
    const { colorMode } = useColorMode()

    const [minX, maxX, sucData, errData] = useMemo(() => {
        let minX;
        let maxX;
        const sucData = []
        const errData = []
        for (const trace of traces) {
            const time = round(trace.startTime / 1000)
            if (time < minX || !minX) {
                minX = time
            }

            if (time > maxX || !maxX) {
                maxX = time
            }

            const duration = trace.duration / 1000
            const item = [time, duration, trace.traceID, trace.traceName]
            isErrorTrace(trace) ? errData.push(item) : sucData.push(item)
        }
        
        const start = timeRange.start.getTime()
        const end = timeRange.end.getTime()
        if (minX > start) {
            minX = start 
        }

        if (maxX < end) {
            maxX = end
        }

        // min: timeRange.start,
        // max: timeRange.end,

        return [minX, maxX, sucData, errData]
    }, [traces])


    useEffect(() => {
        if (chart) {
            chart.on('click', function (params) {
                onSelect([params.data[2]])
            });


            chart.on('brushSelected', function (params) {
                const traces: string[] = []
                const selected = params.batch[0].selected
                for (const series of selected) {
                    for (const i of series.dataIndex) {
                        if (series.seriesName == "Success") {
                            traces.push(sucData[i][2])
                        } else {    
                            traces.push(errData[i][2])
                        }
                    }      
                }

                if (traces.length > 0) {
                    onSelect(traces)
                }
             
            });

            chart.on('brushEnd', function () {
                setTimeout(() => {
                    chart.dispatchAction({
                        type: 'brush',
                        areas: [
                        ]
                    });
                }, 200);

            });
            chart.dispatchAction({
                type: 'takeGlobalCursor',
                key: 'brush',
                brushOption: {
                    brushType: "rect"
                }
            });
        }

        return () => {
            if (chart) {
                chart.off("click")
                chart.off("brushSelected")
                chart.off("brushEnd")
            }
        }
    }, [chart,traces])

    useEffect(() => {
        if (chart) {
            chart.dispatchAction({
                type: 'takeGlobalCursor',
                key: 'brush',
                brushOption: {
                    brushType: "rect"
                }
            });
        }
    }, [colorMode, traces])

    const itemStyle = {
        opacity: 0.8,
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowColor: 'rgba(0,0,0,0.3)'
    };

    const series = {
        type: 'scatter',
        itemStyle: itemStyle,
        symbolSize: function (data) {
            let size = Math.sqrt(data[1])
            if (size < 20) {
                size = 20
            } else if (size > 50) {
                size = 50
            }

            return size;
        },
        emphasis: {
            focus: 'self'
        },
    }

    const options = useMemo(() => {
        return {
            brush: {
                throttleType: 'debounce',
                throttleDelay: 100
            },
            legend: {
                top: 10,
                data: ['Success', 'Error'],
                textStyle: {
                    fontSize: 16
                }
            },
            grid: {
                left: '50px',
                right: '20px',
                top: '18%',
                bottom: '10%'
            },
            tooltip: {
                backgroundColor: 'rgba(255,255,255,0.9)',
                trigger: 'item',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    },
                },
                formatter: function (param) {
                    var value = param.value;
                    return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">'
                        + value[3]
                        + '</div>'
                        + '<div>Start time: <span style="font-size:16px;font-weight:500">' + moment(value[0]).format('yy-MM-DD HH:mm:ss') + '</span></div>'
                        + '<div style="margin-top:5px">Duration：<span style="font-size:16px;font-weight:500;">' + value[1] + 'ms</span></div>'
                }
            },
            xAxis: {
                type: 'time',
                nameTextStyle: {
                    fontSize: 16
                },
                // max: 31,
                splitLine: {
                    show: false
                },
                axisLabel: {
                    formatter: (function (value) {
                        return moment(value).format('MM-DD HH:mm:ss');
                    }),
                },
                min: minX,
                max: maxX,
                splitNumber: 5,
                // minInterval: 100,
            },
            yAxis: {
                type: 'value',
                // type: "log",
                // logBase: 2,
                name: 'Duration',
                nameLocation: 'end',
                nameGap: 20,
                splitLine: {
                    show: true
                },
                splitNumber: 3,
                axisLabel: {
                    formatter: function (value, index) {
                        return value + 'ms';
                    }
                },
                nameTextStyle: {
                    align: "right"
                }
            },
            series: [
                { ...series, name: "Error", data: errData, color: alpha('#dd4444', 0.7) },
                { ...series, name: "Success", data: sucData, color: alpha('#80F1BE', 0.7) }
            ]
        }
    }, [colorMode, traces])

    return (<>
        {options && <Box width="100%" key={colorMode} className="echarts-panel"><ChartComponent height={350} options={options} theme={colorMode} onChartCreated={c => setChart(c)} /></Box>}
    </>)
}

export default SearchResultPlot


import { Box, useColorMode } from "@chakra-ui/react";
import ChartComponent from "components/charts/Chart";
import { max, round } from "lodash";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { Trace } from "types/plugins/trace"
import { TimeRange } from "types/time";

interface Props {
    traces: Trace[]
    timeRange: TimeRange
}

const SearchResultPlot = ({ traces, timeRange }: Props) => {
    const [chart, setChart] = useState(null)
    const { colorMode } = useColorMode()

    useEffect(() => {
        if (chart) {
            chart.on('click', function (params) {
                console.log("here33335555:", params)
            });


            chart.on('brushSelected', function (params) {
                console.log("here333333:", params)
            });

            chart.on('brushEnd', function (params) {
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
    }, [chart])
   
    const itemStyle = {
        opacity: 0.8,
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowColor: 'rgba(0,0,0,0.3)'
    };

    const options = useMemo(() => {
        let minX;
        let maxX;
        const d = []
        for (const trace of traces) {
            const time = round(trace.startTime / 1000)
            if (time < minX || !minX) {
                minX = time
            }

            if (time > maxX || !maxX) {
                maxX = time
            }

            const duration = trace.duration / 1000
            d.push([time,duration,trace.traceID,trace.traceName])
        }

        console.log("here33333:",minX,maxX, d)
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
                left: '10%',
                right: '5%',
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
                        +  '<div>Start time: <span style="font-size:16px;font-weight:500">' + moment(value[0]).format('yy-MM-DD HH:mm:ss') + '</span></div>'
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
                    formatter: (function(value){
                        return moment(value).format('MM-DD HH:mm:ss');
                    }),
                },
                min: timeRange.start,
                max: timeRange.end,
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
                {
                    name: 'Error',
                    type: 'scatter',
                    itemStyle: itemStyle,
                    data: d,
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
                      color: '#dd4444' // '#80F1BE'
                }
            ]
        }
    }, [colorMode,traces])

    return (<>
        {options && <Box height="400px" width="100%" key={colorMode} className="echarts-panel"><ChartComponent height={500} options={options} theme={colorMode} onChartCreated={c => setChart(c)} /></Box>}
    </>)
}

export default SearchResultPlot


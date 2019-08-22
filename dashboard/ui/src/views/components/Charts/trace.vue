<template>
    <div></div>
</template>

<script>
import { formatTime } from '@/utils/tools'
export default {
    name: '',
    props: ['graphData'],
    data () {
        return {
            tracesChart: null
        }
    },
    mounted () {
        this.initTraceChart()
        let self = this;
        setTimeout(function () {
            // 解析出具体的data
                    self.traceChart(self.graphData)
        }, 100);
    },
    watch: {
     graphData() {
        this.initTraceChart()
        let self = this;
        setTimeout(function () {
            // 解析出具体的data
                    self.traceChart(self.graphData)
        }, 100);
     }
  },
    computed: {},
    methods: {
         traceChart: function (data) {
            this.tracesChart.series = data.series;
            // this.tracesChart.xAxis.tickPositions = data.timeXticks;
            this.tracesChart.subtitle.text = data.subTitle;
            Highcharts.chart(this.$el, this.tracesChart);
        },
        initTraceChart: function () {
            Highcharts.setOptions({
                global: {
                    useUTC: false
                }
            });
            this.tracesChart = {
                chart: {
                    type: 'scatter',
                    zoomType: 'xy',
                    events: {
                        selection: selectPointsByDrag,
                        click: function(e) {
                            console.log(
                                Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', e.xAxis[0].value),
                                e.yAxis[0].value
                            )
                        }
                    }
                },
                title: {
                    text: "Traces",
                    y:10
                },
                subtitle: {
                    verticalAlign: 'top',
                    align: 'center',
                    y: 26
                },
                xAxis: {
                    title: {
                        enabled: false
                    },
                    type: 'datetime',
                    labels: {
                        format: '{value: %m-%d %H:%M}',
                        setp: 1
                    },
                    // tickPositions: [],
                    startOnTick: true,
                    endOnTick: true,
                    showLastLabel: false,
                    tickWidth: 0,
                    gridLineWidth: 0
                },
                credits: {
                    enabled: false
                },
                yAxis: {
                    title: {
                        enabled: true,
                        align: 'high',
                        text: '(ms)',
                        rotation: 0,
                        margin: 0,
                        x: 30,
                        y: -10
                    },
                    minorGridLineWidth: 1,
                    gridLineWidth: 1
                },
                legend: {
                    layout: 'vertical',
                    align: 'left',
                    verticalAlign: 'top',
                    x: 55,
                    y: 13,
                    floating: true,
                    backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
                },
                plotOptions: {
                    scatter: {
                        marker: {
                            radius: 3
                            // states: {
                            //     hover: {
                            //         enabled: true,
                            //         // lineColor: 'rgb(100,100,100)'
                            //     }
                            // }
                        },
                        states: {
                            hover: {
                                marker: {
                                    enabled: true
                                }
                            }
                        },
                        // tooltip: {
                        //     pointFormat: '{point.x: %m-%d %H:%M:%S}'
                        // },
                        enableMouseTracking: false,
                        turboThreshold: "disable"
                    }
                },
                series: []
            };
            
            var self = this
            function selectPointsByDrag(e) {
                if (e.xAxis && e.yAxis) {
                    var traces = [];
                        var succesdata = self.tracesChart.series[0].data;
                        for (var i = 0; i < succesdata.length; i++) {
                            var point = succesdata[i];
                            if (point.x >= e.xAxis[0].min && point.x <= e.xAxis[0].max &&
                                point.y >= e.yAxis[0].min && point.y <= e.yAxis[0].max) {
                                var trace = {
                                    traceId: point.id,
                                    agentId: point.agent_id,
                                    elapsed: point.y,
                                    errCode: 0,
                                    api: point.api,
                                    showTime: formatTime(point.x),
                                    startTime: point.x,
                                    remote_addr: point.remote_addr
                                };
                                traces.push(trace);
                              
                            }
                        }
                        var errordata = self.tracesChart.series[1].data;
                        for (var j = 0; j < errordata.length; j++) {
                            var point2 = errordata[j];
                            if (point2.x >= e.xAxis[0].min && point2.x <= e.xAxis[0].max &&
                                point2.y >= e.yAxis[0].min && point2.y <= e.yAxis[0].max) {
                                var trace2 = {
                                    traceId: point2.id,
                                    agentId: point2.agent_id,
                                    elapsed: point2.y,
                                    errCode: 1,
                                    api: point2.api,
                                    showTime: formatTime(point2.x),
                                    startTime: point2.x,
                                    remote_addr: point2.remote_addr
                                };
                                traces.push(trace2);
                            }
                        }

                    if (traces !== "") {
                        self.$emit("selTraces", traces) 
                        
                    }
                }
                return false
            }
        },
    }
}
</script>

<style>

</style>

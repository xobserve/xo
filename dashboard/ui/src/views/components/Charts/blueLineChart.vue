<template>
  <span :class="className" :id="id" :style="{height:height,width:width}"></span>
</template>

<script>
import echarts from 'echarts'
 
export default {
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    id: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '200px'
    },
    height: {
      type: String,
      default: '200px'
    },

    timeline: {
        type: Array,
        default: []
    },
    name1: {
        type: String,
        default: ''
    },
    valueList1: {
        type: Array,
        default: []
    },
    name2: {
        type: String,
        default: ''
    },
    valueList2: {
        type: Array,
        default: []
    },
    title: {
      type: String,
      default: '图表'
    },
    titleFontSize : {
        type: Number,
        default: 16
    },
    unit: {
      type: String,
      default: '(%)'
    },
    group: {
        type: String,
        default: 'group-dashboard'
    },
    showXAxis: {
        type: Boolean,
        default: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    timeline(val) {
      this.initChart()
    }
  },
  mounted() {
    this.initChart()
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(document.getElementById(this.id))
      var option = {
        backgroundColor: '#fff',
        title: {
            text: this.title,
            textStyle: {
                fontWeight: 'normal',
                fontSize: this.titleFontSize
            },
            left: 'center'
        },
        tooltip: {
            trigger: 'axis', 
            axisPointer: {
            }
        },
        grid: {
            left: '4%',
            right: '2%',
            bottom: '8%',
            top:'18%',
            containLabel: true
        },
        xAxis: [{
            show:this.showXAxis,
            type: 'category',
            boundaryGap: false,
            axisLine: { //坐标轴轴线相关设置。数学上的x轴
				 show: true,
				 lineStyle: {
					//  color: '#233e64'
				 },
			 },
            data: this.timeline
        }],
        yAxis: [{
            type: 'value',
             name: '单位' + this.unit,
            axisTick: {
                show: false
            },
            // axisLine: {
            //     lineStyle: {
            //         color: '#57617B'
            //     }
            // },
            axisLabel: {
                textStyle: {
                    fontSize: 10
                }
            },
            splitLine: {
                show: false
            }
        }],
        series: [{
            name: this.name1,
            type: 'line',
            smooth: true,
            lineStyle: {
                normal: {
                    width: 2
                }
            },
            symbolSize:0,  
            itemStyle: {
                normal: {
                    color: 'rgba(13,177,205,0.8)',
                },
            },
            data: this.valueList1,
        },
        {
            name: this.name2,
            type: 'line',
            smooth: true,
            lineStyle: {
                normal: {
                    width: 2
                }
            },
            areaStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: 'rgba(82, 191, 255, 0.3)'
                    }, {
                        offset: 0.8,
                        color: 'rgba(82, 191, 255, 0)'
                    }], false),
                    shadowColor: 'rgba(228, 139, 76, 0.1)',
                    shadowBlur: 10
                }
            },
            symbolSize:0,  
            itemStyle: {
                normal: {
                    color: 'rgb(82, 191, 255)',
                    borderColor:'#e48b4c'
                },
            },
            data: this.valueList2,
        }  ]
    };
      this.chart.setOption(option)

      this.chart.group = this.group;
    }
  }
}
</script>

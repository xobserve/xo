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
    subTitle: {
      type: String,
      default: ''
    },
    titleFontSize : {
        type: Number,
        default: 16
    },
    unit1: {
      type: String,
      default: ''
    },
    unit2: {
      type: String,
      default: ''
    },
    group: {
        type: String,
        default: 'group-dashboard'
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
            title: {
                text: this.title,
                subtext: this.subTitle,
                textStyle: {
                    fontWeight: 'normal',
                    fontSize: this.titleFontSize
                },
                x: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    animation: false
                }
            },
            axisPointer: {
                link: {xAxisIndex: 'all'}
            },
            grid: [{
                left: 50,
                right: 50,
                height: '35%',
                top: '7%'
            }, {
                left: 50,
                right: 50,
                top: '53%',
                height: '35%'
            }],
            xAxis : [
                {
                    type : 'category',
                    boundaryGap : false,
                    axisLine: {onZero: true},
                    data: this.timeline
                },
                {
                    gridIndex: 1,
                    type : 'category',
                    boundaryGap : false,
                    axisLine: {onZero: true},
                    data: this.timeline,
                    position: 'top',
                    show:false
                }
            ],
            yAxis : [
                {
                    name : this.unit1,
                    type : 'value'
                },
                {
                    gridIndex: 1,
                    name : this.unit2,
                    type : 'value',
                    inverse: true
                }
            ],
            series : [
                {
                    name:this.name1,
                    type:'line',
                    symbolSize: 8,
                    hoverAnimation: false,
                    data: this.valueList1
                },
                {
                    name: this.name2,
                    type:'line',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    symbolSize: 8,
                    hoverAnimation: false,
                    data: this.valueList2
                }
            ]
        };
      this.chart.setOption(option)

      this.chart.group = this.group;
    }
  }
}
</script>

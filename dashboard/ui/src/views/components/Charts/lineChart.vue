<template>
  <div :class="className" :id="id" :style="{height:height,width:width}"></div>
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

    dateList: {
        type: Array,
        default: []
    },
    valueList: {
        type: Array,
        default: []
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    dateList(val) {
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
            text: '响应时间',
            textStyle: {
                fontWeight: 'normal',
                fontSize: 16
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
            top:'14%',
            containLabel: true
        },
        xAxis: [{
            type: 'category',
            boundaryGap: false,
            axisLine: {
            },
            data: this.dateList
        }],
        yAxis: [{
            type: 'value',
             name: '单位（毫秒）',
            axisTick: {
                show: false
            },
            // axisLine: {
            //     lineStyle: {
            //         color: '#57617B'
            //     }
            // },
            // axisLabel: {
            //     textStyle: {
            //         fontSize: 12
            //     }
            // },
            splitLine: {
                show: false
            }
        }],
        series: [{
            name: '平均耗时',
            type: 'line',
            smooth: true,
            lineStyle: {
                normal: {
                    width: 1
                }
            },
          //  symbol:'circle',  // 默认是空心圆（中间是白色的），改成实心圆
            symbolSize:5,
           areaStyle: {
            normal: {
                color: new echarts.graphic.LinearGradient(1, 1, 1, 0, [{
                    offset: 0,
                    color: 'rgba(58,191,238, 1)'
                }, {
                    offset: 1,
                    color: 'rgba(58,191,238, 0.5)'
                }]),
            },
        },
        itemStyle: {
            normal: {
                color: '#0099ff',
                // borderColor: '#ffffff',
                // borderWidth: 12,
            }
        },
            data: this.valueList,
        } ]
    };

      this.chart.off('click');
      var _this=this
      this.chart.on("click", function(params) {
        var s = '20' + params.name + ':00'
        var timestamp = new Date(s).getTime();
        var date = JSON.stringify([new Date(timestamp - 2 * 60 * 1000).toLocaleString('chinese',{hour12:false}).replace(/\//g,'-'),new Date(timestamp + 2 * 60 * 1000).toLocaleString('chinese',{hour12:false}).replace(/\//g,'-')])
        _this.$route.query.date_range= date
        window.history.pushState(
          {},
          0,
          "http://" + window.location.host+window.location.pathname + '?app_name=' +_this.$store.state.apm.appName+'&date_range='+date 
        );
        _this.$store.dispatch('setSelDate', date)
      });

      this.chart.setOption(option)

      this.chart.group = 'group-dashboard';

    }
  }
}
</script>

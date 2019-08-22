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
    title: {
      type: String,
      default: '错误率'
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
            text: this.title,
            textStyle: {
                fontWeight: 'normal',
                fontSize: 16
            },
            left: 'center'
        },
    tooltip: {
        trigger: 'axis'
    },
    xAxis: [
        {
        type: 'category',
        boundaryGap: false,
        axisLine: {
         
        },
        // axisLabel: {
        //     margin: 10
        // },
        axisTick: {
            show: false
        },
        data: this.dateList
    }],
    grid: {
            left: '2%',
            right: '2%',
            bottom: '2%',
            top:'14%',
            containLabel: true
        },
    yAxis: [{
        type: 'value',
        name: 'unit(%）',
        axisTick: {
            show: false
        },
		// max:100,
        // axisLabel: {
        //     margin: 10
        // },
        splitLine: {
            show: false,
            lineStyle: {
                color: '#57617B'
            }
        }
    }],
    series: [ {
        name: 'error rate',
        type: 'line',
        stack: '总量',
        smooth: true,
        // symbol: 'circle',
        symbolSize: 5,
        // showSymbol: true,
        animationDelay: 0,
        animationDuration: 1000,
    
        // lineStyle: {
        //     normal: {
        //         width: 1,
        //         color: {
        //             type: 'linear',
        //             x: 0,
        //             y: 0,
        //             x2: 1,
        //             y2: 0,
        //             colorStops: [{
        //                 offset: 0, color: 'red' // 0% 处的颜色
        //             }, {
        //                 offset: 1, color: 'yellowgreen' // 100% 处的颜色
        //             }],
        //             globalCoord: false // 缺省为 false
        //         },
        //         opacity: 0.9
        //     }
        // },
        // areaStyle: {
        //     normal: {
        //         color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
        //             offset: 0,
        //             color: 'rgba(219, 50, 51, 0.3)'
        //         }, {
        //             offset: 0.8,
        //             color: 'rgba(219, 50, 51, 0)'
        //         }], false),
        //         shadowColor: 'rgba(0, 0, 0, 0.1)',
        //         shadowBlur: 10
        //     }
        // },
         itemStyle: {
                color: 'rgb(255, 70, 131)'
            },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgb(255, 158, 68)'
                }, {
                    offset: 1,
                    color: 'rgb(255, 70, 131)'
                }])
            },
           lineStyle: {
                normal: {
                    width: 1
                }
            },
        data: this.valueList
    }, ]
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

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
    backgroundColor: "#fff",
     title: {
              text: 'Throughput',
              textStyle: {
                fontWeight: 'normal',
                fontSize: 16
            },
              x: 'center',
          },
    tooltip: {
      trigger: 'axis', 
            axisPointer: {
            }
		},
		   grid: {
            left: '2%',
            right: '2%',
            bottom: '2%',
            top:'14%',
            containLabel: true
        },
		xAxis: [{
			type: 'category',
			boundaryGap: false,
			axisLine: { //坐标轴轴线相关设置。数学上的x轴
				 show: true,
				 lineStyle: {
					//  color: '#233e64'
				 },
			 },
			//  axisLabel: { //坐标轴刻度标签的相关设置
			// 	 textStyle: {
			// 		 color: '#6a9cd5',
			// 		 margin:15,
			// 	 },
			//  },
			 axisTick: { show: false,},
			data: this.dateList,
		}],
		yAxis: [{
            name: 'unit（rpm）',
			type: 'value',
			// splitNumber: 7,
			splitLine: {
				 show: false,
				 lineStyle: {
					 color: '#233e64'
				 }
			 },
			 axisLine: {show: true,},
			//  axisLabel: {
			//  	margin:20,
			// 	 textStyle: {
			// 		 color: '#6a9cd5',
					 
			// 	 },
			//  },
			 axisTick: { show: false,},  
		}],
		series: [{
			name: 'rpm',
			type: 'line',
			smooth: true, //是否平滑曲线显示
			// symbol:'circle',  // 默认是空心圆（中间是白色的），改成实心圆
			symbolSize:5,
      
        // lineStyle: {
        //       normal: {
        //         width: 2,
        //         color: '#7cedc4'
        //       }
        //     },
        //     itemStyle: {
        //       normal: {
        //         color: '#7cedc4'
        //       }
        //     },
        //     areaStyle: {
        //       normal: {
        //         color: '#7cedc4',
        //         origin: 'auto'
        //       }
        //     },
      
      // lineStyle: {
			// 	normal: {
			// 		color: "#3deaff"   // 线条颜色
			// 	}
      // },
       itemStyle: {
                normal: {
                    color: '#3deaff',
                    // borderColor:'#e48b4c'
                },
            },
			areaStyle: { //区域填充样式
                normal: {
                 //线性渐变，前4个参数分别是x0,y0,x2,y2(范围0~1);相当于图形包围盒中的百分比。如果最后一个参数是‘true’，则该四个值是绝对像素位置。
                   color: 'rgba(61,234,255, 0.9)',
          //          new echarts.graphic.LinearGradient(0, 0, 0, 1, [
					//    { offset: 0,  color: 'rgba(61,234,255, 0.9)'}, 
					//    { offset: 1,  color: 'rgba(61,234,255, 0)'}
				  //  ], false),

                //  shadowColor: 'rgba(53,142,215, 0.9)', //阴影颜色
                //  shadowBlur: 20 //shadowBlur设图形阴影的模糊大小。配合shadowColor,shadowOffsetX/Y, 设置图形的阴影效果。
             }
         },

			data: this.valueList
		}]
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

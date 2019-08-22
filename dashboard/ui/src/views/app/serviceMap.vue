<template>
  <div style="background:white !important">
    <span style="float:right;margin-right:20px">
        <Tag style="width:30px;height:15px;border:none" :style="{background:tagColor(0)}"></Tag>
        <span class="font-size-12">application</span> 
        <!-- <Tag style="width:30px;height:15px;border:none" class="margin-left-10" :style="{background:tagColor(1)}"></Tag>
        <span class="font-size-12">数据库/中间件</span>  -->
    </span>

    <div :id="id" class="app-service-map" style="width:calc(100vw - 300px);height:calc(100vh - 200px)"></div>
  </div>

  
</template>

<script>
import request from '@/utils/request' 
import echarts from "echarts";
export default {
  data() {
    return {
      id : 'app-service-map-id',
      chart: null,
      lineLength: 200,
      primaryNodeSize: 40,
      smallNodeSize: 20,
      lineLabelSize: 12,
      repulsion: 500
    };
  },
  watch: {
    "$store.state.apm.selDate"() {
      this.initServiceMap()
    },
    "$store.state.apm.appName"() {
      this.initServiceMap()
    }
  },
  mounted() {
    this.initServiceMap()
  },
  beforeDestroy() {
    this.destroyChart()
  },
  methods: {
    destroyChart() {
       if (this.chart) {
        this.chart.dispose();
        this.chart = null;
      }
    },
    tagColor(tp) {
      switch (tp) {
        case 0: //普通应用
           return "#20a8d8"
          break;
        case 1: // 数据库中间件
          return  '#c8ced3'
        default:
          break;
      }
     
      
    },
    initServiceMap() {
      this.destroyChart()
      this.$Loading.start();
        request({ 
            url: '/web/appServiceMap',
            method: 'GET',
            params: {
              app_name: this.$store.state.apm.appName,
              start: JSON.parse(this.$store.state.apm.selDate)[0],
              end: JSON.parse(this.$store.state.apm.selDate)[1],
            }
        }).then(res => {
          this.$Loading.finish();
           if (res.data.data.nodes.length == 0) {
              this.$Message.warning({
                content: '暂无数据',
                duration: 4
              })
          } else {
            this.initChart(res.data.data.nodes,res.data.data.links)
          }
        }).catch(error => {
            this.$Loading.error();
          })
      },
    formatLinkLabel(link) {
      var error = 0
      if (link.access_count > 0) {
        error = (link.error_count / link.access_count) * 100
        error = error.toFixed(1);
      }
      return link.access_count + '/' + error + '%/' + link.avg + 'ms'
    },
    calcSize(nodes) {
        var l = nodes.length 
        if (l < 20) {
            this.lineLength = 200
            this.primaryNodeSize = 10
            this.smallNodeSize = 10
            this.lineLabelSize = 11
            this.repulsion = 500
            return
        }

        if (l < 40) {
           this.lineLength = 200
            this.primaryNodeSize = 
            this.smallNodeSize = 20
            this.lineLabelSize = 11
            this.repulsion = 500
            return
        }

        if (l < 80) {
            this.lineLength = 200
            this.primaryNodeSize = 30
            this.smallNodeSize = 15
            this.lineLabelSize = 10
            this.repulsion = 500
            return
        }

         this.lineLength = 100
        this.primaryNodeSize = 30
        this.smallNodeSize = 10
        this.lineLabelSize = 9
        this.repulsion = 500
    },
    initChart(nodes,links) {
      console.log(nodes,links)
      this.chart = echarts.init(document.getElementById(this.id));
      for (var j = 0; j < nodes.length; j++) {
        // 设置node的样式
        nodes[j].symbolSize = this.smallNodeSize;
        nodes[j].itemStyle = {
          normal: {
            color: '#20a8d8',
          }
        };
        // node错误率超过一个值，则添加特殊显示
        if (nodes[j].span_count > 0) {
          if ((nodes[j].error_count / nodes[j].span_count) > 0.2){
            nodes[j].label = {
              normal: {
                color: "#ff0000"
              }
            };
          }
        }

        // 对当前node进行特殊标示
        if (nodes[j].name == this.$store.state.apm.appName) {
             nodes[j].symbolSize = this.primaryNodeSize;
             nodes[j].itemStyle = {
              normal: {
                color: '#20a8d8'
              }
            };     
        }

         // 对于数据库/中间件node进行特殊展示
        // if (nodes[j].category == 1) {
        //   nodes[j].itemStyle = {
        //         normal: {
        //           color: '#c8ced3',
        //         }
        //       }; 
        // } 
      }


      this.calcSize(nodes)
      for (var i = 0; i < links.length; i++) {
        var color = "#20a8d8";
        if (links[i].access_count > 0) {
          if ((links[i].error_count / links[i].access_count) > 0.2 ) {
            color = "#f86c6b";
          }
        }

        links[i].label = {
          normal: {
            show: true,
            formatter: this.formatLinkLabel(links[i]),
            fontSize: this.lineLabelSize
          }
        };

        links[i].lineStyle = {
          normal: {
            color: color,
            width: 1,
            curveness: 0
          }
        };
      }
      var option = {
        series: [
          {
            type: "graph",
            layout: "force",
            force: {
              repulsion: 2000,
              edgeLength: this.lineLength
              // layoutAnimation: false
            },
            name: "应用",
            roam: true,
            draggable: true,
            focusNodeAdjacency: true,
            symbolSize: 20,
            label: {
              normal: {
                show: true,
                position: "bottom",
                color: "#12b5d0"
                // fontSize:10
              }
            },
            edgeSymbol: ["none", "arrow"],
            lineStyle: {
              normal: {
                width: 1,
                shadowColor: "none"
              }
            },
            edgeSymbolSize: 8,
            data: nodes,
            links: links,
            itemStyle: {
              normal: {
                label: {
                  show: true,
                  formatter: function(item) {
                    return item.data.name;
                  }
                }
              }
            }
          }
        ]
      };
      this.chart.setOption(option);


      function nodeOnClick(params) {
        
      }
      this.chart.on("click", nodeOnClick);
    }
  }
};
</script>
<template>
  <div>
    <Row>
      <Col span="22" offset="1" class="no-border card margin-top-10">
        <Table stripe  :columns="apiLabels" :data="apiStats.slice((this.currentApiPage-1)*10,this.currentApiPage*10)" @on-sort-change="sortApi">
          <template slot-scope="{ row }" slot="api">
            <Tooltip  :max-width="600" :delay="400" placement="top-start"  :transfer="true">
                {{row.api}}
                <div slot="content">                                  
                  <!-- <div><Tag style="background: #F28F20;border:none;" size="medium" class="margin-right-10">Method</Tag>{{row.method}}</div> -->
                  <div>{{row.api}}</div>
                </div>
            </Tooltip>     
          </template>

          <template slot-scope="{ row }" slot="operation">
              <Button size="small" type="text" @click="apiDetail(row)">查看方法</Button>
              <Button size="small" type="primary" ghost @click="apiDashboard(row)">详细图表</Button>
            </template>
        </Table>

        <Page :current="currentApiPage" :total="apiStats.length" size="small" class="margin-top-15" simple  @on-change="setApiPage"/>
      </Col>
    </Row>


    <Modal v-model="modalVisible" :footer-hide="true" :z-index="500" fullscreen>
        <div slot="header" style="padding-top:5px;padding-bottom:0px;border-bottom:none">
            <div class="font-size-16" style="font-weight:bold">{{$store.state.apm.appName}} : {{tempApi.api}}</div>
            <div  style="margin-top:13px;font-weight:bold;font-size:12px">
              <span class="meta-word">
                平均耗时:
              </span>
              {{tempApi.average_elapsed}} ms

              <span class="meta-word">
                请求次数:
              </span>
              {{tempApi.count}}
            </div>
        </div>

        <div class="padding-top-10 no-border">
          <Row>
            <Col span="24" offset="0">
              <Table stripe :columns="methodLabels" :data="detailApi.slice((this.currentMethodPage-1)*10,this.currentMethodPage*10)" class="margin-top-20"  @on-sort-change="sortMethod">
              </Table>
              <Page :current="currentMethodPage" :total="detailApi.length" size="small" class="margin-top-15" simple  @on-change="setMethodPage"/>
            </Col>
          </Row>
     

        

        </div>
    </Modal>

    <Modal v-model="dashVisible" :footer-hide="true">
             <rpm width="430px" height="200px" id="apm-rpm" :dateList="dateList" :valueList="countList"></rpm>
             <error width="430px" height="200px" id="apm-error" :dateList="dateList" :valueList="errorList" class="margin-top-20"></error>
            <respTime width="430px" height="200px" id="apm-resp" :dateList="dateList" :valueList="elapsedList" class="margin-top-20"></respTime>
    </Modal>
  </div>   
</template>

<script>
import request from '@/utils/request' 
import echarts from 'echarts'
import error from '@/views/components/Charts/error'
import respTime from '@/views/components/Charts/respTime'
import rpm from '@/views/components/Charts/rpm'

export default {
  name: 'interface',
  components: {error,respTime,rpm},
   watch: {
    "$store.state.apm.selDate"() {
            this.initStats()
    },
    "$store.state.apm.appName"() {
            this.initStats()
    }
  },
  computed: {

  },
  methods: {
    // 加载api的详细图表
    apiDashboard(r) {
      this.$Loading.start();
      // 加载当前APP的dashbord数据
      request({
          url: '/web/apiDash',
          method: 'GET',
          params: {
              app_name: this.$store.state.apm.appName,
              start: JSON.parse(this.$store.state.apm.selDate)[0],
              end: JSON.parse(this.$store.state.apm.selDate)[1],
              api: r.api
          }
      }).then(res => {   
          this.dateList = res.data.data.timeline
          this.countList = res.data.data.count_list
          this.elapsedList = res.data.data.elapsed_list
          this.errorList = res.data.data.error_list

          this.dashVisible = true
          console.log(res.data.data)
          this.$Loading.finish();
      }).catch(error => {
        this.$Loading.error();
      })
    },
    sortApi(val) {
      switch (val.key) {
        case "average_elapsed": // 平均耗时排序
          if (val.order=='asc') {
            this.apiStats.sort(function(api1,api2){
                return api1.average_elapsed - api2.average_elapsed;
            });
          } else {
            this.apiStats.sort(function(api1,api2){
                return api2.average_elapsed - api1.average_elapsed;
            });
          }
          break;
        case "count":
          if (val.order=='asc') {
            this.apiStats.sort(function(api1,api2){
                return api1.count - api2.count;
            });
          } else {
            this.apiStats.sort(function(api1,api2){
                return api2.count - api1.count;
            });
          }
          break;
        case "error_count":
          if (val.order=='asc') {
            this.apiStats.sort(function(api1,api2){
                return api1.error_count - api2.error_count;
            });
          } else {
            this.apiStats.sort(function(api1,api2){
                return api2.error_count - api1.error_count;
            });
          }
          break;
        default:
          break;
      }
    },
    sortMethod(val) {
      switch (val.key) {
        case "average_elapsed": // 平均耗时排序
          if (val.order=='asc') {
            this.detailApi.sort(function(api1,api2){
                return api1.average_elapsed - api2.average_elapsed;
            });
          } else {
            this.detailApi.sort(function(api1,api2){
                return api2.average_elapsed - api1.average_elapsed;
            });
          }

          break;
        case "count":
          if (val.order=='asc') {
            this.detailApi.sort(function(api1,api2){
                return api1.count - api2.count;
            });
          } else {
            this.detailApi.sort(function(api1,api2){
                return api2.count - api1.count;
            });
          }
          break;
        case "error_count":
          if (val.order=='asc') {
            this.detailApi.sort(function(api1,api2){
                return api1.error_count - api2.error_count;
            });
          } else {
            this.detailApi.sort(function(api1,api2){
                return api2.error_count - api1.error_count;
            });
          }
          break;
        case "ratio_elapsed": 
           if (val.order=='asc') {
            this.detailApi.sort(function(api1,api2){
                return api1.ratio_elapsed - api2.ratio_elapsed;
            });
          } else {
            this.detailApi.sort(function(api1,api2){
                return api2.ratio_elapsed - api1.ratio_elapsed;
            });
          }
        default:
          break;
      }
    },
    setMethodPage(page) {
      this.currentMethodPage = page
    },
    setApiPage(page) {
      this.currentApiPage = page
    },
    apiDetail(api) {
      this.$Loading.start();
      request({
            url: '/web/apiDetail',
            method: 'GET',
            params: {
                app_name: this.$store.state.apm.appName,
                api: api.api,
                start: JSON.parse(this.$store.state.apm.selDate)[0],
                end: JSON.parse(this.$store.state.apm.selDate)[1]
            }
        }).then(res => {   
            this.detailApi = res.data.data
            this.tempApi = api
            this.modalVisible = true 

            this.$Loading.finish();
        }).catch(error => {
          this.$Loading.error();
        })
    },
    initStats() {
       this.$Loading.start();
       request({
            url: '/web/apiStats',
            method: 'GET',
            params: {
                app_name: this.$store.state.apm.appName,
                start: JSON.parse(this.$store.state.apm.selDate)[0],
                end: JSON.parse(this.$store.state.apm.selDate)[1],
            }
        }).then(res => {   
            this.apiStats = res.data.data
            // 初始化时，默认对平均耗时排序
            this.sortApi({key:'count',order:'desc'})

            this.$Loading.finish();
        }).catch(error => {
          this.$Loading.error();
        })
    }
  },
  mounted() {
    this.initStats()
    echarts.connect('group-dashboard');
  },
  data () {
    return {
      apiStats: [],
      dateList: [],
      countList: [],
      elapsedList: [],
      errorList: [],
      dashVisible: false,
      apiLabels: [
            {
                title: 'API',
                slot: 'api',
                ellipsis : true,
                width: 250
            },
            {
                title: '均耗时(ms)',
                key: 'average_elapsed',
                width:170,
                sortable: 'custom'
            },
            {
                title: '请求数',
                key: 'count',
                width: 170,
                sortable: 'custom'
            },
            {
                title: '错误数',
                key: 'error_count',
                width: 170,
                sortable: 'custom'
            },
             {
                title: '最大耗时(ms)',
                key: 'max_elapsed',
                width: 150
            },
            {
                title: '操作',
                slot: 'operation',
                width: 170,
                align: 'center'
            },
        ],
      methodLabels: [
            {
                title: 'Method',
                key: 'method'
            },
            {
                title: '服务类型',
                key: 'service_type',
                width: 150
            },
            {
              title: '代码行',
                key: 'line',
                width: 100
            },
            {
              title: '耗时占比(%)',
                key: 'ratio_elapsed',
                width: 100,
                sortable: 'custom'
            },
            {
                title: '均耗时(ms)',
                key: 'average_elapsed',
                width:100,
                sortable: 'custom'
            },
            {
                title: '请求数',
                key: 'count',
                width: 100,
                sortable: 'custom'
            },
            {
                title: '错误数',
                key: 'error_count',
                width: 100,
                sortable: 'custom'
            },
             {
                title: '最大耗时(ms)',
                key: 'max_elapsed',
                width: 250
            },
            {
                title: '最小耗时(ms)',
                key: 'min_elapsed',
                width: 100
            },
        ],

      detailApi: [],

      currentApiPage : 1,
      currentMethodPage: 1,

      modalVisible: false,
      tempApi : {}
    }
  }
}
</script>

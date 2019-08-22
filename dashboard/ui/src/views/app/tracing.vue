<template>
  <div class="apm tracing">
    <Row>
      <Col span="7" class="card">
        <div class="font-size-16">
          Traces Query
          <Tooltip max-width="400" :transfer="true" class="margin-right-10">
            <Icon
              type="ios-help-circle-outline"
              style="margin-top:-3px;font-size:16px"
              class="margin-left-5"
            />
            <div slot="content" style="padding: 15px 15px">
              <div class="font-size-18 font-weight-500" style="line-height:20px">链路跟踪</div>
              <div>跟踪每次请求经过的完整链路</div>

              <div class="font-size-18 font-weight-500" style="line-height:20px">查询</div>
              <div>设定过滤条件后，点击查询，会出现一张坐标轴散点图</div>
              <div>
                <span
                  class="color-orange"
                >若您查询的时间范围较大(e.g. 6个小时以上)，请设置精细过滤条件，例如最小耗时大于500ms，这样可以大大加快查询速度</span>
              </div>
              <div class="font-size-18 font-weight-500" style="line-height:20px">选择点</div>
              <div>在散点图中，用鼠标滑动，选中某个范围，然后在这个范围的点会在下方以列表展示</div>

              <div class="font-size-18 font-weight-500" style="line-height:20px">查看详细链路</div>
              <div>双击列表的行或者点击查看详细，可以打开链路详情页面</div>
            </div>
          </Tooltip>
          <Button
            ghost
            type="primary"
            style="float:right;padding-left:15px;padding-right:15px;"
            size="small"
            @click="queryTraces"
          >Submit</Button>
        </div>
        <div class="margin-top-20 no-border">
          <div class="font-size-12">API</div>
          <Select
            v-model="currentApi"
            style="width:100%"
            size="large"
            class="api-filter"
            placeholder="default no limit"
            filterable
            clearable
          >
            <Option v-for="api in apis" :value="api" :key="api">{{ api }}</Option>
          </Select>
        </div>
        <!-- <div class="margin-top-10 no-border">
            <div class="font-size-12">客户端地址(remote addr)</div>
            <Input class="margin-top-5" v-model="remoteAddr" placeholder="e.g.  10.0.0.1" style="width: 100%;border:none;" size="large" :clearable="true" />
        </div>-->
        <Row
          class="margin-top-15 no-border"
          style="border-bottom: 1px solid #ddd;padding-bottom:25px"
        >
          <Col span="11">
            <div class="font-size-12">Min Duration(ms)</div>
            <Input
              class="margin-top-5"
              v-model="minElapsed"
              placeholder="e.g.  100"
              style="width: 100%;border:none;"
              size="large"
            />
          </Col>
          <Col span="11" offset="2">
            <div class="font-size-12">Max Duration(ms)</div>
            <Input
              class="margin-top-5"
              v-model="maxElapsed"
              placeholder="empty : no limit"
              style="width: 100%"
              size="large"
            />
          </Col>
        </Row>
        <Row
          class="margin-top-15 no-border"
          style="border-bottom: 1px solid #ddd;padding-bottom:25px"
        >
          <Col span="11">
            <div class="font-size-12">Limit Results</div>
            <InputNumber
              :max="1000"
              :min="1"
              :step="5"
              v-model="resultLimit"
              style="width: 100px;margin-bottom:-17px"
              size="medium"
            ></InputNumber>
          </Col>
          <Col span="10" offset="2">
            <div class="font-size-12">Error Only</div>
            <i-switch v-model="searchError" class="margin-top-10 margin-left-5"/>
          </Col>
        </Row>

        <div class="margin-top-15 no-border">
          <div class="font-size-12">Query by TraceID</div>
          <Input
            class="margin-top-5"
            v-model="searchTraceID"
            placeholder="the highest priority when setted"
            style="width: 100%"
            size="large"
            @on-blur="inputTraceID"
            @keyup.enter.native="queryTraces"
            :clearable="true"
            @on-clear="clearSearchTraceID"
          />
        </div>
      </Col>
      <Col span="16" offset="1">
        <trace
          :graphData="tracesData"
          v-if="tracesData.is_suc==true"
          style="height: 395px"
          @selTraces="selectTraces"
        ></trace>
      </Col>
    </Row>

    <div v-show="selectedTraces.length > 0" class="margin-top-30">
      <span style="float:right">
        <Tag class="bg-info" size="large">{{selSucCount}} Success</Tag>
        <Tag class="bg-error" size="large">{{selErrCount}} Error</Tag>
      </span>
      <span class="no-border">
        <Select
          style="width:200px"
          placeholder="api filtering"
          v-model="selTableFitlers"
          clearable="true"
          @on-clear="clearTableFilters"
        >
          <Option v-for="f in tableFilters" :value="f.api" :key="f.api">{{ f.api }} - {{f.count}}</Option>
        </Select>
      </span>

      <div
        class="margin-bottom-40 no-border"
      >
        <Table
          :row-class-name="rowClassName"
          :columns="traceLabels"
          :data="showTraceTable()"
          class="margin-top-10 table-cursor-pointer"
          @on-row-dblclick="showTrace"
        >
          <template slot-scope="{ row }" slot="operation">
            <Icon type="ios-eye" style="color: #777" @click="showTrace(row)"/>
          </template>
        </Table>
      </div>
    </div>

    <!-- 链路展示Modal -->
    <Modal
      v-model="traceVisible"
      :footer-hide="true"
      :z-index="500"
      class="tracing-modal"
      fullscreen
    >
      <Row slot="header" style="padding-top:0px;padding-bottom:0px;border-bottom:none;height:80px;">
        <Col span="12">
          <div
            class="font-size-16 margin-top-30"
            style="font-weight:bold"
          >{{$store.state.apm.appName}} : {{selectedTrace.api}}</div>
          <div style="margin-top:13px;font-weight:bold;font-size:12px" class="color-light">
            <span>Time:</span>

            {{selectedTrace.showTime}}
            <span class="margin-left-5">Duration:</span>

            {{selectedTrace.elapsed}}ms
            <span class="margin-left-5">TraceID:</span>
            {{selectedTrace.traceId}}
          </div>
        </Col>
        <Col span="12" style="margin-top:-8px">
          <Row>
            <Col span="8">
              <blueLineChart
                width="240px"
                height="130px"
                id="tracing-jvmcpu"
                :titleFontSize="12"
                name2="jvm"
                name1="system"
                title="cpu"
                :timeline="timeline"
                :valueList2="jvmCpuList"
                :valueList1="systemCpuList"
                :group="chartGroup"
                :showXAxis="false"
              ></blueLineChart>
            </Col>
            <Col span="8">
              <greenLineChart
                width="240px"
                height="130px"
                id="tracing-jvmheap"
                :titleFontSize="12"
                title="heap"
                name1="heap max"
                name2="heap usage"
                :timeline="timeline"
                :valueList1="heapMaxList"
                :valueList2="jvmHeapList"
                :group="chartGroup"
                :showXAxis="false"
              ></greenLineChart>
            </Col>
            <Col span="8">
              <redLineChart
                width="240px"
                height="130px"
                id="tracing-fullgc"
                :titleFontSize="12"
                title="fullgc"
                name2="duration"
                :timeline="timeline"
                :valueList2="fullgcDurationList"
                :group="chartGroup"
                :showXAxis="false"
              ></redLineChart>
            </Col>
          </Row>
        </Col>
      </Row>

      <div class="trace-pane" style="padding-bottom:50px;padding-top:27px">
        <Row>
          <Col span="13" class="title split-border">Method</Col>
          <Col span="4" class="title">Params</Col>
          <Col span="2" class="title">Duration(ms)</Col>
          <Col span="3" class="title">Service Type</Col>
          <Col span="2" class="title">Application</Col>
        </Row>
        <div class="body">
          <Row
            v-for="r in traceData"
            v-show="isShow(r)"
            class="hover-cursor"
            @click.native="nodeDetail(r)"
            :class="classObject(r)"
          >
            <Col span="13" class="item split-border" :style="{paddingLeft:r.depth * 15 +'px'}">
              <Icon
                v-if="r.show=='expand'"
                type="md-add"
                @click.stop="expand(r)"
                style="padding:3px 3px"
              />
              <Icon
                v-else-if="r.show=='collapse'"
                type="ios-remove"
                @click.stop="collapse(r)"
                style="padding:3px 3px"
              />
              <!-- 这里的padding-left是为了让没有展开/收缩符号的文字跟有符号的文字左对齐 -->
              <span :style="{paddingLeft:calcTextMarginLeft(r)+'px'}">
                <Icon v-show="r.icon=='hand'" type="ios-hand"/>
                <Icon v-show="r.icon=='bug'" type="ios-bug"/>
                <Icon v-show="r.icon=='info'" type="md-information-circle"/>
                {{getMethod(r.method)}}
              </span>
            </Col>
            <Col span="4" class="item">{{r.params}}</Col>
            <Col span="2" class="item" style="padding-left:25px">{{showDuration(r.duration)}}</Col>
            <Col span="3" class="item">{{r.service_type}}</Col>
            <Col span="2" class="item">{{r.app_name}}</Col>
          </Row>
        </div>
      </div>
    </Modal>

    <Drawer
      :title="selNode.method"
      :closable="false"
      v-model="isNodeSel"
      :styles="{'z-index':2000}"
      width="40"
      class="tracing-drawer"
    >
      <Form :label-width="100" label-position="left">
        <FormItem label="Mehod">{{selNode.method}}</FormItem>
        <FormItem label="Class">{{selNode.class}}</FormItem>
        <FormItem label="Duration(ms)">{{selNode.duration}}</FormItem>
        <FormItem label="Application">{{selNode.app_name}}</FormItem>
        <FormItem label="AgentID">{{selNode.agent_id}}</FormItem>
        <FormItem label="ServiceType">{{selNode.service_type}}</FormItem>
        <FormItem label="Params">{{selNode.params}}</FormItem>

        <Divider orientation="center">Debug Part</Divider>
        <FormItem label="id">{{selNode.id}}</FormItem>
        <FormItem label="span id">{{selNode.span_id}}</FormItem>
        <FormItem label="method id">{{selNode.method_id}}</FormItem>
        <FormItem label="sequence">{{selNode.seq}}</FormItem>
        <FormItem label="span depth">{{selNode.span_depth}}</FormItem>
        <FormItem label="node type">{{selNode.type}}</FormItem>
        <FormItem label="destination id">{{selNode.did}}</FormItem>
        <FormItem label="next span id">{{selNode.nid}}</FormItem>
      </Form>
    </Drawer>
  </div>
</template>

<script>
import request from "@/utils/request";
import echarts from "echarts";
import trace from "@/views/components/Charts/trace";
import blueLineChart from "@/views/components/Charts/blueLineChart";
import greenLineChart from "@/views/components/Charts/greenLineChart";
import redLineChart from "@/views/components/Charts/redLineChart";
import { formatTime } from "@/utils/tools";
export default {
  name: "tracing",
  components: { trace, blueLineChart, greenLineChart, redLineChart },
  data() {
    return {
      tracesData: {},
      traceData: {},
      resultLimit: 200,
      minElapsed: null,
      maxElapsed: null,
      selectedTraces: [],
      searchError: false,
      searchTraceID: "",
      remoteAddr: "",
      apis: [],
      currentApi: "",

      chartGroup: "tracing",

      traceLabels: [
        {
          title: "Time",
          key: "showTime",
          width: 170,
          sortable: true
        },
        {
          title: "API",
          key: "api",
          width: 250
        },
        {
          title: "Duration(ms)",
          key: "elapsed",
          width: 140,
          sortable: true
        },
        {
          title: "Agent ID",
          key: "agentId",
          width: 150
        },
        {
          title: "Remote Addr",
          key: "remote_addr",
          width: 150
        },
        {
          title: "Trace ID",
          key: "traceId",
          sortable: true,
          width: 150
        },
        {
          title: "Error",
          key: "errCode",
          sortable: true,
          width: 100
        },
        {
          title: "Detail",
          slot: "operation",
          width: 100,
          align: "center"
        }
      ],

      selSucCount: 0,
      selErrCount: 0,

      traceVisible: false,

      selectedTrace: {},

      split1: 0.3,
      selNode: {},
      isNodeSel: false,
      collapseList: [],

      // 0: 同时显示成功、错误的点
      // 1: 只显示成功的点
      // 2: 只显示错误的点
      tableFilter: 0,

      timeline: [],
      jvmCpuList: [],
      systemCpuList: [],
      jvmHeapList: [],
      heapMaxList: [],
      fullgcDurationList: [],
      tableFilters: [],
      selTableFitlers: undefined
    };
  },
  watch: {
    "$store.state.apm.appName"() {
      this.apiList();
    }
  },
  computed: {},
  methods: {
    clearSearchTraceID() {
      window.history.pushState(
        {},
        0,
        "http://" +
          window.location.host +
          window.location.pathname +
          "?app_name=" +
          this.$store.state.apm.appName +
          "&date_range=" +
          this.$store.state.apm.selDate
      );
    },
    inputTraceID() {
      // 更新url中的trace_id 11
      if (this.searchTraceID != "") {
        window.history.pushState(
          {},
          0,
          "http://" +
            window.location.host +
            window.location.pathname +
            "?app_name=" +
            this.$store.state.apm.appName +
            "&date_range=" +
            this.$store.state.apm.selDate +
            "&trace_id=" +
            this.searchTraceID
        );
      } else {
        window.history.pushState(
          {},
          0,
          "http://" +
            window.location.host +
            window.location.pathname +
            "?app_name=" +
            this.$store.state.apm.appName +
            "&date_range=" +
            this.$store.state.apm.selDate
        );
      }
    },
    showTraceTable() {
      var traces = [];
      for (var i = 0; i < this.selectedTraces.length; i++) {
        var trace = this.selectedTraces[i];
        if (this.selTableFitlers == undefined) {
          traces.push(trace);
        } else {
          if (trace.api == this.selTableFitlers) {
            traces.push(trace);
          }
        }
      }

      return traces;
    },
    showDuration(d) {
      if (d == -1) {
        return "";
      }

      return d;
    },
    calcTextMarginLeft(r) {
      if (r.show != "expand" && r.show != "collapse") {
        return 21;
      }
      return 0;
    },
    expand(r) {
      r.show = "collapse";
      for (var i = 0; i < this.collapseList.length; i++) {
        if (this.collapseList[i] == r.id) {
          this.collapseList.splice(i, 1);
        }
      }
    },
    collapse(r) {
      r.show = "expand";
      this.collapseList.push(r.id);
    },
    queryTraces() {
      this.$Loading.start();
      request({
        url: "/web/queryTraces",
        method: "GET",
        params: {
          app_name: this.$store.state.apm.appName,
          api: this.currentApi,
          min_elapsed: this.minElapsed,
          max_elapsed: this.maxElapsed,
          limit: this.resultLimit,
          search_error: this.searchError,
          search_trace_id: this.searchTraceID.trim(),
          remote_addr: this.remoteAddr,
          start: JSON.parse(this.$store.state.apm.selDate)[0],
          end: JSON.parse(this.$store.state.apm.selDate)[1]
        }
      })
        .then(res => {
          this.tracesData = res.data.data;
          this.selectedTraces = [];
          console.log("query traces:", this.tracesData);
          this.$Loading.finish();
          if (!this.tracesData.is_suc) {
            this.$Message.warning({
              content: "暂无数据",
              duration: 4
            });
          }
        })
        .catch(error => {
          this.$Loading.error();
        });
    },
    isShow(r) {
      // 对于collapseList中的每个值，判断当前行是否在它的子树中，若在，则不显示，跳出循环
      // 若当前name是以collapseList的值为前缀，说明在子树中
      for (var i = 0; i < this.collapseList.length; i++) {
        if (r.id == this.collapseList[i]) {
          continue;
        }
        var j = r.id.indexOf(this.collapseList[i]);
        if (j == 0) {
          return false;
        }
      }
      return true;
    },
    nodeDetail(r) {
      this.selNode = r;
      this.isNodeSel = true;
    },
    classObject: function(r) {
      var o = {};
      o[r.id] = true;
      if (r.is_error) {
        o["error"] = true;
      }
      if (r.agent_id == this.selectedTrace.agentId && r.span_depth == 0) {
        o["current-span"] = true;
      }
      return o;
    },
    getMethod(s) {
      var i = s.split("(");
      return i[0];
    },
    rowClassName(row, index) {
      if (row.errCode == 1) {
        return "error-trace";
      } else {
        return "success-trace";
      }
    },
    selectTraces(traces) {
      // 计算filters
      this.tableFilters = [];
      for (var i = 0; i < traces.length; i++) {
        var trace = traces[i];
        var exist = false;
        for (var j = 0; j < this.tableFilters.length; j++) {
          var filter = this.tableFilters[j];
          if (filter.api == trace.api) {
            filter.count = filter.count + 1;
            exist = true;
            break;
          }
        }

        if (!exist) {
          this.tableFilters.push({
            api: trace.api,
            count: 1
          });
        }
      }

      this.selectedTraces = traces;
      var ec = 0,
        sc = 0;
      for (var i = 0; i < traces.length; i++) {
        if (traces[i].errCode == 1) {
          ec += 1;
        } else {
          sc += 1;
        }
      }

      this.selErrCount = ec;
      this.selSucCount = sc;
    },
    showTrace(t) {
      this.selectedTrace = t;
      this.$Loading.start();
      // 查询trace详情
      request({
        url: "/web/trace",
        method: "GET",
        params: {
          trace_id: t.traceId
        }
      })
        .then(res => {
          this.traceData = res.data.data;
          for (var i = 0; i < this.traceData.length; i++) {
            if (this.traceData[i].span_depth != -1) {
              this.traceData[i].show = "collapse";
            }
          }
          this.traceVisible = true;
          this.collapseList = [];

          this.$Loading.finish();
        })
        .catch(error => {
          this.$Loading.error();
        });

      this.dashboard(this.selectedTrace.agentId, this.selectedTrace.startTime);
    },
    apiList() {
      request({
        url: "/web/appApis",
        method: "GET",
        params: {
          app_name: this.$store.state.apm.appName
        }
      }).then(res => {
        this.apis = res.data.data;
      });
    },
    // 加载JVM详细图表
    dashboard(agentID, startTime) {
      this.$Loading.start();
      // 加载当前APP的dashbord数据
      request({
        url: "/web/runtimeDashByUnixTime",
        method: "GET",
        params: {
          app_name: this.$store.state.apm.appName,
          start: startTime / 1000 - 30,
          end: startTime / 1000 + 30,
          agent_id: agentID
        }
      })
        .then(res => {
          console.log(res.data.data);
          this.timeline = res.data.data.timeline;
          this.jvmCpuList = res.data.data.jvm_cpu_list;
          this.systemCpuList = res.data.data.sys_cpu_list;
          this.jvmHeapList = res.data.data.jvm_heap_list;
          this.heapMaxList = res.data.data.heap_max_list;
          this.fullgcDurationList = res.data.data.fullgc_duration_list;

          this.$Loading.finish();
        })
        .catch(error => {
          this.$Loading.error();
        });
    },
    // 自动打开链路
    autoOpenTrace() {
      var t = this.tracesData.series[0].data[0];
      var trace = {
        showTime: formatTime(t.x),
        api: t.api,
        error: t.error,
        remote_addr: t.remote_addr,
        agentId: t.agent_id,
        traceId: t.id,
        elapsed: t.y,
        startTime: t.x
      };
      this.selectedTraces.push(trace);
      this.showTrace(trace);
    }
  },
  mounted() {
    this.apiList();
    echarts.connect(this.chartGroup);

    // 将参数中的trace_id转化为具体的搜索参数
    var traceID = this.$route.query.trace_id;
    if (traceID != undefined) {
      this.searchTraceID = traceID;
      //自动查询链路
      this.queryTraces();
    }
  }
};
</script>




<style lang="less">
 @import "../../theme/light/var.less";
.apm.tracing {
  .ivu-table .error-trace td {
    background-color: @error-color;
    color: #333;
  }

  .custom-trigger {
    cursor: col-resize;
  }

  .api-filter {
    .ivu-select-dropdown-list {
      max-width: 395px;
      // overflow: hidden;
      // text-overflow:ellipsis;
      // white-space: nowrap;
    }
  }

  .meta-word {
    margin-right: 4px;
  }
}
.trace-pane {
  .title {
    font-size: 14px;
    background: #f3f3f3;
    padding-left: 5px;
    padding-top: 6px;
    padding-bottom: 6px;
  }
  .body {
    .item {
      padding-left: 7px;
      padding-top: 8px;
      padding-bottom: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 12px;
      // line-height: 20px;
      // height: 30px;
    }
    .error {
      color: #d62727;
    }
    .hover-cursor:hover {
      background-color: #ebf7ff !important;
    }
    .current-span {
      background: #dff0d8;
      color: #1469eb;
    }
  }
}

.tracing-modal {
  .ivu-modal-header {
    padding-top: 0px !important;
    .meta-tag {
        color: @light-text-color;
    }
  }
  .ivu-modal-body {
    padding: 0;
    margin-top: 16px;
  }
}

.tracing-drawer {
  .ivu-drawer {
    .ivu-drawer-header {
      display: none;
    }

    .ivu-drawer-body {
      padding-left: 30px;
      padding-top: 30px;
    }
  }
}
</style>
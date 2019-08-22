<template>
  <div class="app-containe padding-top-10">
    <Row>
      <Col span="12" class="card">
        <respTime
          width="100%"
          height="300px"
          id="apm-resp"
          :dateList="dateList"
          :valueList="elapsedList"
        ></respTime>
      </Col>
      <Col span="12" class="card">
        <rpm width="100%" height="300px" id="apm-rpm" :dateList="dateList" :valueList="countList"></rpm>
      </Col>
    </Row>
    <Row class="margin-top-10">
      <Col span="8">
        <error
          class="card"
          width="100%"
          height="260px"
          id="apm-error"
          title="Accessed Error"
          :dateList="dateList"
          :valueList="errorList"
        ></error>
      </Col>
      <Col span="8">
        <error
          width="100%"
          height="260px"
          class="card"
          id="apm-ex-error"
          title="Exeception Error"
          :dateList="dateList"
          :valueList="exList"
        ></error>
      </Col>
      <Col span="8">
        <div class="card" style="height:260px">
          <div class="font-size-18" style="text-align:center">Recently Alerts</div>
          <div v-if="alertsList.length ==0">
            <div>
              <Icon
                type="ios-happy-outline"
                class="margin-top-30 color-primary margin-left-20"
                style="font-size:60px"
              />
            </div>
            <div class="margin-top-30 font-size-18 margin-left-5">Congrats!No alerts happened</div>
          </div>

          <div v-else class="margin-top-20">
            <div
              v-for="alert in alertsList"
              :key="alert.id"
              class="font-size-12 margin-top-10 hover-cursor"
              style="padding-right:10px"
              @click="gotoSnapshot(alert.app_name,alert.input_date)"
            >
              <span v-if="alert.tp==1" class="color-red">告警</span>
              <span v-else class="color-green">恢复</span>
              {{alert.input_date}} {{alert.api}} {{alert.alert}} {{alert.value}}
            </div>
          </div>
        </div>
      </Col>
      <Col span="24">
        <div class="card no-border margin-top-10" style="height:260px">
          <div class="font-size-18">Server Nodes Status</div>
          <Table :columns="trLabels" :data="agentList" class="margin-top-10">
            <template slot-scope="{ row }" slot="is_live">
              <Tag class="stat-tag" color="success" type="dot" v-if="row.is_live"></Tag>
              <Tag class="stat-tag" color="warning" type="dot" v-else></Tag>
            </template>
          </Table>
        </div>
      </Col>
    </Row>
  </div>
</template>

<script>
import echarts from "echarts";
import request from "@/utils/request";
import error from "@/views/components/Charts/error";
import respTime from "@/views/components/Charts/respTime";
import rpm from "@/views/components/Charts/rpm";
import { gotoAppSnapshot } from "@/utils/tools";
export default {
  name: "stats",
  components: { error, respTime, rpm },
  watch: {
    "$store.state.apm.selDate"() {
      this.initDash();
    },
    "$store.state.apm.appName"() {
      this.initDash();
    }
  },
  computed: {},
  methods: {
    gotoSnapshot(app, dateS) {
      var date = new Date(dateS);
      var date1 = new Date(date.getTime() - 240 * 1000);
      var date2 = new Date(date.getTime());
      var dates = JSON.stringify([
        date1.toLocaleString("zh", { hour12: false }).replace(/\//g, "-"),
        date2.toLocaleString("zh", { hour12: false }).replace(/\//g, "-")
      ]);

      this.$route.query.date_range = dates;
      window.history.pushState(
        {},
        0,
        "http://" +
          window.location.host +
          window.location.pathname +
          "?app_name=" +
          this.$store.state.apm.appName +
          "&date_range=" +
          dates
      );
      this.$store.dispatch("setSelDate", dates);

      // gotoAppSnapshot(app,dateS,this)
      // location.reload()
    },
    initDash() {
      var appName = this.$store.state.apm.appName;
      if (appName == "" || appName == undefined) {
        return;
      }
      this.$Loading.start();
      // 加载当前APP的dashbord数据
      request({
        url: "/dashboard/app",
        method: "GET",
        params: {
          app_name: appName,
          start: JSON.parse(this.$store.state.apm.selDate)[0],
          end: JSON.parse(this.$store.state.apm.selDate)[1]
        }
      })
        .then(res => {
          if (!res.data.data.suc) {
            this.$Message.warning({
              content: "暂无数据",
              duration: 4
            });
          }
          this.dateList = res.data.data.timeline;
          this.countList = res.data.data.count_list;
          this.elapsedList = res.data.data.elapsed_list;
          this.errorList = res.data.data.error_list;
          this.exList = res.data.data.ex_list;
          console.log(res.data.data);
          this.$Loading.finish();
        })
        .catch(error => {
          this.$Loading.error();
        });

      request({
        url: "/dashboard/app/agentList",
        method: "GET",
        params: {
          app_name: appName
        }
      }).then(res => {
        this.agentList = res.data.data;
      });

      request({
        url: "/dashboard/app/alerts",
        method: "GET",
        params: {
          limit: 5,
          app_name: appName
        }
      }).then(res => {
        this.alertsList = res.data.data;
      });
    }
  },
  mounted() {
    this.initDash();
    echarts.connect("group-dashboard");
  },
  data() {
    return {
      trLabels: [
        {
          title: "Hostname",
          key: "agent_id"
        },
        {
          title: "Container",
          key: "is_container",
          width: 200
        },
        {
          title: "Running",
          slot: "is_live",
          width: 200
        }
      ],
      dateList: [],
      countList: [],
      elapsedList: [],
      errorList: [],
      exList: [],

      agentList: [],

      alertsList: []
    };
  }
};
</script>



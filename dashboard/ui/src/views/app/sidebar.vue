<template>
  <div class="sidebar">
    <Row>
      <!-- 垂直nav -->
      <Col class="nav-left" style="height: calc(100vh - 55px);">
        <div class="left-items">
          <div v-for="i in items" :key="i" class="item item-1" v-if="level[i]==1">{{names[i]}}</div>
          <div
            class="item hover-cursor item-2"
            :class="{'selected': selItem==i}"
            @click="selectItem(i)"
            v-else
          >
            <Icon :type="getIcon(i)" style="font-size:18px;margin-top:-2px" />
            {{names[i]}}
          </div>
        </div>
      </Col>
      <Col style="background-color:white;margin-left:200px">
        <!-- 水平nav -->
        <div class="color-primary font-size-16 no-border nav-top">
          <Calendar></Calendar>
          <Tooltip
            content="select application"
            style="float:right;margin-top:4px !important"
            placement="left-start"
          >
            <Select
              v-model="$store.state.apm.appName"
              size="small"
              style="width:250px;"
              @on-change="selAppName"
              filterable
              :transfer="true"
            >
              <Option v-for="item in appNames" :value="item" :key="item">{{ item }}</Option>
            </Select>
          </Tooltip>
        </div>
        <router-view style="background:#e4e5e6;padding:10px 20px"></router-view>
      </Col>
    </Row>
  </div>
</template>

<script>
import request from "@/utils/request";
import Calendar from "@/views/components/Calendar";
export default {
  name: "apmNav",
  components: {
    Calendar
  },
  data() {
    return {
      items: [],
      level: {},

      path: "",
      selItem: "",

      selDate: [],

      appNames: [],
      icons: {}
    };
  },
  watch: {
    $route() {
      this.setDate();
      this.initItem();
    }
  },
  computed: {},
  methods: {
    selAppName(appName) {
      this.$store.dispatch("setAPPName", appName);
      // 更新浏览器url
      var q = this.$route.query;
      // console.log(q)
      var first = true;
      var url = "http://" + window.location.host + window.location.pathname;
      for (var key in q) {
        if (first) {
          if (key == "app_name") {
            url = url + "?" + key + "=" + appName;
          } else {
            url = url + "?" + key + "=" + q[key];
          }
          first = false;
        } else {
          if (key == "app_name") {
            url = url + "&" + key + "=" + appName;
          } else {
            url = url + "&" + key + "=" + q[key];
          }
        }
      }

      window.history.pushState({}, 0, url);

      this.$route.query.app_name = appName;
    },
    selectItem(i) {
      var q = this.$route.query;
      this.$router.push({
        path: "/ui/app/" + i,
        query: q
      });
    },
    getIcon(name) {
      return this.icons[name];
    },
    initItem() {
      this.path = window.location.pathname;
      this.items = [
        "dashboard",
        "monitoring",
        "tracing",
        "serviceMap",
        "apiMap",
        "runtime",
        "stats",
        "api",
        "database",
        "method",
        "exception"
      ];
      this.level = {
        monitoring: 1,
        dashboard: 2,
        tracing: 2,
        serviceMap: 2,
        apiMap: 2,
        runtime: 2,
        system: 2,
        stats: 1,
        database: 2,
        api: 2,
        exception: 2,
        method: 2,
        profiling: 1,
        profile: 2
      };
      this.names = {
        monitoring: "Monitoring",
        dashboard: "Dashboard",
        tracing: "Distribute tracing",
        serviceMap: "Service map",
        apiMap: "Api map",
        runtime: "Runtime",
        system: "基础设施",
        profiling: "诊断工具",
        profile: "日志/剖析",
        stats: "Data stats",
        database: "SQL",
        api: "Api interface",
        exception: "Exception",
        method: "Method"
      };
      this.icons = {
        dashboard: "ios-pulse-outline",
        tracing: "ios-git-commit",
        serviceMap: "ios-grid-outline",
        apiMap: "ios-shuffle",
        runtime: "ios-videocam-outline",
        api: "ios-apps-outline",
        database: "ios-podium-outline",
        method: "ios-stats-outline",
        exception: "ios-bug-outline"
      };
      this.selItem = this.path.split("/")[3];
    },
    setDate() {
      var dr = this.$route.query.date_range;
      if (dr != undefined) {
        this.$store.dispatch("setSelDate", dr);
      }
    }
  },
  created() {
    this.initItem();
    // 加载app名列表
    request({
      url: "/dashboard/app/nameList",
      method: "GET",
      params: {}
    }).then(res => {
      this.appNames = res.data.data;
      if (this.$store.state.apm.appName == "") {
        // 若没有选择应用，则自动选择第一个应用
        this.selAppName(this.appNames[0]);
      }
    });

    var appName = this.$route.query.app_name;
    if (appName != undefined) {
      // 设置应用名
      this.$store.dispatch("setAPPName", appName);
    } else {
      // 获取当前应用名，设置url
      var an = this.$store.state.apm.appName;
      if (an != "") {
        this.$route.query.app_name = an;
        window.history.pushState(
          {},
          0,
          "http://" +
            window.location.host +
            window.location.pathname +
            "?app_name=" +
            an
        );
      }
    }

    this.setDate();
  }
};
</script>

<style lang="less">
@import "../../theme/light/var.less";
.sidebar {
  margin-top: 55px;
  .nav-top {
    border-bottom: 1px solid @secondary-color;
    padding-bottom: 7px;
    padding-top: 8px;
  }
  .nav-left {
    position: fixed;
    color: #fff;
    width: 200px;
    background: @dark-color;
    overflow-y: scroll;
    font-size: 14px;
  }

  .item-2 {
    transition: background-color 0.3s ease-in-out;
    padding: 13px 20px;
    padding-left: 30px;
    font-weight: 300;
    i {
      margin-right: 7px;
      color: @light-text-color;
    }
  }
  .item-2:hover {
    color: #fff;
    background: @primary-color;
    i {
      color: #fff;
    }
  }
  .item-1 {
    margin-left: 20px;
    padding: 12px 0px;
    // padding-bottom:10px;
    // color: ;
    font-size: 12px;
    font-weight: 700;
  }

  .item.selected {
    background: #3a4248;
    i {
      color: @primary-color;
    }
  }
}
</style>


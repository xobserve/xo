<template>
  <span v-if="type==1" class="calendar">
    <ButtonGroup style="margin-bottom:1px">
        <Button @click="type=2">
            <Icon type="ios-list" />
        </Button>
        <Button @click="setRealtime" :class="{'selected': $store.state.apm.realTime==1}">
            实时
        </Button>
        <Button @click="selListDate(5)" :class="{'selected': selDateList==5}">
            Last 5m
        </Button>
        <Button @click="selListDate(30)" :class="{'selected': selDateList==30}">
            30m
        </Button>
        <Button @click="selListDate(60)" :class="{'selected': selDateList==60}">
            1h
        </Button>
        <Button @click="selListDate(180)" :class="{'selected': selDateList==180}">
            3h
        </Button>
        <Button @click="selListDate(360)" :class="{'selected': selDateList==360}">
            6h
        </Button>
         <Button @click="selListDate(1440)" :class="{'selected': selDateList==1440}">
            1d
        </Button>
        <Button @click="selListDate(4320)" :class="{'selected': selDateList==4320}">
            3d
        </Button>
        <Button @click="selListDate(10080)" :class="{'selected': selDateList==10080}">
            7d
        </Button>
        <Button @click="setRefresh(getNewRefresh())" :class="{'selected': $store.state.apm.refresh==1}" v-show="$store.state.apm.realTime==1">
            刷新
        </Button>
    </ButtonGroup>
  </span>
  <span v-else>
     <ButtonGroup>
        <Button> <Icon type="ios-calendar-outline" @click="type=1" style="font-size:20px;margin-bottom:-2px" /></Button>
        <Button><DatePicker :split-panels=true  size="small"  type="datetimerange" :options="options1" :value="getDate()"  placeholder="启止时间设定" style="width: 280px;margin-left: 10px;margin-bottom:-4px" @on-change="changeDate"  @on-ok="confirmDate" :clearable="false"></DatePicker></Button>
     </ButtonGroup>
    
  </span>
</template>

<script>
export default {
  name: 'Calendar',
  data() {
    return {
        type: 1,
        options1: {
            disabledDate (date) {
                return date && date.valueOf() > Date.now() + 86400000
            }
        },
        selDateList: this.$store.state.apm.dateList,
        refreshH: null,
        refreshIntv: 10000
    }
  },
  beforeDestroy() {
    clearInterval(this.refreshH);
  },
  created() {
      this.initDate()
  },
  watch: {
    $route() {
       // reset the date when page goes back
      this.setDate()
    }
  },
  methods: {
    initDate() {
        var q = this.$route.query
        if (q.realtime != undefined) {
            this.$store.dispatch('setRealTime', q.realtime)
        } else {
            if (this.$store.state.apm.realTime != undefined) {
                this.$store.dispatch('setRealTime',this.$store.state.apm.realTime)
            } else {
                this.$store.dispatch('setRealTime', 0)
            }
        }

        var dateList = 0
        if (q.list_date==undefined || q.list_date=='undefined') {
            dateList = 0
        } else {
            dateList = q.list_date
        }



        var dr = q.date_range 
        if (dateList == 0) {
            if (dr != undefined && dr != 'undefined') {
                    // 设置selDate
                    this.$store.dispatch('setSelDate', dr)
                    // 清除其它属性
                    this.$store.dispatch('setRefresh', 0)
                    this.$store.dispatch('setRealTime',0)
                    this.$store.dispatch('removeDateList', undefined)
                    this.updateUrl()

                    this.type = 2
                    return 
            } else {
                if (this.$store.state.apm.selDate != undefined) {
                        // 清除其它属性
                        this.$store.dispatch('setRefresh', 0)
                        this.$store.dispatch('setRealTime',0)
                        this.$store.dispatch('removeDateList', undefined)
                        this.updateUrl()

                        this.type = 2
                        return 
                } else {
                        dateList = 5
                }
            }
        } else {
            // 若realtime没有勾选，则强制显示日历
            if (this.$store.state.apm.realTime == 0) {
                if (dr != undefined) {
                    // 设置selDate
                    this.$store.dispatch('setSelDate', dr)
                    // 清除其它属性
                    this.$store.dispatch('setRefresh', 0)
                    this.$store.dispatch('setRealTime',0)
    
                    this.$store.dispatch('removeDateList', undefined)
                    this.updateUrl()
                    
                    this.type = 2
                    return 
                }
            }
        }




        if (this.$store.state.apm.realTime == 0) {
            this.$store.dispatch('setRefresh', 0)
        } else {
            if (q.refresh != undefined) {
                this.$store.dispatch('setRefresh', q.refresh)
            }
        }

        this.selListDate(dateList)


        if (this.$store.state.apm.refresh == 1) {
                var _this = this
                _this.refreshH = setInterval(function() {
                _this.selListDate(_this.$store.state.apm.dateList)
            }, _this.refreshIntv);
        }
    },
    setDate() {
      var dr = this.$route.query.date_range
      if (dr != undefined) {
        this.$store.dispatch('setSelDate', dr)
      } 
    //   else {
    //     // 获取时间，更新url
    //     var date = this.$store.state.apm.selDate
    //     window.history.pushState(
    //       {},
    //       0,
    //       "http://" + window.location.host+window.location.pathname +  '?app_name=' + this.$store.state.apm.appName + '&date_range=' +  date
    //     );
    //   }
    },
    updateUrl(delListDate) {
        window.history.pushState(
        {},
        0,
        "http://" + window.location.host+window.location.pathname + 
        '?app_name=' +this.$store.state.apm.appName+
        '&date_range='+this.$store.state.apm.selDate+
        '&realtime='+this.$store.state.apm.realTime+
        '&refresh='+this.$store.state.apm.refresh+
        '&list_date='+this.$store.state.apm.dateList
        );
    },
    getNewRefresh() {
        var r = this.$store.state.apm.refresh
        if (r == 0) {
            return 1
        } else {
            return 0
        }
    },
    setRefresh(v) {
        this.$store.dispatch('setRefresh', v)
        if (v == 1) {
            var _this = this
            _this.refreshH = setInterval(function() {
                _this.selListDate(_this.$store.state.apm.dateList)
            }, _this.refreshIntv);
        } else {
            clearInterval(this.refreshH);
        }
        this.$route.query.refresh= v
        this.updateUrl() 
    },       
    setRealtime() {
        var rt = this.$store.state.apm.realTime
        if (rt == 0) {
            if (this.$store.state.apm.dateList == undefined || this.$store.state.apm.dateList == 'undefined') {
                 this.selListDate(5)
            }
            rt = 1
        } else {
            rt = 0
        }
        this.$store.dispatch('setRealTime', rt)
        this.$route.query.realtime= rt
        this.updateUrl()
    },
    selListDate(v) {
        if (v == 'undefined' || v == undefined || v == 0 || v == '') {
            v = 5
        }
        
        v = parseInt(v)
        var dt = new Date()
        var d = [new Date(dt.getTime() - (v+2) * 60 * 1000).toLocaleString('zh',{hour12:false}).replace(/\//g,'-'),new Date(dt.getTime() - 2 * 60 * 1000).toLocaleString('zh',{hour12:false}).replace(/\//g,'-')]
        var date = JSON.stringify(d)
         this.$route.query.date_range= date
        this.$store.dispatch('setSelDate', date)
        this.selDateList = v
        this.$store.dispatch('setDateList', v)
        this.$route.query.list_date= v
        this.updateUrl()
    },
    changeDate(date) {
      this.selDate = date
    },
    confirmDate() {
      if (this.selDate != undefined) {
          var date = JSON.stringify(this.selDate)
         this.$store.dispatch('setSelDate', date)
         this.$route.query.date_range= date

        this.selDateList = undefined
        this.$store.dispatch('removeDateList', undefined)
        this.$store.dispatch('setRealTime', 0)

        // 去除实时刷新的定时器
        clearInterval(this.refreshH)
        this.$store.dispatch('setRefresh', 0)

        this.updateUrl(true)
      }
    },
    getDate() {
        if (this.$store.state.apm.selDate==undefined || this.$store.state.apm.selDate=='undefined') {
            var d = [new Date((new Date()).getTime() - 5 * 60 * 1000).toLocaleString('zh',{hour12:false}).replace(/\//g,'-'),new Date().toLocaleString('zh',{hour12:false}).replace(/\//g,'-')]
            var date = JSON.stringify(d)
            this.$route.query.date_range= date
            this.$store.dispatch('setSelDate', date)
            return d
        }
       
      var date =  JSON.parse(this.$store.state.apm.selDate)
      return date
    }
  }
}
</script>

<style lang="less">
.ivu-date-picker {
  .ivu-input-suffix {
    display:none;
  }
  input {
      padding-right:0
  }
  .ivu-picker-confirm {
      .ivu-btn-default {
          display:none
      }
  }
}
</style>
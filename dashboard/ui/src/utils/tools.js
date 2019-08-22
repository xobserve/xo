export function  formatTime (timestamp) {
    var time0 = new Date(timestamp);
    return time0.toLocaleDateString().replace(/\//g, "-") + " " + time0.toTimeString().substr(0, 8)
}

export function gotoAppSnapshot(app,dateS,_this) {
    var date = new Date(dateS)
    // 快照时间为前3分钟,后3分钟
    var date1 =   new Date(date.getTime() - 240 * 1000)
    var date2 = new Date(date.getTime() + 180 * 1000)
    var now = new Date()
    if (date2.getTime() > now.getTime()) {
      date2 = now
    }
    var dates = [
      date1.toLocaleString('chinese',{hour12:false}).replace(/\//g,'-'),
      date2.toLocaleString('chinese',{hour12:false}).replace(/\//g,'-')
    ]
    _this.$router.push({
        path: '/ui/apm',
        query: {
          app_name: app,
          date_range: JSON.stringify(dates)
        }
      })
  }
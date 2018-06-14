<template>
  <div class="hello">
      <textarea v-model="msg"></textarea>
  </div>
</template>

<script>
var meq = require("meq");
export default {
  name: "HelloWorld",
  data() {
    return {
      msg: "Welcome to Your Vue.js App"
    };
  },

  mounted() {
    var _this=this
    var m = meq.connect({
      host: "localhost",
      port: 9008
    });

    m.on("connect", function() {
      console.log("connect ok!");
      m.subscribe("/1234567890/12/test/a");
    });

    m.on("unread", function(res) {
      // pull messages
      m.pull(res.topic, m.NEWEST_MSG, 0);
      console.log("get count", res);
    });

    m.on("message", function(msg) {
        _this.msg = msg.payload
    });
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
textarea {
  font-size: 20px;
}
</style>

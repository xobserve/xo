<template>
  <div class="hello">
      <textarea v-model="msg"></textarea>
      <button @click="retrieve">retrieve</button>
  </div>
</template>

<script>
var meq = require("/Users/sunface/GoLibs/src/github.com/cosmos-gg/meq/sdks/js-meq");
export default {
  name: "HelloWorld",
  data() {
    return {
      msg: "Welcome to Your Vue.js App",
      topic :  "/1234567890/22/test/a",
      cli : {}
    };
  },
  methods: {
    retrieve() {
      this.cli.retrieve(this.topic,'1008242665877147654')
    }
  },
  mounted() {
    var _this=this
    var m = meq.connect({
      host: "localhost",
      port: 9008,
      username: 'sunface'
    });
    _this.cli = m
    m.on("connect", function() {
      console.log("connect ok!");
      m.subscribe(_this.topic);
      m.presenceAll(_this.topic,function(users) {
        for (var i =0;i< users.length;i++) {
          console.log("presence: ",users[i].toString())
        }
      }) 

      m.usersAll(_this.topic,function(users) {
        for (var i =0;i< users.length;i++) {
          console.log("users: ",users[i].toString())
        }
      }) 
    });

    m.on("unread", function(res) {
      // pull messages
      m.pull(res.topic, m.NEWEST_MSG, 0);
      console.log("get count", res);
    });

    m.on("message", function(msg) {
      console.log(msg)
        _this.msg = msg.payload
    });

    m.on("joinchat",function (msg) {
      console.log("a user has joined the chat room",msg.topic.toString(),msg.user.toString())
    })

    m.on("leavechat",function (msg) { 
      console.log("a user has leave the chat room",msg.topic.toString(),msg.user.toString())
    })

     m.on("online",function (msg) {
      console.log("a user is online now",msg.topic.toString(),msg.user.toString())
    })

    m.on("offline",function (msg) { 
      console.log("a user is offline now",msg.topic.toString(),msg.user.toString())
    })

    m.on("retrieve",function(msg) {
      console.log("msg retrieve",msg.topic.toString(),msg.msgid.toString())
    })
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
textarea {
  font-size: 20px;
}
</style>

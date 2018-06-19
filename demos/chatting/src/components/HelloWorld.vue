<template>
  <div class="hello">
      <Row>
        <Col id="chat-room" span='10' offset='7' style="height:400px;border:1px solid grey;overflow-y:scroll">
            <Row v-for="msg in messages" :key="msg.id" class="animated bounceInRight">
                <div>{{msg.payload.toString()}}</div>
            </Row>
        </Col>
      </Row>
  </div>
</template> 

<script>
var meq = require("/Users/sunface/GoLibs/src/github.com/cosmos-gg/meq/sdks/js-meq");
export default {
  name: "HelloWorld",
  data() {
    return {
      messages:[],
      topic :  "/1234567890/22/chat/001",
      cli : {}
    };
  },
  methods: {
    retrieve() {
      // this.cli.retrieve(this.topic,'1008242665877147654')
    },
    scrollToBottom(o){  
      o.scrollTop = o.scrollHeight;  
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
      // m.publish(_this.topic,"hello meq",0,1)
    });

    m.on("unread", function(res) {
      // pull messages
      m.pull(res.topic, m.NEWEST_MSG, 10);
      console.log("get count", res);
    });

    m.on("message", function(msg) {
        _this.messages.push(msg)
        var chat = document.getElementById("chat-room");  
        _this.scrollToBottom(chat)
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
@import "./animate.css";
textarea {
  font-size: 20px;
}
</style>

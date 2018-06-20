<template>
  <div class="chatroom">
        <Row >
            <Col span="13" offset="2" v-show="!userIsSet">
                <input style="width:80%;" type="text" v-model="username" placeholder="please input your username">
                <Button @click="setUser">submit</Button>
            </Col>
            <Col span="13" offset="2" v-show="userIsSet">
              <div v-show="unreadCount!=0" style="text-align:center;font-size:15px;float:right;border-radius:10px;border:1px solid #bbeee0;padding:2px 3px">{{unreadCount}} unread messages</div>
              <div style="text-align:center;font-size:13px"><Button size='small' @click="loadMore">Load more</Button></div>
              <div  id="chat-room" style="overflow-y:scroll;max-height:600px;">
                  <Row v-for="msg in messages" :key="msg.id" class="animated bounceInRight" style="margin-top:8px;">
                    <div>
                      <div style="font-size:15px;color:#777">{{msg.sender}} <span style="float:right">{{msg.id}}</span></div>
                      <span :class="{'bg-green':msg.sender==username}" style="padding:3px 5px;margin-top:2px'">{{msg.payload.toString()}}</span>
                    </div>
                </Row>
              </div>

              <Row style="margin-top:20px">
                  <div  class="input-group">
                      <input style="width:80%;" type="text" class="form-control" v-model="message" placeholder="Say Something">
                      <span  style="width:20%;" class="input-group-btn">
                          <button class="btn btn-default form-control" type="submit" v-on:click="sendMessage()" v-on:enter="sendMessage()">Say it! <i class="fa fa-commenting-o"></i></button>
                      </span>
                  </div> 
                  <ul class="emoji">
                    <li v-for="em in emoji"><a v-on:click="append(em)">{{em}}</a></li>
                  </ul>
              </Row>     
            </Col>
            <Col span="7" offset="1">
              <div style="margin-bottom:5px;">online users</div>
              <Row v-for="u in users"  class="animated bounceInLeft">
                  <div v-show="u.status==1" :class="{'color-green':u.id==username}">{{u.id}}</div>
              </Row>
              <div style="margin-bottom:5px;margin-top:20px;">offline users</div>
              <Row v-for="u in users"  class="animated bounceInLeft">
                  <div v-show="u.status==0">{{u.id}}</div>
              </Row>
            </Col>
        </Row>
  </div>
</template>   

<script>
var meq = require("/Users/sunface/GoLibs/src/github.com/cosmos-gg/meq/sdks/js-meq");
import gdata from "./gdata";


export default {
  name: "ChatRoom",
  data() {
    return {
      messages: [],
      topic: "/1234567890/22/chat/001",
      cli: {},
      isSubed: false,

      username: '',
      users : [],

      emoji: [
            "😀", "😬", "😁", "😂", "😃", "😄", "😅", "😆", "😇", "😉", "😊",
            "🙂", "😋", "😌", "😍", "😘", "😗", "😙", "😚", "😜", "😝", "😛", 
            "😎", "😏", "😶", "😐", "😑", "😒", "😳", "😞", "😟", "😠", "😡",
            "😔", "😕", "🙁", "☹", "😣", "😖", "😫", "😩", "😤", "😮", "😱",
            "😨", "😰", "😯", "😦", "😧", "😢", "😥", "😪", "😓", "😭", "😵", 
            "😲", "😷"
        ],

      message: '',
      userIsSet: false,

      unreadCount : 0,

      offset : '',

      loadMoreClicked: false
    };
  },
  methods: {
    retrieve() {
      // this.cli.retrieve(this.topic,'1008242665877147654')
    },
    scrollToBottom(o) {
      o.scrollTop = o.scrollHeight;
    },
    append(emoji) {
      this.$data.message += ' ' + emoji + ' ';
    },
    sendMessage() {
      this.cli.publish(this.topic,this.message,86400,1)
      this.message = ''
      var chat = document.getElementById("chat-room");
      this.scrollToBottom(chat);
    },
    loadMore() {
       this.cli.pull(this.topic, this.offset, 10);
        if (this.unreadCount - 10 < 0) {
          this.unreadCount = 0
        } else {
          this.unreadCount =this.unreadCount - 10
        }
        this.loadMoreClicked = true
    },
    setUser() {
      this.userIsSet = true
       var _this = this;
      var m = meq.connect({
        host: "localhost",
        port: 9008,
        username: _this.username
      });
      _this.cli = m;
      m.on("connect", function() {
        console.log("connect ok!");
        m.subscribe(_this.topic, function() {
          _this.isSubed = true;
          m.usersAll(_this.topic, function(users) {
            for (var i=0;i<users.length;i++) {
              _this.users.push({
                id: users[i].toString(),
                status: '0'
              })
            }
            m.presenceAll(_this.topic, function(users) {
                for (var i=0;i<users.length;i++) {
                  for (var j=0;j<_this.users.length;j++) {
                    if (users[i].toString()==_this.users[j].id) {
                      _this.users[j].status = '1'
                    }
                  }
                }
            });
            m.joinchat(_this.topic);

            // pull messages
            m.pull(_this.topic, m.NEWEST_MSG, 10);
          });
        });
      });


      m.on("unread", function(res) {
        if (res.count - 10 < 0) {
          _this.unreadCount = 0
        } else {
          _this.unreadCount = res.count - 10
        }
      });

      m.on("message", function(msg) {
        var l = _this.messages.length

        console.log(msg.id, _this.messages[l-1])
        if (l ==0 ){
           _this.messages.push(msg);
           _this.offset = msg.id
        }
       else if  (msg.id < _this.messages[l-1].id) {
            _this.messages.unshift(msg);
            _this.offset = msg.id
        } else {
             _this.messages.push(msg);
        }

        if (!_this.loadMoreClicked) {
          var chat = document.getElementById("chat-room");
          _this.scrollToBottom(chat);
        }
      });

      m.on("joinchat", function(msg) {
        var exist = false 
        var id = msg.user.toString()
        for (var i=0;i<_this.users.length;i++) {
          if (_this.users[i].id == id) {
            _this.users[i].status='1'
            exist = true
          }
        }

        if (!exist) {
          _this.users.push({
            id: msg.user.toString(),
            status: '1'
          })
        }
      });

      m.on("leavechat", function(msg) {
          var id = msg.user.toString()
          for (var i=0;i<_this.users.length;i++) {
            if (_this.users[i].id == id) {
              _this.users.splice(i,1)
            }
          }
      });

      m.on("online", function(msg) {
        var id = msg.user.toString()
          for (var i=0;i<_this.users.length;i++) {
            if (_this.users[i].id == id) {
              _this.users[i].stauts = '1'
            }
          }
      });

      m.on("offline", function(msg) {
        var id = msg.user.toString()
          for (var i=0;i<_this.users.length;i++) {
            if (_this.users[i].id == id) {
              _this.users[i].status = '0'
            }
          }
      });

      m.on("retrieve", function(msg) {
        console.log("msg retrieve", msg.topic.toString(), msg.msgid.toString());
      });
    }
  },
  mounted() {

  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import "../theme/animate.css";
.chatroom {
  text-align:left;
}
.color-green {
  color:#46bc99;
}
.bg-green { 
  background:#bbeee0;
}

.emoji{
	list-style-type: none;
    display: table;
    margin-top: 10px;
    padding: 0;
}

.emoji li {
	font-size: 25px;
    padding: 2px;
    display: inline-flex;
}

.emoji li a {
	color: darkslategray;
	
}

</style>

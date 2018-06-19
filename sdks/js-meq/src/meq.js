//  Copyright © 2018 Sunface <CTO@188.com>
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var mqtt = require('mqtt');
var UInt64LE = require("int64-buffer").Uint64LE;

var Meq = (function() {
    function Meq() {
        //const,must not be updateed! 
        this.NEWEST_MSG = '0'
        this.REDUCE_ALL_COUNT = 0
        this._callbacks = {}
        this.unread = {}
        this.presenceAllCallback = {}
        this.usersAllCallback = {}
    }



    Meq.prototype._tryInvoke = function (name, args) {
        var callback = this._callbacks[name];
        if (typeof (callback) !== 'undefined' && callback !== null) {
            callback(args);
            return;
        } 
    };

    Meq.prototype._onConnect = function () {
        this._tryInvoke('connect', this);
    };
    Meq.prototype._onError = function (error) {
        this._tryInvoke('error', error); 
    };
    Meq.prototype._onDisconnect = function () {
        this._tryInvoke('disconnect', this);
    };

  
    Meq.prototype._onMessage
    
    Meq.prototype.connect = function(request) {
        var _this = this;
        request = request || {};
        var defaultOptions = {
            host: 'localhost',
            port: 9008,
            keepalive: 30,
            secure: false
        }

        for (var k in defaultOptions) {
            request[k] = ('undefined' === typeof request[k])
                ? defaultOptions[k]
                : request[k];
        }

        request.host = request.host.replace('/.*?:\/\//g', "");
        var brokerUrl = (request.secure ? 'wss://' : 'ws://') + request.host + ':' + request.port;

        this._mqtt = mqtt.connect(brokerUrl, request);
        this._mqtt.on('connect', function () {
            _this._onConnect();
        });
        this._mqtt.on('close', function () {
            _this._onDisconnect();
        });
        this._mqtt.on('error', function (error) {
            _this._onError(error);
        });
        this._mqtt.on('message', function (topic, msg, packet) {
            var cmd = msg[0]
            switch (cmd) {
                case 107: // unread count
                    var count = msg.readUInt32LE(1)
                    _this.unread[topic] = count
                    _this._tryInvoke('unread', {
                        topic: topic,
                        count: count
                    });
                    break;
                case 98: // publish
                    var ml = msg.readUInt16LE(1)
                    var msgid = msg.slice(3,3+ml)

                    var pl = msg.readUInt32LE(3+ml)
                    var payload = msg.slice(7+ml,7+ml+pl)


                    var acked = false 
                    if (msg[7+ml+pl] == 49) {
                        acked = true
                    }

                    var tl = msg.readUInt16LE(8+ml+pl)
                    var topic = msg.slice(10+ml+pl,10+ml+pl+tl)

                    var sl = msg.readUInt16LE(20+ml+pl+tl)
                    var sender = msg.slice(22+ml+pl+tl,22+ml+pl+tl+sl)

                    var rawid = msg.slice(22+ml+pl+tl+sl)
                    var m = new Message(rawid.toString(),msgid.toString(),topic.toString(),payload,acked,sender.toString())
                    _this._tryInvoke('message', m);
                    break
                case 113: // all presence users
                    var users = []
                    var last = 1
                    while (last < msg.slice(1).length) {
                        var ul = msg[last]
                        var u = msg.slice(last+1,last+1+ul)
                        users.push(u)

                        last = last+1+ul
                    }    
                    var callback = _this.presenceAllCallback[topic]
                    callback(users)
                    break
                case 115: //joinchat
                    var tl = msg.readUInt16LE(1)
                    var topic = msg.slice(3,3+tl)

                    var user = msg.slice(3+tl)

                    _this._tryInvoke('joinchat',{
                        topic: topic,
                        user: user
                    })
                    break
                case 116: //leavechat
                    var tl = msg.readUInt16LE(1)
                    var topic = msg.slice(3,3+tl)

                    var user = msg.slice(3+tl)

                    _this._tryInvoke('leavechat',{
                        topic: topic,
                        user: user
                    })
                    break
                case 117: //user online
                    var tl = msg.readUInt16LE(1)
                    var topic = msg.slice(3,3+tl)

                    var user = msg.slice(3+tl)

                    _this._tryInvoke('online',{
                        topic: topic,
                        user: user
                    })
                    break
                case 118: //user offline
                    var tl = msg.readUInt16LE(1)
                    var topic = msg.slice(3,3+tl)
                    var user = msg.slice(3+tl)

                    _this._tryInvoke('offline',{
                        topic: topic,
                        user: user
                    })
                    break
                case 119: // all  users in chat room
                    var users = []
                    var last = 1
                    while (last < msg.slice(1).length) {
                        var ul = msg[last]
                        var u = msg.slice(last+1,last+1+ul)
                        users.push(u)

                        last = last+1+ul
                    }    
                    var callback = _this.usersAllCallback[topic]
                    callback(users)
                    break
                case 120: // a client request to retrieve one message,we need to remove from our store
                    var tl = msg.readUInt16LE(1)
                    var topic = msg.slice(3,3+tl)
                    var msgid = msg.slice(3+tl)
                    _this._tryInvoke('retrieve',{
                        topic: topic,
                        msgid: msgid
                    })
                    break
                default: 
                _this.logError("unknown message command:"+cmd);
            }
        });
    };
    
    Meq.prototype.subscribe = function (topic) {
        this._mqtt.subscribe(topic);
    };

    Meq.prototype.publish = function(topic,payload,ttl,qos) {
        var id = newID()
        var ml = id.length
        var tl = topic.length
        var pl = payload.length
        var m = Buffer.allocUnsafe(24 + ml + tl + pl+ml)
        m.fill(0)
        m[0] = 98
        //id
        m.writeUInt16LE(ml,1)
        m.write(id,3)
    
        //payload
        m.writeUInt32LE(pl,3+ml)
        m.write(payload,7+ml)

        //ack
        m[7+ml+pl]='0'

        //topic
        m.writeUInt16LE(tl,8+ml+pl)
        m.write(topic,10+ml+pl)

   
        //type
        m.writeUInt8(1,10+ml+tl+pl)
        //qos
        m.writeUInt8(qos,11+ml+tl+pl)
        //ttl   
        var big = new UInt64LE(ttl);
        big.toBuffer().copy(m,12+ml+tl+pl)
        //from
        m.writeUInt16LE(0,20+ml+tl+pl)
        //raw msgid
        m.writeUInt16LE(ml,22+ml+tl+pl)
        m.write(id,24+ml+tl+pl)

        this._mqtt.publish(topic,m,{
            qos: qos
        }, function(err,granted) {
            console.log(err,granted,granted.payload.toString())
        });
    }

    Meq.prototype.pull = function(topic,offset,count) {
        var ml = offset.length
        var m = Buffer.allocUnsafe(3+ml)
        m.fill(0)
        // pull command
        m[0] = 108
        // count
        m.writeUInt16LE(count,1)
        // offset
        m.write(offset,3)

        this._mqtt.publish(topic,m)
    }

    Meq.prototype.reduceCount = function(topic,count) {
        var m = Buffer.allocUnsafe(3)
        m.fill(0)
        
        //command
        m[0] = 112
        m.writeUInt16LE(count,1)

        this._mqtt.publish(topic,m)
    }

    Meq.prototype.markRead = function(topic,msgid) {
        var tl = topic.length
        var ml = msgid.length
        var m = Buffer.allocUnsafe(5+tl+ml)
        m.fill(0)

        //command
        m[0] = 114
        //topic
        m.writeUInt16LE(tl,1)
        m.write(topic, 3)
        //msgid
        m.writeUInt16LE(ml,3+tl)
        m.write(msgid,5+tl)

        this._mqtt.publish(topic,m)
    }

    Meq.prototype.presenceAll = function(topic,callback) {
        this.presenceAllCallback[topic] = callback

        var tl = topic.length
        var m = Buffer.allocUnsafe(1 + tl)
        m.fill(0)

        m[0] = 113
        m.write(topic,1)

        this._mqtt.publish(topic,m)
    }

    Meq.prototype.usersAll= function(topic,callback) {
        this.usersAllCallback[topic] = callback

        var tl = topic.length
        var m = Buffer.allocUnsafe(1 + tl)
        m.fill(0)

        m[0] = 119
        m.write(topic,1)

        this._mqtt.publish(topic,m)
    }

    Meq.prototype.retrieve = function(topic,msgid) {
        var tl = topic.length
        var ml = msgid.length
        var m = Buffer.allocUnsafe(1 + 2 + tl + ml)
        m.fill(0)
        m[0] = 120
        m.writeUInt16LE(tl,1)
        m.write(topic,3)
        m.write(msgid,3+tl)

        this._mqtt.publish(topic,m)
    }

    Meq.prototype.joinchat = function(topic) {
        var m = Buffer.allocUnsafe(1+topic.length)
        m.fill(0)

        m[0] = 115
        m.write(topic,1)

        this._mqtt.publish(topic,m)
    }

    Meq.prototype.leavechat = function(topic) {
        var m = Buffer.allocUnsafe(1+topic.length)
        m.fill(0)

        m[0] = 116
        m.write(topic,1)

        this._mqtt.publish(topic,m)
    }

    Meq.prototype.on = function (event, callback) {
        // Validate the type
        switch (event) {
            case "connect":
            case "disconnect":
            case "message":
            case "offline":
            case "error":
            // @todo change to query
            case "unread":
            
            //chat
            case "joinchat":
            case "leavechat":
            case "online":
            case "offline":
            case "retrieve":
            break;
            default:
                this.logError("meq.on: unknown event type, supported values are 'connect', 'disconnect', 'message' and 'keygen'.");
        }
        // Set the callback
        this._callbacks[event] = callback;
    };

    Meq.prototype.logError = function (message) {
        console.error(message);
        throw new Error(message);
    };

    return Meq;
}());
exports.Meq = Meq;

function Message(rawid,id,topic,payload,acked,sender) {
    this.rawid = rawid
    this.id = id
    this.topic = topic
    this.payload = payload
    this.acked = acked
    this.sender = sender
}
exports.Message = Message;

function newID() {
    var timestamp = (new Date()).valueOf();
    var r = random(100000,999999)
    return timestamp+r
}

function random(Min,Max){
    var Range = Max - Min;
    var Rand = Math.random();
    var num = Min + Math.round(Rand * Range); //四舍五入
    return num + '';
}





function connect(request) {
    var c = new Meq();
    c.connect(request);
    return c;
}
exports.connect = connect;
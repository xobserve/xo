var mqtt = require('mqtt');
var UInt64LE = require("int64-buffer").Uint64LE;

var Meq = (function() {
    function Meq() {
        //const,must not be updateed! 
        this.NEWEST_MSG = '0'
        this.REDUCE_ALL_COUNT = 0
        this._callbacks = {}
        this.unread = {}
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
    Meq.prototype._onOffline = function () {
        this._tryInvoke('offline', this);
    };
    Meq.prototype._onOffline = function () {
        this._tryInvoke('offline', this);
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
        this._mqtt.on('offline', function () {
            _this._onOffline();
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

                    var m = new Message(msgid.toString(),topic.toString(),payload,acked)
                    _this._tryInvoke('message', m);
                    break
                default: 
                _this.logError("unknown message command:",cmd);
            }
        });
    };
    
    Meq.prototype.subscribe = function (topic) {
        this._mqtt.subscribe(topic);
    };

    Meq.prototype.publish = function(topic,payload,ttl) {
        var id = newID()
        var ml = id.length
        var tl = topic.length
        var pl = payload.length
        var m = Buffer.allocUnsafe(20 + ml + tl + pl)
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
        m.writeUInt8(0,11+ml+tl+pl)
        //ttl   
        var big = new UInt64LE(ttl);
        big.toBuffer().copy(m,12+ml+tl+pl)

    
        this._mqtt.publish(topic,m);
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
    Meq.prototype.on = function (event, callback) {
        // Validate the type
        switch (event) {
            case "connect":
            case "disconnect":
            case "message":
            case "offline":
            case "error":
            case "unread":
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

function Message(id,topic,payload,acked) {
    this.id = id
    this.topic = topic
    this.payload = payload
    this.acked = acked
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
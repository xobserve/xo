
MeQ [咪Q]
------------
MeQ是一个现代化的消息平台，支持消息推送、即时通讯、群组聊天、物联网IoT等场景，基于[MQTT协议](https://github.com/meqio/meq/tree/master/proto/mqtt)，完全使用Go语言开发，无任何依赖、无Cgo。目前支持所有主流的平台：Linux、Unix、MacOS、Windows、ARM等。

MeQ的目标是成为世界上最好的消息平台，就像手机中的Iphone一样，从性能到产品体验都做到最一流。


- 主页: http://meq.io
- <a href="Readme.md">英文Readme</a>
<p align="left">
    <a href="http://meq.io">
     <img  width="200" src="./logo.png"></a>
</p>


聊天室例子
------------
### 安装FoudationDB客户端(必须要安装的依赖！)
Mac OS: https://www.foundationdb.org/downloads/5.1.7/macOS/installers/FoundationDB-5.1.7.pkg

Centos7: https://www.foundationdb.org/downloads/5.1.7/rhel7/installers/foundationdb-clients-5.1.7-1.el7.x86_64.rpm

Centos6: https://www.foundationdb.org/downloads/5.1.7/rhel6/installers/foundationdb-clients-5.1.7-1.el6.x86_64.rpm

其它操作系统 : https://www.foundationdb.org/download/  (请选择5.1.7版本)

### 启动MeQ
```bash
> go get github.com/meqio/meq
> cd $GOPATH/src/github.com/meqio/meq/broker
> go run main.go
```

### 启动聊天室
```bash
> cd ../demos/chatting
> npm install
> npm run dev
```
### 开始聊天!
打开浏览器，然后打开两个页面分别访问
http://localhost:8080,在第一个页面输入用户名A,第二个页面输入用户名B，然后开始聊天吧！

### 更多(持久化存储)
Broker默认使用的是内存存储方式，如果你想使用持久化存储，请安装[foundationDB server V5.1.7](https://www.foundationdb.org/download/),然后将broker.yaml中的store.engine从memory修改为fdb即可


当前状态
------------
目前项目的版本号是Alpha V0.5.0，官方网站、文档以及一个聊天室Demo很快将与大家见面(2018年6月30日之前)

功能特性
------------
### 极高的性能
- 使用Go语言从零编写，拥有和C++相仿的性能
- 零对象分配、零拷贝
- 热点代码和算法都经过了极致优化，同时不影响可读性
### 简单、高效
- 学习和使用都很简单
- 如果你想要基于MeQ做二次开发，那也会非常高效，这个得益于我们的优秀设计和代码
- 详细的文档和示例
### 健壮性
- 在设计开发过程中，健壮性都是我们首要考虑的目标
- 默认支持消息持久化，你也通过实现存储接口添加自己的存储方式
### 多消息场景支持
- 消息推送
- 群组聊天
- 即时通信
- 物联网IoT
- 实时网页交互展示，例如在线协作、动态图表等
### 群组聊天功能支持
- 加入退出群组
- 个人未读消息数显示
- 消息撤回功能
- 历史消息回放
- 获取所有群组用户和当前在线用户列表
- 消息存且仅存一份，大大提升了性能和资源利用
### 高级特性
- 支持Topic模糊匹配，支持消息广播，例如你可以推送到以下Topic '/china/+/city1',那么中国的所有省份里，城市名为city1的用户都能收到这条消息
- Mqtt协议和Websocket支持
- 低延迟，消息投递给用户要尽可能的快，这样才能保证实时的互动
- 丰富的后台管理功能和ui
- 监控和消息跟踪

为什么选择MeQ? 
------------
当前已经存在了各种各样的消息平台，但是它们都或多或少满足某一个场景，其中以消息推送居多，如果你想要快速搭建一个在线聊天室应用，会发现基本难以找到自己想要的消息平台满足聊天室的各种特性和需求(例如在线用户列表、未读消息数量提示、历史消息再加载、高性能群聊等等)。因此我们开发了MeQ，一个真正的涵盖了各种消息场景的消息平台，能帮助你快速搭建聊天室、消息推送、物联网IoT等等应用，同时又能实现极致的性能。

代码贡献
------------
欢迎大家给MeQ贡献代码，你可以在issues找到需求、可以提交Bug等等，如果想参与到MeQ中来，只需要在issue留言即可


贡献者(按贡献排序)
------------
- <a href="https://github.com/sunface" target="_blank">Sunface</a> 
- <a href="https://github.com/shaocongcong" target="_blank">Cong</a>
- <a href="https://github.com/niyuelin1990" target="_blank">Niyuelin1990</a>

性能(初测)
-------------
以下数据是在我的Mac上，运行了两台节点组成集群，存储模式采用了内存，同时运行了服务器和客户端，因此数据还不够极致
- 5个客户端同时生产消息：每秒270万
- 5个客户端同时消费： 每秒200万




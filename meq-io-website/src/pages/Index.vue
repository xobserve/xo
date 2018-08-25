<template>
  <div class="index">
    <Row>
      <Col :xs="{span:24,offset:0}" :sm="{span:22,offset:1}" :md="{span: 16,offset:2}" :lg="{ span: 16, offset: 2 }" style="padding-left:20px">
          <h1 class="font-weight-300 header-font huge-font-size">MeQ</h1>
          <h2 class="font-weight-300  header-font large-font-size margin-top-10" style="font-size:25px;">A modern messaging platform for Message Push、IM、Group Chatting、IoT etc</h2>
          
     
                <Chat class="margin-top-40"></Chat>
        
          
          <div class="align-center margin-top-40">
            <Button type="primary" size="large" class="big-btn btn-shadow font-weight-600 big-font-size margin-top-20 margin-left-5 border-none" style="background:black" @click="gotoDocs">Docs</Button>
            <Button type="primary" size="large" class="big-btn btn-shadow font-weight-600 big-font-size margin-top-20 border-none"  @click="gotoDocs">Admin Site</Button>
          </div>

          <Row class="margin-top-60">
              <Col :xs="{span:12,offset:0}" :sm="{span:12,offset:0}" :md="{span: 8,offset:0}" :lg="{ span: 8, offset: 0 }">
                  <Row :gutter="16">
                      <Col span="3">
                        <Icon type="flash" class="huge-font-size"></Icon>
                        
                      </Col>
                       <Col span="20">
                         <h2 class="font-weight-500 header-font">Performance</h2>
                        <p class="margin-top-10">Written in go, as fast as c/c++ network programing</p>
                        <p class="margin-top-10">Zero allocation,Speed-of-light message delivery and high throughput</p>
                      </Col>
                  </Row>
              </Col>
               <Col :xs="{span:12,offset:0}" :sm="{span:12,offset:0}" :md="{span: 8,offset:0}" :lg="{ span: 8, offset: 0 }">
                  <Row :gutter="16">
                      <Col span="3">
                        <Icon type="pinpoint" class="huge-font-size"></Icon>
                      </Col>
                       <Col span="20">
                         <h2 class="font-weight-500 header-font">Easy and Efficient</h2>
                        <p class="margin-top-10">Easy to study and use</p>
                        <p class="margin-top-10">Efficient when you need to develop on meq,because the nice design and code</p>
                        <p class="margin-top-10">Detailed docs and examples</p>
                      </Col>
                  </Row>
              </Col>
               <Col :xs="{span:12,offset:0}" :sm="{span:12,offset:0}" :md="{span: 8,offset:0}" :lg="{ span: 8, offset: 0 }">
                  <Row :gutter="16">
                      <Col span="3"> 
                        <Icon type="ios-locked-outline" class="huge-font-size"></Icon>
                      </Col>
                       <Col span="20">
                         <h2 class="font-weight-500 header-font">Robus and Security</h2>
                        <p class="margin-top-10">Supported for variety of message persistence</p>
                        <p class="margin-top-10">Support TLS encryption etc</p>
                        <p class="margin-top-10">Appid and channel tokens</p>
                      </Col>
                  </Row>
              </Col>
          </Row>

          
          <Row class="margin-top-40">
               <Col :xs="{span:12,offset:0}" :sm="{span:12,offset:0}" :md="{span: 8,offset:0}" :lg="{ span: 8, offset: 0 }">
                  <Row :gutter="16">
                      <Col span="3">
                        <Icon type="navigate" class="huge-font-size"></Icon>
                      </Col>
                       <Col span="20">
                         <h2 class="font-weight-500 header-font">Protocols</h2>
                        <p class="margin-top-10">TCP</p>
                        <p class="margin-top-10">Websocket</p>
                        <p class="margin-top-10">Http1.1 2</p>
                      </Col>
                  </Row>
              </Col>
               <Col :xs="{span:12,offset:0}" :sm="{span:12,offset:0}" :md="{span: 8,offset:0}" :lg="{ span: 8, offset: 0 }">
                  <Row :gutter="16">
                      <Col span="3">
                        <Icon type="ios-color-wand" class="huge-font-size"></Icon>
                      </Col>
                       <Col span="20">
                         <h2 class="font-weight-500 header-font">Various scenario</h2>
                        <p class="margin-top-10">Message push</p>
                        <p class="margin-top-10">Chatting</p>
                        <p class="margin-top-10">IoT messaging</p>
                        <p class="margin-top-10">Real time web interaction, like dashboard、online collaboration etc</p>
                      </Col>
                  </Row>
              </Col>
              <Col :xs="{span:12,offset:0}" :sm="{span:12,offset:0}" :md="{span: 8,offset:0}" :lg="{ span: 8, offset: 0 }">
                  <Row :gutter="16">
                      <Col span="3"> 
                        <Icon type="ios-locked-outline" class="huge-font-size"></Icon>
                      </Col>
                       <Col span="20">
                         <h2 class="font-weight-500 header-font">Advanced feature</h2>
                        <p class="margin-top-10">Topic filtering,like /china/+/hz-city</p>
                        <p class="margin-top-10">Admin ui and message statistics</p>
                        <p class="margin-top-10">Cloud native</p>
                      </Col>
                  </Row>
              </Col>
          </Row>
      </Col>
    </Row>
     
       

  </div>
</template>

<script>
import Chat from "../components/Chat";
export default {
  name: 'Index',
   components: {
    Chat,
  },
  data () {
    return {
    }
  },
  methods: {
    gotoDocs() {
      this.$Message.info('Coming soon');
    }
  },
  mounted() {
    console.log(this.$store.state.show)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
@import "../theme/common.less";
.index {
  margin-top: 30px;
}
</style>

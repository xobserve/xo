<template>
    <div class="nav">
        <Row>
            <Col span="20" offset="2" >
                <img class="align-middle" src="../assets/logo.png" style="height:50px;width:50px;"/>
                <h2  class="header-font font-weight-600 large-font-size in-line align-middle margin-left-5">MeQ</h2>
                <div class="align-middle medium-font-size float-right margin-top-10"> <a class="a-hover font-color-normal" @click="gotoDocs">Docs</a> <a class="a-hover margin-left-20 font-color-normal" @click="gotoDocs">AdminSite</a> <a class="a-hover margin-left-20 font-color-normal" href="https://github.com/mafanr/meq">Github</a></div>
            </Col>
        </Row>
    </div>
</template>
<script>
export default {
  name: "Nav",
  methods: {},
  data() {
      return {}
  },
  methods: {
    gotoDocs() {
      this.$Message.info('Coming soon');
    }
  }
};
</script>

<style lang="less" scoped>
.nav {
    top: 0;
    // position: fixed;
    z-index: 2;
    width: 100%;
    padding: 10px 0;
    border-bottom: 1px solid #f1f1f1;
}
</style>
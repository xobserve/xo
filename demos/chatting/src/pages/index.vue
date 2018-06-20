<template>
    <div class="index">
        <Row>
            <Col span="4">
                 <Nav></Nav>
            </Col>
            <Col span="20">
                <div class="main-content">
                    <transition name="fade" mode="out-in">
                            <router-view></router-view> 
                    </transition>
                </div>
            </Col>
        </Row>    
    </div>
</template>
<script>
import Nav from "../components/Nav";
export default {
  name: "Index",
  components: {
    Nav,
  },
  methods: {},
  data() {
      return {}
  } 
};
</script>

<style scoped>
.index {
    margin-top:20px;
    font-size:17px;
}
</style>
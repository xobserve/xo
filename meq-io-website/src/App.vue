<template>
  <div id="app">
    <Nav></Nav>
    <router-view/>
  </div>
</template>

<script>
import Nav from "./components/Nav";
export default {
  name: 'App',
  components: {
    Nav,
  },
  methods: {},
  data() {
      return {}
  } 
}
</script>

<style>
#app {
  padding-bottom: 50px;
}
</style>

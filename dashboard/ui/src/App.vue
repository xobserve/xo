<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>

export default {
  name: 'App',
  data () {
    return {
    }
  },
  methods: {
  },
  mounted: function() {
    this.$Loading.config({
      color: '#20a8d8',
      failedColor: '#f0ad4e',
      height: 3
    });
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
}
</style>


<style lang="less" scoped> 
</style>
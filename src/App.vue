<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <range-selector msg="Welcome to Your Vue.js App"/>
</template>

<script>
import RangeSelector from './components/VTTCueBuilder.vue'

export default {
  name: 'App',
  components: {
    RangeSelector
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

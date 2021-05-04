<template>
  <div class="notice">Click on green bar to simulate creating a VTT Cue at a point in time. The bar is calibrated to 120 seconds</div>
  <div class="header" @click="addCuePointer">
    <div class="builder-tester" :class="{'active': cue.active}"
      v-bind:style="{left: cue.leftPos}" v-for="cue in cueList" 
      :key="cue.id" @click.stop="activateCue($event, cue.id)">
      <span v-if="cue.active" >{{cue.startTime}} secs</span>
      <button class="cue-creator"></button>
      <cue-builder v-if="cue.active" @click.stop.prevent></cue-builder>
    </div>
  </div>
</template>

<script>
const CueBuilder = defineAsyncComponent(
  () => import("./components/VTTCueBuilder.vue")
);

import { ref, defineAsyncComponent } from "vue";

export default {
  name: 'App',
  setup() {
    const showCueBuilder = ref(true);
    const test = ref(null);
    const cueList = ref([])
    const seconds = 120;

    // methods
    const activateCue = (e, id) => {
      // only one cue can be active
      console.log("EVENT :: ", e);
      cueList.value.forEach(el => {
        if (el.id !== id) {
          console.log("CUE STARTS :: ", el.startTime);
          el.active = false
        }
      })
      let cue = cueList.value.find(el => el.id === id);
      cue.active = !cue.active;
    }

    const addCuePointer = (e) => {
      const scale = e.target.offsetWidth/seconds;
      let cue = {};
      cue.id = cueList.value.length;
      cue.leftPos = (e.pageX - 18) + "px";
      cue.active = false;
      // time of cue
      let cueStartTime = e.pageX/scale;
      cue.startTime = Math.round(cueStartTime)
      cueList.value.push(cue);
      console.log("CUE :: ", cue);
      activateCue(e, cue.id);
    }

    return {
      showCueBuilder,
      activateCue,
      test,
      cueList,
      addCuePointer,
    }
  },

  components: {
    CueBuilder
  }
}
</script>

<style scoped lang="scss">
.floating {
  position: absolute;
}
.notice {
  justify-content: center;
  text-align: center;
  font-size: 14px;
  font-family: arial;
  line-height: 16px;
  height: 40px;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  .header {
    display: flex;
    position: relative;
    top: 20px;
    height: 5px;
    width: 100%;
    background: green;
    flex-direction: row;
    span {
      position: absolute;
      left: -18px;
      top: -20px;
      background: #509b4e;
      font-size: 12px;
      font-weight: 700;
      border: 1px solid white;
      padding: 3px;
      border-radius: 5px;
      color: white;
      white-space: nowrap;
    }
    .builder-tester {
      position: absolute;
      top: -7px;
      font-family: Arial, Helvetica, sans-serif;
      &.active {
        &::after {
          content: "✔︎";
          color: green;
          margin: 0 5px;
          position: absolute;
          left: 0px;
          top: 2px;
          font-size: 13px;
          z-index: 101;
        }
      }
      button {
        position: absolute;
        border: 1px solid;
        border-radius: 20px;
        width: 20px;
        height: 20px;
        box-sizing: border-box;
        z-index: 100;
      }
    }
  }
  .separator {
    height: 500px;
  }
}
</style>

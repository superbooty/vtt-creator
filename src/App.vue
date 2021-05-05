<template>
  <div class="notice">Click on green bar to generate a Cue at a point in time of the video. The bar is calibrated to the length of the video</div>
  <div class="video-wrapper">
    <video
      ref="videoPlayerRef"
      class="video-el br-all pos-absolute"
      src="https://assets.contentstack.io/v3/assets/bltab687eb09ed92451/blt0516a2ddf86d32f7/60256c5f5f9b2812764c3de9/levisSeasonalSample.mp4"
      playsinline
      crossorigin
      controls="controls"
      preload="none"
      loop
      type="video/mp4"
      width="500"
      height="300" 
    >
    </video>
  </div>
  <div class="header" ref="headerRef">
    <div v-bind:style="{width: currentPlayTime}" @click="addCuePointer"></div>
  </div>
  <div class="builder-tester" :class="{'active': cue.active}"
    v-bind:style="{left: cue.leftPos}" v-for="cue in cueList" 
    :key="cue.id" @click.stop="activateCue($event, cue.id)">
    <span v-if="cue.active" >{{cue.startTime}} secs</span>
    <button class="cue-creator"></button>
    <cue-builder v-if="cue.active" @click.stop.prevent></cue-builder>
  </div>
</template>

<script>
const CueBuilder = defineAsyncComponent(
  () => import("./components/VTTCueBuilder.vue")
);

import { ref, defineAsyncComponent, onMounted } from "vue";

export default {
  name: 'App',
  setup() {
    const videoPlayerRef = ref(null);
    const headerRef = ref(null);
    const showCueBuilder = ref(true);
    const test = ref(null);
    const cueList = ref([])
    const seconds = ref(0);
    const currentPlayTime = ref(0);

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
      videoPlayerRef.value.pause();
      videoPlayerRef.value.currentTime = cue.startTime;
      cue.active = !cue.active;
    }

    const addCuePointer = (e) => {
      const scale = headerRef.value.offsetWidth/seconds.value;
      let cue = {};
      cue.id = cueList.value.length;
      cue.leftPos = (e.pageX - 18) + "px";
      cue.active = false;
      // time of cue
      let cueStartTime = e.pageX/scale;
      cue.startTime = Math.round(cueStartTime);
      cueList.value.push(cue);
      console.log("CUE :: ", cue);
      activateCue(e, cue.id);
    }

     // hooks
    onMounted(() => {
      let scale = 0;
      videoPlayerRef.value.load();
      videoPlayerRef.value.onloadedmetadata = function() {
          console.log("LENGTH :: ", this.duration);
          seconds.value = Math.round(this.duration);
          scale = headerRef.value.offsetWidth/seconds.value;
      };
      videoPlayerRef.value.ontimeupdate = function() {
        currentPlayTime.value = Math.round(this.currentTime * scale) + "px";
        console.log("pLAYING TIME :: ", currentPlayTime.value);
      }
    });

    return {
      showCueBuilder,
      activateCue,
      test,
      cueList,
      addCuePointer,
      videoPlayerRef,
      currentPlayTime,
      headerRef
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
  .builder-tester {
      position: relative;
      top: 7px;
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
  .header {
    display: flex;
    position: relative;
    top: 20px;
    height: 5px;
    width: 100%;
    background: #e6e6e6;
    flex-direction: row;
    div {
      background-color: #509b4e;
      width: 90%; /* Adjust with JavaScript */
    }
  }
  .separator {
    height: 500px;
  }
}
</style>

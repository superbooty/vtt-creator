<template>
  <section class="header">
    <span class="menu-cue"></span>
    <span class="menu-lbl" @click="showMenu = !showMenu">
      <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTMgNmgtMTN2LTRoMTN2NHptMCA0aC0xM3Y0aDEzdi00em0wIDhoLTEzdjRoMTN2LTR6bTMtOGw0IDUuMDc1IDQtNS4wNzVoLTh6Ii8+PC9zdmc+">
    </span>
    <div class="notice">Click on green bar to generate a Cue at a point in time of the video. The bar is calibrated to the length of the video</div>
    <ul class="menu" :class="{'off': !showMenu}">
      <li class="menu-item" @click="downloadVTT">Download VTT</li>
    </ul>
  </section>
  <div class="app-body">
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
    <div class="progress" ref="progressRef">
      <div v-bind:style="{width: currentPlayTime}" @click="addCuePointer"></div>
    </div>
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

import { ref, defineAsyncComponent, onMounted } from "vue";
import {appState} from "@/state/appState";
import {downloadToFile} from "@/utils/FileUtils";

export default {
  name: 'App',
  setup() {
    const videoPlayerRef = ref(null);
    const progressRef = ref(null);
    const showCueBuilder = ref(true);
    const test = ref(null);
    const cueList = ref([])
    const seconds = ref(0);
    const currentPlayTime = ref(0);
    const showMenu = ref(false);

    const {stringifyVTT} = appState();

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
      const scale = progressRef.value.offsetWidth/seconds.value;
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

    const downloadVTT = () => {
      downloadToFile(stringifyVTT(), "vtt-meta.json", "application/json");
    }

     // hooks
    onMounted(() => {
      let scale = 0;
      videoPlayerRef.value.load();
      videoPlayerRef.value.onloadedmetadata = function() {
          console.log("LENGTH :: ", this.duration);
          seconds.value = Math.round(this.duration);
          scale = progressRef.value.offsetWidth/seconds.value;
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
      progressRef,
      showMenu,
      downloadToFile,
      downloadVTT
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
  line-height: 40px;
  height: 40px;
}
.header {
  margin: 0 0 10px;
  height: 42px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  border-bottom: 1px solid #d0d0d0;
  .menu-cue {
    height: 40px;
    width: 5px;
    background: #457dff;
    position: absolute;
    left: 0px;
    top: 2px;
  }
  .comm {
    position: absolute;
    left: 60px;
    top: 12px;
    line-height: 24px;
    font-size: 20px;
    &::after {
      content: "⇄";
    }
  }
  .menu-lbl {
    font-size: 12px;
    position: absolute;
    width: 18px;
    height: 18px;
    top: 4px;
    left: 12px;
    padding: 8px;
    border-right: 1px solid #dcdcdc;
    img {
      height: 18px;
    }
  }
  .menu-btn {
    position: absolute;
    -webkit-transition: all .250s;
    transition: all .250s;
    left: 0px;
    top: 6px;
    padding: 4px;
    transform: rotate(-90deg);
    transition: all .250s;
    background: #ededed;
    border-radius: 34px;
    z-index: 10000;
    &.active {
      transform: rotate(0deg);
      background: #457eff;
    }
    &:hover {
      background: red;
      background: #457eff;
    }
  }
  .menu {
    position: absolute;
    top: 30px;
    // left: 12px;
    padding: 0px;
    width: 300px;
    padding: 5px;
    max-height: 50vh;
    height: 50vh;
    transition: all .250s;
    text-align: left;
    list-style-type: none;
    background: white;
    z-index: 10000;
    box-sizing: border-box;
    border-left: 5px solid #457dff;
    border-right: 1px solid gray;
    border-bottom: 1px solid gray;
    li {
      border-bottom: 1px solid #efefef;
      line-height: 30px;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 1.1px;
      &.on {
        &::after {
          content: "✔︎";
          color: green;
          margin: 0 5px;
        }
      }
    }
    &.off {
      overflow: hidden;
      max-height: 0;
      visibility: hidden;
      padding: 0 0 0 5px;
    }
  }
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  .app-body {
    margin: 8px;
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
    .progress {
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
}
</style>

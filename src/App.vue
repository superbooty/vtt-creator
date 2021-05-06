<template>
  <section class="header" ref="headerRef">
    <span class="menu-cue"></span>
    <span class="menu-lbl" @click="showMenu = !showMenu">
      <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTMgNmgtMTN2LTRoMTN2NHptMCA0aC0xM3Y0aDEzdi00em0wIDhoLTEzdjRoMTN2LTR6bTMtOGw0IDUuMDc1IDQtNS4wNzVoLTh6Ii8+PC9zdmc+">
    </span>
    <span v-if="previewVid" class="preview"></span>
    <div class="notice">Click on the blue progress bar to generate a VTT Cue as the video plays. The bar is calibrated to the length of the video</div>
    <ul class="menu" :class="{'off': !showMenu}">
      <li class="menu-item" @click="downloadVTT">Download VTT</li>
      <li class="menu-item" :class="{'on': previewVid}" @click="previewVideo">Preview Video with VTT</li>
    </ul>
  </section>
  <div class="app-body">
    <preview v-if="previewVid">
    </preview>
    <div v-show="!previewVid" class="video-wrapper">
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
    <template v-if="!previewVid">
      <div class="progress" ref="progressRef">
        <div v-bind:style="{width: playPos}" @click="addCuePointer">
          <span class="vid-time" v-bind:style="{left: playPos}">{{currentPlayTime}} seconds</span>
        </div>
      </div>
      <div class="builder-tester" :class="{'active': cue.active, 'saved': cue.saved}"
        v-bind:style="{left: cue.leftPos}" v-for="cue in cueList" 
        :key="cue.id" @click.stop="activateCue($event, cue.id)">
        <!-- <span v-if="cue.active" >{{cue.startTime}} secs</span> -->
        <button class="cue-creator" :class="{'active': cue.active, 'saved': cue.saved}"></button>
        <cue-builder :cue="cue" v-if="cue.active" @click.stop.prevent @closeBuilder="closeBuilder"></cue-builder>
      </div>
    </template>
  </div>
</template>

<script>
const Preview = defineAsyncComponent(
  () => import("./components/VideoVTTPreview.vue")
);

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
    const headerRef = ref(null);
    const showCueBuilder = ref(true);
    const test = ref(null);
    const cueList = ref([])
    const seconds = ref(0);
    const currentPlayTime = ref(0);
    const playPos = ref(0);
    const showMenu = ref(false);
    const previewVid = ref(false);

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
      // videoPlayerRef.value.currentTime = cue.startTime;
      cue.active = !cue.active;
    }

    const addCuePointer = (e) => {
      const scale = progressRef.value.offsetWidth/seconds.value;
      let cue = {};
      const generateUUID = () => {
        let
          d = new Date().getTime();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          let r = Math.random() * 16;
          if (d > 0) {
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
          }
          return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
      };
      cue.id = generateUUID;
      cue.leftPos = (e.pageX - 18) + "px";
      cue.active = false;
      cue.saved = false;
      // time of cue
      let cueStartTime = e.pageX/scale;
      cue.startTime = Math.round(cueStartTime);
      cueList.value.push(cue);
      console.log("CUE :: ", cue);
      videoPlayerRef.value.pause();
      activateCue(e, cue.id);
    }

    const closeBuilder = (options) => {
      if (options.delete) {
        cueList.value = cueList.value.filter(function(item) {
            return item.id !== options.cue.id;
        })
      } else {
        options.cue.active = false;
        options.cue.saved = true;
      }
    }

    const downloadVTT = () => {
      downloadToFile(stringifyVTT(), "vtt-meta.json", "application/json");
      showMenu.value = false;
    }

    const previewVideo = () => {
      previewVid.value = !previewVid.value;
      videoPlayerRef.value.pause();
      showMenu.value = false;
    }

     // hooks
    onMounted(() => {
      let scale = 0;
      videoPlayerRef.value.load();
      videoPlayerRef.value.onloadedmetadata = function() {
          console.log("LENGTH :: ", this.duration);
          seconds.value = Math.floor(this.duration);
          scale = progressRef.value.offsetWidth/seconds.value;
      };
      videoPlayerRef.value.ontimeupdate = function() {
        let currentTime = this.currentTime;
        playPos.value = Math.floor(currentTime * scale) + "px";
        currentPlayTime.value = Math.floor(currentTime);
        console.log("pLAYING TIME :: ", playPos.value);
      }
      const hr = headerRef.value;
      window.addEventListener("click", function(e) {
        // close dropdown when clicked outside
        if(!hr.contains(e.target)) {
          showMenu.value = false;
        }
      })
    });

    return {
      showCueBuilder,
      activateCue,
      test,
      cueList,
      addCuePointer,
      videoPlayerRef,
      currentPlayTime,
      playPos,
      progressRef,
      showMenu,
      downloadToFile,
      downloadVTT,
      closeBuilder,
      previewVid,
      previewVideo,
      headerRef
    }
  },

  components: {
    CueBuilder,
    Preview
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
  .preview {
    position: absolute;
    left: 60px;
    top: 4px;
    line-height: 24px;
    font-size: 20px;
    border: 3px solid #457dff;
    border-radius: 30px;
    width: 30px;
    height: 30px;
    &::after {
      content: url("data:image/svg+xml,%3Csvg id='fi_4264841' enable-background='new 0 0 24 24' height='24' viewBox='0 0 512 512' width='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Cpath d='m306 316c0-27.57-22.43-50-50-50s-50 22.43-50 50 22.43 50 50 50 50-22.43 50-50z'%3E%3C/path%3E%3Cpath d='m2.505 309.379c-3.34 3.782-3.34 9.459 0 13.241 1.116 1.263 27.84 31.286 72.361 61.642 53.424 36.426 116.485 61.738 181.134 61.738 64.658 0 127.719-25.318 181.133-61.738 44.521-30.355 71.246-60.378 72.361-61.642 3.34-3.782 3.34-9.459 0-13.241-1.116-1.263-27.84-31.286-72.361-61.642-53.424-36.425-116.484-61.737-181.133-61.737-64.658 0-127.719 25.318-181.133 61.738-44.522 30.355-71.246 60.378-72.362 61.641zm143.495 6.621c0-60.931 49.627-110 110-110 60.463 0 110 49.165 110 110 0 60.931-49.627 110-110 110-60.463 0-110-49.165-110-110zm279.423-52.04c30.496 20.736 52.605 41.702 62.798 52.044-10.121 10.279-32.009 31.043-62.354 51.733-20.774 14.164-47.836 29.776-79.142 41.272 24.213-23.624 39.275-56.588 39.275-93.009 0-36.422-15.062-69.387-39.277-93.012 31.122 11.428 58.029 26.917 78.7 40.972zm-260.148-40.97c-24.213 23.624-39.275 56.589-39.275 93.01 0 36.422 15.062 69.387 39.277 93.012-31.123-11.428-58.03-26.917-78.7-40.972-30.493-20.734-52.603-41.7-62.798-52.044 10.121-10.279 32.009-31.043 62.354-51.733 20.775-14.165 47.837-29.777 79.142-41.273z'%3E%3C/path%3E%3Cpath d='m171 168.775c4.783-2.761 6.422-8.877 3.66-13.66l-30-51.961c-2.761-4.784-8.878-6.422-13.66-3.66-4.783 2.761-6.422 8.877-3.66 13.66l30 51.961c2.774 4.807 8.899 6.409 13.66 3.66z'%3E%3C/path%3E%3Cpath d='m381 99.494c-4.782-2.762-10.899-1.123-13.66 3.66l-30 51.961c-2.762 4.783-1.123 10.899 3.66 13.66 4.762 2.749 10.887 1.144 13.66-3.66l30-51.961c2.762-4.783 1.123-10.899-3.66-13.66z'%3E%3C/path%3E%3Cpath d='m266 136v-60c0-5.523-4.477-10-10-10s-10 4.477-10 10v60c0 5.523 4.477 10 10 10s10-4.477 10-10z'%3E%3C/path%3E%3C/g%3E%3C/svg%3E");
      position: absolute;
      left: 4px;
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
      font-family: Arial, Helvetica, sans-serif;
      button {
        position: absolute;
        border: 1px solid;
        border-radius: 20px;
        width: 20px;
        height: 20px;
        box-sizing: border-box;
        z-index: 100;
        &.active, &.saved {
          z-index: 201;
        }
      }
      &.active, &.saved {
        &::after {
          content: "✔︎";
          color: green;
          margin: 0 5px;
          position: absolute;
          left: 0px;
          top: 2px;
          font-size: 13px;
          z-index: 201;
        }
        span {
          position: absolute;
          left: -18px;
          top: -20px;
          background: green;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid white;
          padding: 3px;
          border-radius: 5px;
          color: white;
          white-space: nowrap;
        }
      }
      &.saved {
        &::after {
          color: #ffffff;
        }
        button {
          background: green;
        }
      }
    }
    .progress {
      display: flex;
      position: relative;
      top: 20px;
      height: 20px;
      width: 100%;
      border-radius: 16px;
      background: #e6e6e6;
      flex-direction: row;
      div {
        background-color: #4e92f7;
        border-radius: 16px;
        .vid-time {
          position: absolute;
          color: #111111;
          top: -15px;
          left: 10px;
          font-size: 12px;
          font-family: arial;
        }
      }
    }
    .separator {
      height: 500px;
    }
  }
}
</style>

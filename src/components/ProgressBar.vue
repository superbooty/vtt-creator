<template>
      <div class="progress-wrapper" >
        <div class="progress" ref="progressRef"
          v-bind:style="{backgroundImage: gradientString}" @click.stop="pbClickEmitter" >
          <span for v-for="cue in cueList" :key="cue.id" 
            v-bind:style="{left: cue.leftPos}" class="poi">
          </span>
        </div>
        <label class="thumb" v-bind:style="{left: thumbPos}"
            @mousedown.self="startSlide">{{thumbLabel}}</label>
            <!-- canvas to hold positioned tick marks -->
        <canvas v-if="ticks" ref="progressTickersRef" class="tickers" width="100" height="35"></canvas>
      </div>
</template>

<script>

import { ref, computed, watch, onMounted } from "vue";

export default {
  name: 'ProgressBar',

  props: {
    cueList: [],
    pos: {
      type: Number
    },
    length: {
      type: Number,
      default: 60
    },
    label: {
      type: String
    },
  },

  emits: ["progress-bar-click", "progress-bar-move"],

  setup(props, {emit}) {
    const slidePos = ref(0)
    const tickerPxWidth = ref(null);
    const progressTickersRef = ref(null);
    const sliding = ref(false);
    const preSlideDelta = ref (0);
    const progressRef = ref(null);
    const scale = ref(1);

    console.log("PROPS :: ", props.length);

    // computed
    const computedProgress = computed(() => {
       return slidePos.value + "px";
       // return props.pos + "px";
    });

    const ticks = computed(() => {
      console.log("... ", props.length)
      return Math.ceil(props.length/5);
    })

    const thumbPos = computed(() => {
      return slidePos.value  - 20 + "px"
    });

    const thumbLabel = computed(() => {
      return props.label != null ? props.label
        : formatCueTime(Math.floor(slidePos.value/scale.value));
    })

    const gradientString = computed(() => {
      return `linear-gradient(to right, #4e92f7 ${computedProgress.value} , #b0b3b7 0px)`;
    })

    // watchers

    watch(() => props.pos, () => {
      // the slider position can be controlled by the parent if necessary
      slidePos.value = props.pos * scale.value;
    });

    // methods
    const startSlide = (e) => {
      sliding.value = true;
      preSlideDelta.value = e.pageX - slidePos.value;
      window.addEventListener("mousemove", slideMe);
      window.addEventListener("mouseup", function mousey() {
        if (sliding.value) {
          sliding.value = false;
          window.removeEventListener("mousemove", slideMe);
          window.removeEventListener("mouseup", mousey);
        }
        emit("progress-bar-move", {
          sliderPos: slidePos.value, 
          scale
        });
      });
    }

    const slideMe = (e) => {
      e.preventDefault();
      if (sliding.value) {
        slidePos.value = e.pageX - preSlideDelta.value;
      }
    }

    const formatCueTime = (timestamp) => {
      var hours = Math.floor(timestamp / 60 / 60);
      // 37
      var minutes = Math.floor(timestamp / 60) - (hours * 60);
      // 42
      var seconds = timestamp % 60;
      return minutes.toString().padStart(2, '0') + ':' +
          seconds.toString().padStart(2, '0');
    }

    const pbClickEmitter = (e) => {
      emit("progress-bar-click", {
          target: e.target, 
          pos: {
            x: e.pageX,
            y: e.pageY
          },
          scale
        });
    }

    const buildCanvasTicks = () => {
      const image = new Image(1, 12)
      image.src = "/images/tick.png";
      const canvas = progressTickersRef.value;
      const ctx = canvas.getContext("2d");
      canvas.width = progressRef.value.offsetWidth;

      console.log("CANVAS WIDTH :: ", canvas.width );
      ctx.translate(0.5, 0.5)
      ctx.font = "100 11px arial gray";
      
      const txWidth = scale.value;
      image.onload = function() {
        for (let i = 0, c = 0; i < ctx.canvas.width; i += txWidth, ++c) {
          ctx.beginPath();
            if (c === 0) {
              ctx.fillStyle = "gray";
              ctx.fillText(c, i + 2, 30);
              ctx.drawImage(image, i, 0);
            }
            let y = 0;
            if (c > 0 && c % 5 === 0) {
              const width = ctx.measureText(c).width;
              if (i + 2 < ctx.canvas.width) {
                ctx.fillText(c, i - (width/2), 30);
              } else {
                ctx.fillText(c, i - (width + 2), 30);
              }
              ctx.drawImage(image, i - 1, y);
            } else {
              ctx.drawImage(image, i - 1, y - 14);
            }
            ctx.stroke();
        }
      };
      
    }

    // hooks
    onMounted(() => {
      progressRef.value.style.width =  `${props.length * 15}px`;
      scale.value = (progressRef.value.offsetWidth/props.length)
      tickerPxWidth.value = `${progressRef.value.offsetWidth/ticks.value}px`;
      console.log("TickerWidth :: ", tickerPxWidth.value, scale.value, ticks.value);
      buildCanvasTicks();
    });

    return {
      pbClickEmitter,
      computedProgress,
      thumbPos,
      slidePos,
      gradientString,
      startSlide,
      slideMe,
      tickerPxWidth,
      progressRef,
      progressTickersRef,
      thumbLabel,
      scale,
      ticks
    }
  }
}
</script>

<style scoped lang="scss">
.tickers {
  position: absolute;
}
.progress-ticks {
  padding: 0;
  margin: 0 10px;
  display: flex;
  list-style-type: none;
  position: absolute;
  .tick {
    // width: calc(1335px/12);
    position: relative;
    span {
      position: absolute;
      top: 30px;
      left: -25px;
      font-size: 12px;
      width: 50px;
      text-align: center;
    }
    &:before {
      // background: repeating-linear-gradient(0.25turn, white, white 20%, #000000 20.5%, white 2px);
      background-image: url(/images/tick-marker2.png);
      content: "";
      background-repeat: no-repeat;
      height: 20px;
      position: absolute;
      top: 10px;
      left: -1px;
      width: 100%;
      background-size: 100%;
      background-position: left 2px;
    }
    &.big {
      font-size: 28px;
      line-height: 24px;
      span {
        top: 30px;
      }
    }
  }
}

.progress-wrapper {
  margin: 0 10px;
  height: 16px;
  .thumb {
    &:hover {
      cursor:grabbing;
    }
    position: relative;
    display: block;
    width: 40px;
    color: #4e91f7;
    font-size: 12px;
    font-weight: 800;
    font-family: arial;
    box-sizing: border-box;
    border: 1px solid #4e91f7;
    padding: 2px 3px;
    border-radius: 16px;
    text-align: center;
    top: -32px;
    &::after {
      content: "△";
      position: absolute;
      top: 34px;
      line-height: 16px;
      left: 11px;
      color: #4e91f7;
      font-size: 16px;
    }
  }
  .progress {
    display: flex;
    height: 10px;
    // width: 100%;
    min-width: 1280px;
    border-radius: 12px;
    background: #e6e6e6;
    background-image: linear-gradient(to right, #4e92f7 0px , #e6e6e6 0px);
    flex-direction: row;
    overflow-y: hidden;
    .poi {
      position: relative;
      z-index: 0;
      &::after {
        position: absolute;
        content: "⫿";
        line-height: 12px;
        font-size: 12px;
        font-weight: 900;
        color: #ffffff;
        left: 8px;
      }
    }
  }
}

</style>

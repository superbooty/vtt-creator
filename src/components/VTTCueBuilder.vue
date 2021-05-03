<template>
  <div class="vtt-inputs">
    <div class="start-time">
      <label >start time</label>
      <input
        class="msg txt-input"
        v-model="vttStart"
        ref="vttStartRef"
        :pattern="inputPattern"
        type="text"
        required
        placeholder="hh:mm:ss"
        @input="inputHandler"
      />
    </div>
    <div class="end-time">
      <label >end time</label>
      <input
        class="msg txt-input"
        v-model="vttEnd"
        ref="vttEndRef"
        :pattern="inputPattern"
        type="text"
        required
        placeholder="hh:mm:ss"
        @input="inputHandler"
      />
    </div>
    <div class="error" :class="{'on': vttError !== null}">{{vttError}}</div>
    <div class="meta-text">
      <label >text</label>
      <textarea
        class="msg txt-input"
        v-model="vttText"
        ref="vttTextRef"
        required
        placeholder="Enter VTT Text"
        @input="inputHandler"
      />
    </div>
    <button class="save-cue" @click="buildVTT">Save Cue</button>
  </div>
</template>

<script>
import { ref } from "vue";
import {appState} from "@/state/appState";

export default {
  props: {
    code: String,
  },

  setup(props) {
    console.log("Item Selector PROPS :: ", props);

    const { state, pushCue } = appState();

    const vttStart = ref("");
    const vttStartRef= ref(null);
    const vttEndRef = ref(null);
    const vttTextRef = ref(null);
    const vttEnd = ref("");
    const vttText = ref("");
    const vttError = ref(null);
    const inputPattern = ref("(?:[01]\\d|2[0123]):(?:[012345]\\d):(?:[012345]\\d)");

    // methods
    const inputHandler = (e) => {
        console.log("changed...", e.target);
        e.target.setCustomValidity("");
    };

    const buildVTT = () => {
      console.log("Building the VTT");
      const start = vttStartRef.value;
      const end = vttEndRef.value;
      const textRef = vttTextRef.value;
      let startSecs = 0;
      let endSecs = 0;
      // .split(':').reduce((acc,time) => (60 * acc) + +time);
      let doNext = true;
      if (start.checkValidity())  {
        startSecs = vttStart.value.split(':').reduce((acc,time) => (60 * acc) + +time);
        console.log("Input is Valid...");
      } else {
        start.setCustomValidity("value does not match pattern hh:mm:ss");
        doNext = false;
        start.reportValidity();
        return;
      }
      if (doNext && end.checkValidity())  {
        endSecs = vttEnd.value.split(':').reduce((acc,time) => (60 * acc) + +time);
        console.log("Input is Valid...");
      } else {
        end.setCustomValidity("value does not match pattern hh:mm:ss");
        doNext = false;
        end.reportValidity();
        return;
      }
      if (doNext && endSecs > startSecs) {
        if (vttText.value.match("^\\d{9}(?:|, \\d{9})+$")) {
          const productArray = vttText.value.split(",");
          vttError.value = null;
          pushCue({startTime: startSecs, endTime: endSecs, text: productArray});
        } else {
          textRef.setCustomValidity("value is not a valid set of product ids");
          textRef.reportValidity();
          vttError.value = "Input is not a list of products";
        }
      }
      console.log("STATE :: ", state);
    }

    return {
      vttStart,
      vttEnd,
      vttText,
      vttStartRef,
      vttEndRef,
      vttTextRef,
      inputHandler,
      buildVTT,
      inputPattern,
      vttError
    };
  },

  components: {},

  mounted() {},

  beforeUnmount() {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .vtt-inputs {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
    width: 340px;
    .error {
      display: none;
      &.on {
        display: block;
        background: #ff8686;
        font-weight: 800;
        border-radius: 6px;
        color: #f7f7f7;
        line-height: 30px;
        width: 100%;
        font-size: 14px;
        margin: 0 10px 15px;
      }
    }
    button {
      width: 100%;
      margin: 5px;
      height: 34px;
      outline: none;
      background:#0b5dcc;
      color: white;
      font-weight: 800;
      box-sizing: border-box;
    }
    .start-time, .end-time, .meta-text {
        position: relative;
        margin-bottom: 20px;
      label {
        position: absolute;
        top: -10px;
        left: 10px;
        font-size: 12px;
        background: white;
        padding: 0 5px;
      }
      input {
        line-height: 30px;
        width: 145px;
        font-size: 14px;
        text-indent: 5px;
        border-radius: 6px;
        border: 1px solid darkgray;
        outline: none;
        &::placeholder {
          color: #b8b7b7;
          font-size: 14px;
          text-align: center;
        }
      }
    }
    .meta-text {
      width: 340px;
      margin: 0;
      label {
        left: 20px;
      }
      textarea {
        width: 320px;
        height: 80px;
        resize: none;
        padding: 10px 5px;
        border: 1px solid darkgray;
        border-radius: 6px;
        box-sizing: border-box;
        outline: none;
        &::placeholder {
          color: #b8b7b7;
          font-size: 14px;
          text-align: center;
        }
      }
    }
  }
</style>

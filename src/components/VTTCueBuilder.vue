<template>
  <div class="vtt-inputs">
    <div v-if="!cue.saved" class="close" @click="deleteCuePointer"></div>
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
import { ref, onMounted } from "vue";
import {appState} from "@/state/appState";

export default {
  props: {
    cue: Object
  },

  setup(props, {emit}) {
    console.log("Item Selector PROPS :: ", props);

    const { pushCue} = appState();

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
        e.target.setCustomValidity("");
    };

    const deleteCuePointer = () => {
      emit("close-builder", {cue: props.cue, delete: true});
    }

    const buildVTT = () => {
      console.log("Building the VTT");
      const start = vttStartRef.value;
      const end = vttEndRef.value;
      const textRef = vttTextRef.value;
      let startSecs = 0;
      let endSecs = 0;
      // .split(':').reduce((acc,time) => (60 * acc) + +time);
      if (start.checkValidity())  {
        startSecs = vttStart.value.split(':').reduce((acc,time) => (60 * acc) + +time);
        console.log("Input is Valid...");
      } else {
        start.setCustomValidity("value does not match pattern hh:mm:ss");
        start.reportValidity();
        return;
      }
      if (end.checkValidity())  {
        endSecs = vttEnd.value.split(':').reduce((acc,time) => (60 * acc) + +time);
        console.log("Input is Valid...");
      } else {
        end.setCustomValidity("value does not match pattern hh:mm:ss");
        end.reportValidity();
        return;
      }
      if (endSecs > startSecs) {
        if (vttText.value.match("^\\d{9}(?:|,?(| )\\d{9})*$")) {
          const productArray = vttText.value.split(",").map(item=>item.trim());
          vttError.value = null;
          console.log('IN CUE :: ', props.cue);
          pushCue({id: props.cue.id, startTime: props.cue.startTime, endTime: endSecs, text: productArray});
          // console.log("VTT OBJ :: ", state.value.vttObj);
          // all good close the cue
          emit("close-builder", {cue: props.cue, delete: false});
        } else {
          textRef.setCustomValidity("value is not a valid set of product ids");
          textRef.reportValidity();
          vttError.value = "Input is not a list of products, make sure that you type in a list of pc9s separated by commas";
        }
      } else {
        vttError.value = "Cue End Time must be greater than Start Time";
      }
    }

    const formatCueTime = (timestamp) => {
      var hours = Math.floor(timestamp / 60 / 60);
      // 37
      var minutes = Math.floor(timestamp / 60) - (hours * 60);
      // 42
      var seconds = timestamp % 60;
      return hours.toString().padStart(2, '0') + ':' +
        minutes.toString().padStart(2, '0') + ':' +
          seconds.toString().padStart(2, '0');
    }

    // hooks
    onMounted(() => {
      vttStart.value = formatCueTime(props.cue.startTime);
      // end time as a default is 2 seconds after star time
      vttEnd.value = formatCueTime(props.cue.startTime + 2);
      vttText.value = props.cue.text;
    })

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
      vttError,
      deleteCuePointer,
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
    display: inline-flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
    width: 340px;
    position: absolute;
    top: 30px;
    left: -10px;
    border: 1px solid #dfdfdf;
    padding: 30px 0 10px;
    border-radius: 10px;
    background: #eeeeee;
    &::after {
      content: '';
      width: 0;
      height: 0;
      border: 10px solid transparent;
      border-bottom-color: #eee;
      border-top-width: 0px;
      left: 10px;
      top: -10px;
      position: absolute;
      clear: both;
    }
    .error {
      display: none;
      &.on {
        display: block;
        background: #ff8686;
        font-weight: 800;
        border-radius: 6px;
        color: #f7f7f7;
        line-height: 16px;
        width: 100%;
        font-size: 14px;
        margin: 0 10px 15px;
        padding: 10px;
        text-align: left;
      }
    }
    .close {
      position: absolute;
      top: -5px;
      right: -5px;
      border-radius: 18px;
      width: 18px;
      height: 18px;
      background: #eeeeee;
    padding: 4px;
      &::after {
        content: '✖️';
        position: relative;
        top: -4px;
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
      display: flex;
      justify-content: center;
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

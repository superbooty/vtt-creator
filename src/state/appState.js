// store/todos.js
import {ref } from "vue";

const state = ref({
    vttObj: {vttType: "metadata",
        vttCues: [],
    },
});

export function appState() {
    // do the registration here
    const pushCue = (cue) => {
        state.value.vttObj.vttCues.push(cue);
    }
    const stringifyVTT = () => {
        return JSON.stringify(state.value.vttObj, null, 2);
    }   
    return {state, pushCue, stringifyVTT};
}

export default {
    appState
}
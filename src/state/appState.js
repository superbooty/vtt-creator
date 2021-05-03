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
    return {state, pushCue};
}

export default {
    appState
}
// Modified from https://gitlab.com/tozd/vue/snackbar-que
import Vue from 'vue';

const globalState = Vue.observable({ queue: [] });
let lastSnackbarId = 0;

function snackbar(data) {
  globalState.queue.push({
    data, //{text OR content, callback, callbackName} // content is logContent
    id: ++lastSnackbarId,
    enqueuedAt: new Date(),
    shown: false,
  });
}

export { snackbar, globalState }

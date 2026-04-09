import { reactive } from 'vue';

type QueueItem = {
  data: unknown,
  id: number,
  enqueuedAt: Date,
  shown: boolean,
}

const globalState = reactive({ queue: [] as QueueItem[] });
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

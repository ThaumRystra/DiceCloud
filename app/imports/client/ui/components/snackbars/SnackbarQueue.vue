<template lang="html">
  <v-snackbar
    bottom
    left
    outlined
    color="accent"
    v-bind="$attrs"
    :value="isShown"
    :timeout="timeout"
    @input="value => isShown = value"
  >
    <div class="layout align-center">
      <template v-if="snackbar && snackbar.data">
        <div v-if="snackbar.data.text">
          {{ snackbar.data.text }}
        </div>
        <template v-else-if="snackbar.data.content">
          <log-content :model="snackbar.data.content" />
        </template>
        <v-spacer />
        <v-btn
          v-if="snackbar.data.callback"
          color="primary"
          text
          @click="closeSnackbar(); snackbar.data.callback()"
        >
          {{ snackbar.data.callbackName }}
        </v-btn>
      </template>
    </div>
    <template #action="{ attrs }">
      <v-btn
        icon
        v-bind="attrs"
        @click="closeSnackbar"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="js">
// Modified from https://gitlab.com/tozd/vue/snackbar-queue
import { globalState } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import LogContent from '/imports/client/ui/log/LogContent.vue';

export default {
  components: {
    LogContent,
  },
  props: {
    timeout: {
      type: Number,
      default: 15000,
    },
    pause: {
      type: Number,
      default: 300,
    },
  },
  data() {
    return {
      isShown: false,
      snackbar: null,
    };
  },
  watch: {
    isShown(newValue) {
      if (newValue === false && this.snackbar) {
        const snackbarIndex = globalState.queue.findIndex((element) => element.id === this.snackbar.id);
        if (snackbarIndex > -1) {
          globalState.queue.splice(snackbarIndex, 1);
        }
        this.snackbar = null;
      }
    },
  },
  created() {
    this.handle = null;
    this.unwait = null;
    this.showNextSnackbar();
  },
  methods: {
    clearSnackbarState() {
      if (this.handle) {
        clearTimeout(this.handle);
        this.handle = null;
      }

      if (this.unwait) {
        this.unwait();
        this.unwait = null;
      }
    },
    showNextSnackbar() {
      this.clearSnackbarState();

      // Wait for the first next snackbar to be available.
      this.unwait = this.$wait(function () {
        // Snackbars are enqueued from oldest to newest and "find" searches array elements in
        // same order as well, so the first one which matches is also the oldest one.
        return globalState.queue.find((element) => element.shown === false);
      }, function (snackbar) {
        this.unwait = null;

        snackbar.shown = true;

        this.snackbar = snackbar;
        this.isShown = true;

        this.handle = setTimeout(() => {
          this.handle = null;

          this.showNextSnackbar();
        }, this.timeout + this.pause);
      });
    },
    closeSnackbar() {
      this.clearSnackbarState();

      this.isShown = false;

      setTimeout(() => {
        this.showNextSnackbar();
      }, this.pause);
    },
  },
};
</script>

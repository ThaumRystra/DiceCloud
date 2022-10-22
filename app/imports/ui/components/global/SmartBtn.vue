<template lang="html">
  <v-btn 
    v-bind="$attrs"
    :disabled="isDisabled"
    :loading="loading"
    @click="click"
  >
    <slot />
  </v-btn>
</template>

<script lang="js">
import { debounce } from 'lodash';
import { snackbar } from '/imports/ui/components/snackbars/SnackbarQueue.js';

export default {
  inject: {
    context: { default: {} }
  },
  props: {
    disabled: Boolean,
    debounce: {
      type: Number,
      default: undefined,
    },
  },
  data() {
    return {
      loading: false,
      timesClicked: 0,
    };
  },
  computed: {
    isDisabled(){
      return this.context.editPermission === false || this.disabled;
    },
    debounceTime() {
      if (Number.isFinite(this.debounce)){
        return this.debounce;
      } else if (Number.isFinite(this.context.debounceTime)){
        return this.context.debounceTime;
      } else {
        return 750;
      }
    },
  },
  created(){
    this.debounceClicks = debounce(this.clicks, this.debounceTime);
  },
  beforeDestroy(){
    this.debounceClicks.flush();
  },
  methods: {
    click() {
      this.timesClicked += 1;
      this.debounceClicks();
      this.$emit('click', this.acknowledgeChange);
    },
    clicks() {
      this.$emit('clicks', this.timesClicked, this.acknowledgeChange);
      this.loading = true;
      this.timesClicked = 0;
    },
    acknowledgeChange(error){
      this.loading = false;
      if (error) {
        snackbar({ text: error.reason || error.message || error.toString() });
      }
    },
  },
};
</script>

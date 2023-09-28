<template lang="html">
  <v-btn 
    v-bind="$attrs"
    :disabled="isDisabled"
    :loading="loading"
    @click.stop.prevent="click"
  >
    <slot />
  </v-btn>
</template>

<script lang="js">
import { debounce } from 'lodash';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';

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
    singleClick: Boolean,
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
        return 400;
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
      if (this.singleClick) {
        this.loading = true;
      } else {
        this.timesClicked += 1;
        this.debounceClicks();
      }
      this.$emit('click', this.acknowledgeChange);
    },
    clicks() {
      if (!this.$listeners?.clicks) return;
      this.loading = true;
      this.$emit('clicks', this.timesClicked, this.acknowledgeChange);
      this.timesClicked = 0;
    },
    acknowledgeChange(error) {      
      this.loading = false;
      if (error) {
        console.error(error)
        snackbar({ text: error.reason || error.message || error.toString() });
      }
    },
  },
};
</script>

<template lang="html">
  <v-snackbar
    v-if="snackbar"
    :key="snackbar.text"
    auto-height
    bottom
    :value="true"
    :timeout="0"
  >
    {{ snackbar.text }}
    <v-btn
      v-if="snackbar.callback"
      class="primary--text"
      flat
      icon
      @click="doCallback"
    >
      {{ snackbar.callbackName }}
    </v-btn>
    <v-btn
      v-if="snackbar.showCloseButton"
      flat
      icon
      @click="$store.dispatch('closeSnackbar')"
    >
      <v-icon>close</v-icon>
    </v-btn>
  </v-snackbar>
</template>

<script>
export default {
  computed: {
    snackbar(){
      return this.$store.state.snackbars.snackbars[0];
    }
  },
  methods: {
    doCallback(){
      this.snackbar.callback();
      this.$store.dispatch('closeSnackbar')
    }
  }
}
</script>

<style lang="css" scoped>
</style>

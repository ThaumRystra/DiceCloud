<template lang="html">
  <div
    v-if="errors && errors.length"
    class="error-list"
  >
    <v-slide-x-transition
      group
      hide-on-leave
    >
      <v-alert
        v-for="error in errors"
        :key="error.message"
        :value="true"
        :icon="errorIcon(error.type)"
        :color="errorColor(error.type)"
        outline
      >
        {{ error.message }}
      </v-alert>
    </v-slide-x-transition>
  </div>
</template>

<script>
export default {
  props: {
    errors: {
      type: Array,
      default: undefined,
    },
  },
  methods: {
    errorIcon(type){
      if (type === 'subsitution'){
        return 'info';
      } else if (type === 'evaluation'){
        return 'warning';
      } else {
        return 'error'
      }
    },
    errorColor(type){
      if (type === 'subsitution'){
        return 'info';
      } else if (type === 'evaluation'){
        return 'warning';
      } else {
        return 'error'
      }
    },
  }
}
</script>

<style lang="css" scoped>
</style>
